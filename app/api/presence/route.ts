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

    const users = await db.users.findMany();
    const settings = await db.userSettings.findMany();
    const sessions = await db.sessions.findMany();
    const now = Date.now();
    const activeUserIds = new Set(
      sessions
        .filter((session) => {
          const expiresAt = Date.parse(session.expiresAt);
          return !Number.isNaN(expiresAt) && expiresAt > now;
        })
        .map((session) => session.userId),
    );

    const presence = users.map((user) => {
      const userSetting = settings.find((setting) => setting.userId === user.id);
      const isActive = activeUserIds.has(user.id);
      return {
        userId: user.id,
        username: user.username,
        status: isActive ? userSetting?.status ?? 'online' : 'offline',
        lastSeen: new Date().toISOString(),
      };
    });

    return NextResponse.json(presence);
  } catch (error) {
    console.error('Error fetching presence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedSettings = await db.userSettings.upsert({
      where: { userId: session.userId },
      update: { status },
      create: {
        userId: session.userId,
        notifications: true,
        soundEnabled: true,
        status,
        privateMessages: 'all',
        readReceipts: true,
        lastActivityVisible: true,
      },
    });

    const presence = {
      userId: session.userId,
      username: session.username,
      status: updatedSettings.status,
      lastSeen: new Date().toISOString(),
    };

    pushRealtimeEvent('presence', presence);
    return NextResponse.json(presence);
  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
