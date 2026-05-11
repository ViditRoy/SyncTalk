import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/api-utils';
import { pushRealtimeEvent } from '@/lib/realtime';

const MAX_MESSAGE_LENGTH = 2000;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const conversations = await db.conversations.findMany();
    const allowedConversationIds = new Set(
      conversations
        .filter((conversation) => conversation.members.includes(session.userId))
        .map((conversation) => conversation.id),
    );

    if (conversationId) {
      if (!allowedConversationIds.has(conversationId)) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const messages = await db.messages.findMany({ where: { conversationId } });
      return NextResponse.json(messages);
    }

    const messages = await db.messages.findMany();
    return NextResponse.json(messages.filter((message) => allowedConversationIds.has(message.conversationId)));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, content } = await request.json();
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!conversationId || !trimmedContent) {
      return NextResponse.json({ error: 'Conversation ID and message content are required' }, { status: 400 });
    }
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters` }, { status: 400 });
    }

    const conversation = await db.conversations.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    if (!conversation.members.includes(session.userId)) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messageId = crypto.randomUUID();
    const message = await db.messages.create({
      data: {
        id: messageId,
        conversationId,
        senderId: session.userId,
        senderUsername: session.username,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        status: 'sent',
        readBy: [session.userId],
      },
    });

    pushRealtimeEvent('message', message, conversation.members);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
