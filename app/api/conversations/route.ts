import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/api-utils';
import { pushRealtimeEvent } from '@/lib/realtime';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await db.conversations.findMany();
    const filtered = conversations.filter((conversation) => conversation.members.includes(session.userId));
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, members, isDirect, recipientId, description } = await request.json();
    const allUsers = await db.users.findMany();
    const validUserIds = new Set(allUsers.map((user) => user.id));

    if (isDirect) {
      if (!recipientId) {
        return NextResponse.json({ error: 'recipientId is required for direct messages' }, { status: 400 });
      }
      if (recipientId === session.userId) {
        return NextResponse.json({ error: 'Cannot create a direct message with yourself' }, { status: 400 });
      }
      if (!validUserIds.has(recipientId)) {
        return NextResponse.json({ error: 'Recipient user does not exist' }, { status: 404 });
      }
    }

    const requestedMembers = Array.isArray(members) ? members.filter((member): member is string => typeof member === 'string') : [];
    const uniqueMembers = Array.from(new Set([session.userId, ...requestedMembers]));
    const invalidMembers = uniqueMembers.filter((memberId) => !validUserIds.has(memberId));

    if (invalidMembers.length > 0) {
      return NextResponse.json({ error: 'One or more selected members do not exist' }, { status: 400 });
    }

    if (!isDirect && uniqueMembers.length < 2) {
      return NextResponse.json({ error: 'A group needs at least two members' }, { status: 400 });
    }

    if (!isDirect && uniqueMembers.length > 50) {
      return NextResponse.json({ error: 'Groups can have up to 50 members' }, { status: 400 });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';

    if (!isDirect && (trimmedName.length < 2 || trimmedName.length > 40)) {
      return NextResponse.json({ error: 'Group name must be between 2 and 40 characters' }, { status: 400 });
    }

    if (trimmedDescription.length > 160) {
      return NextResponse.json({ error: 'Description can be up to 160 characters' }, { status: 400 });
    }

    const conversationMembers = isDirect ? [session.userId, recipientId] : uniqueMembers;
    const conversationId = isDirect
      ? `dm-${[session.userId, recipientId].sort().join('-')}`
      : `conv-${crypto.randomUUID()}`;

    const existing = await db.conversations.findUnique({ where: { id: conversationId } });
    if (existing) {
      return NextResponse.json(existing);
    }

    const conversation = await db.conversations.create({
      data: {
        id: conversationId,
        name: isDirect ? trimmedName || recipientId : trimmedName,
        description: trimmedDescription,
        createdAt: new Date().toISOString(),
        members: conversationMembers,
        isDirect: Boolean(isDirect),
        recipientId: recipientId || null,
      },
    });

    pushRealtimeEvent('conversation', conversation, conversation.members);
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
