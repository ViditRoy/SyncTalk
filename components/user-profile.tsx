'use client';

import { useState } from 'react';
import { mockUsers } from '@/lib/store';

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          View Profile
        </button>
      ) : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-sm w-full shadow-lg">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-secondary-foreground">
                    {getInitials(user.username)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(user.status || 'offline')}`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary-foreground mb-1">{user.username}</h2>
              <p className="text-sm text-primary-foreground/80 capitalize">{user.status || 'offline'}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm text-foreground mt-1">{user.email || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Member Since</p>
                <p className="text-sm text-foreground mt-1">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">User ID</p>
                <p className="text-sm text-foreground mt-1 font-mono">{user.id}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition">
                  Message
                </button>
                <button className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition">
                  Block User
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground border-t border-border transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
