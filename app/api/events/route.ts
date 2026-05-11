import { NextRequest } from 'next/server';
import { createSSEStream } from '@/lib/realtime';
import { getSessionFromRequest } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  return new Response(createSSEStream(session.userId), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
