import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/api-utils';
import { db } from '@/lib/db';
import { pushRealtimeEvent } from '@/lib/realtime';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.sessions.delete({ where: { id: session.id } });
  pushRealtimeEvent('presence', {
    userId: session.userId,
    username: session.username,
    status: 'offline',
    lastSeen: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
