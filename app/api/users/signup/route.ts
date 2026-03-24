import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Check if username already exists
    const existingUserByUsername = await db.users.findFirst({ where: { username: username.toLowerCase() } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Check if email already exists
    const existingUserByEmail = await db.users.findFirst({ where: { email: email.toLowerCase() } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const { hashPassword } = await import('@/lib/auth');
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = Math.random().toString(36).substr(2, 9);
    const user = await db.users.create({
      data: {
        id: userId,
        username: username.trim(),
        email: email.trim(),
        passwordHash,
        createdAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}