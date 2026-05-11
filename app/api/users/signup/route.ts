import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession, validatePasswordStrength } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      return NextResponse.json({ error: 'Username must be 3-24 characters and use only letters, numbers, or underscores' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors.join('. ') }, { status: 400 });
    }

    // Check if username already exists
    const existingUserByUsername = await db.users.findFirst({ where: { username: normalizedUsername } });
    if (existingUserByUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Check if email already exists
    const existingUserByEmail = await db.users.findFirst({ where: { email: normalizedEmail } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const user = await db.users.create({
      data: {
        id: userId,
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
    });

    const session = createSession(user.id, user.username);
    await db.sessions.create({
      data: {
        id: session.token,
        userId: session.userId,
        username: session.username,
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
      },
    });

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
      session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
