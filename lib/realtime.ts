const encoder = new TextEncoder();

type RealtimeCallback = (event: string, payload: any) => void;
const clients = new Set<RealtimeCallback>();

type RealtimePayload = any & { __audience?: string[] };

export function createSSEStream(userId: string) {
  let cleanup: (() => void) | undefined;

  return new ReadableStream({
    start(controller) {
      const send = (event: string, payload: RealtimePayload) => {
        if (payload.__audience && !payload.__audience.includes(userId)) return;

        const { __audience, ...publicPayload } = payload;
        const data = `event: ${event}\ndata: ${JSON.stringify(publicPayload)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      clients.add(send);
      controller.enqueue(encoder.encode('retry: 10000\n\n'));

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 20000);

      cleanup = () => {
        clients.delete(send);
        clearInterval(keepAlive);
      };
    },
    cancel() {
      cleanup?.();
    },
  });
}

export function pushRealtimeEvent(event: string, payload: any, audience?: string[]) {
  const eventPayload = audience ? { ...payload, __audience: audience } : payload;

  for (const send of clients) {
    try {
      send(event, eventPayload);
    } catch {
      // Ignore clients that are no longer active.
    }
  }
}
