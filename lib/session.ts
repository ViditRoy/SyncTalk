import { Session, isSessionExpired } from './auth';

export class SessionManager {
  private static storageKey = 'synctalk_session';

  static saveSession(session: Session): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  static getSession(): Session | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;

    try {
      const session: Session = JSON.parse(stored);

      // Check if session is expired
      if (isSessionExpired(session.createdAt)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to parse session:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  static clearSession(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('user');
  }

  static getCurrentUser(): { id: string; username: string } | null {
    const session = this.getSession();
    if (!session) return null;

    return {
      id: session.userId,
      username: session.username,
    };
  }

  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + 30 * 60 * 1000;
      this.saveSession(session);
    }
  }
}
