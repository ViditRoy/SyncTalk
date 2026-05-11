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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.userId;

    if (userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const settings = await db.userSettings.findUnique({ where: { userId } });
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, ...settings } = await request.json();
    if (!userId || userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const updatedSettings = await db.userSettings.upsert({
      where: { userId },
      update: settings,
      create: { userId, ...settings },
    });

    pushRealtimeEvent('presence', {
      userId: session.userId,
      username: session.username,
      status: updatedSettings.status,
      lastSeen: new Date().toISOString(),
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
