'use client';

import React from "react"

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { useToast } from '@/hooks/use-toast';

export function MessageInput() {
  const { sendMessage, setTyping, activeConversation } = useChat();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTypingLocal(true);
      setTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      setTyping(false);
    }, 1000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    if (!activeConversation) {
      toast({
        title: 'No conversation selected',
        description: 'Please select or create a conversation before sending messages.',
        variant: 'destructive',
      });
      return;
    }

    const result = sendMessage(message);

    if (!result.success) {
      toast({
        title: 'Send failed',
        description: result.error || 'Unable to send message.',
        variant: 'destructive',
      });
      return;
    }

    setMessage('');
    setIsTypingLocal(false);
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 border-t border-border">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-24"
          rows={1}
        />
        <button
          type="submit"
          disabled={!message.trim() || !activeConversation}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex-shrink-0"
        >
          Send
        </button>
      </div>
    </form>
  );
}
