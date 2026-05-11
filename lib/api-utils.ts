import { NextRequest } from 'next/server';
import { db } from './db';
import { isSessionExpired } from './auth';

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sessionText = localStorage.getItem('synctalk_session');
  if (!sessionText) return {};

  try {
    const session = JSON.parse(sessionText);
    return { Authorization: `Bearer ${session.token}` };
  } catch {
    return {};
  }
}

export async function getAuthToken(request: NextRequest): Promise<string | null> {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }

  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  return tokenFromQuery || null;
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = await getAuthToken(request);
  if (!token) return null;

  const session = await db.sessions.findFirst({ where: { id: token } });
  if (!session) return null;

  const expiresAt = typeof session.expiresAt === 'string' ? Date.parse(session.expiresAt) : session.expiresAt;
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    await db.sessions.delete({ where: { id: token } });
    return null;
  }

  return session;
}
