import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/api-utils';
import { pushRealtimeEvent } from '@/lib/realtime';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, isTyping } = await request.json();
    if (!conversationId || typeof isTyping !== 'boolean') {
      return NextResponse.json({ error: 'conversationId and isTyping are required' }, { status: 400 });
    }

    const conversation = await db.conversations.findUnique({ where: { id: conversationId } });
    if (!conversation || !conversation.members.includes(session.userId)) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const payload = {
      conversationId,
      userId: session.userId,
      username: session.username,
      isTyping,
    };

    pushRealtimeEvent('typing', payload, conversation.members);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending typing event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
