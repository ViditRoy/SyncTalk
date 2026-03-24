'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      router.push('/chat');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">SyncTalk</h1>
          <p className="text-muted-foreground text-lg">Real-time Messaging Platform</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-lg space-y-6">
          <p className="text-center text-muted-foreground">
            Experience instant messaging with typing indicators, presence tracking, and real-time updates.
          </p>

          <div className="space-y-3">
            <Link href="/signup">
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Create Account
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Sign In
              </button>
            </Link>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">Demo Features:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Real-time messaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Typing indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>User presence tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Multiple conversations</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Demo Mode • All data is session-based
        </p>
      </div>
    </main>
  );
}
