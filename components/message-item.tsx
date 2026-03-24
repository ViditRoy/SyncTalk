'use client';

import { Message } from '@/lib/store';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const date = new Date(message.createdAt);
  const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
          isCurrentUser ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        {message.senderUsername.charAt(0).toUpperCase()}
      </div>
      <div className={`flex flex-col gap-1 max-w-xs ${isCurrentUser ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{message.senderUsername}</span>
          <span className="text-xs text-muted-foreground">{timeString}</span>
        </div>
        <div
          className={`px-4 py-2 rounded-lg text-sm break-words ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-foreground'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
