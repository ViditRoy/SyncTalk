'use client';

import { useState, useMemo } from 'react';
import { Message } from '@/lib/store';

interface MessageSearchProps {
  messages: Message[];
  onFilter: (filtered: Message[]) => void;
}

export function MessageSearch({ messages, onFilter }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'sender' | 'content'>('all');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages;
    }

    const query = searchQuery.toLowerCase();

    return messages.filter((msg) => {
      if (searchType === 'content') {
        return msg.content.toLowerCase().includes(query);
      }
      if (searchType === 'sender') {
        return msg.senderUsername.toLowerCase().includes(query);
      }
      // 'all'
      return (
        msg.content.toLowerCase().includes(query) ||
        msg.senderUsername.toLowerCase().includes(query)
      );
    });
  }, [messages, searchQuery, searchType]);

  // Notify parent of filtered results
  useMemo(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border">
      <input
        type="text"
        placeholder="Search messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value as any)}
        className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">All</option>
        <option value="content">Content</option>
        <option value="sender">Sender</option>
      </select>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="px-2 py-2 text-muted-foreground hover:text-foreground transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}
