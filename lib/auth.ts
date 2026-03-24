// Simple password hashing function using crypto (production should use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashOfInput = await hashPassword(password);
  return hashOfInput === hash;
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate session token
export function generateSessionToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Check if session is expired (30 minutes)
export function isSessionExpired(createdAt: number): boolean {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  return Date.now() - createdAt > SESSION_TIMEOUT;
}

// Session type
export interface Session {
  token: string;
  userId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

// Create a new session
export function createSession(userId: string, username: string): Session {
  const createdAt = Date.now();
  const expiresAt = createdAt + 30 * 60 * 1000; // 30 minutes

  return {
    token: generateSessionToken(),
    userId,
    username,
    createdAt,
    expiresAt,
  };
}
