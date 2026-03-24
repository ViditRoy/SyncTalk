'use client';

import { useChat } from '@/lib/chat-context';

export function PresencePanel() {
  const { presence } = useChat();

  const onlineUsers = presence.filter((p) => p.status === 'online');
  const awayUsers = presence.filter((p) => p.status === 'away');

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Users</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {onlineUsers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {awayUsers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Away ({awayUsers.length})
            </h3>
            <div className="space-y-2">
              {awayUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-muted-foreground">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
