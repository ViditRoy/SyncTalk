'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/lib/chat-context';
import { useSettings } from '@/lib/settings-context';
import { SessionManager } from '@/lib/session';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { MessageSearch } from './message-search';

export function ChatMain() {
  const router = useRouter();
  const { activeConversation, messages, typingUsers, clearDirectMessageHistory, deleteDirectMessage } = useChat();
  const { settings } = useSettings();
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [filteredMessages, setFilteredMessages] = useState<typeof messages>([]);
  const [showDMOptions, setShowDMOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  const handleClearHistory = () => {
    if (!activeConversation) return;
    if (confirm('Are you sure you want to clear the message history? This cannot be undone.')) {
      clearDirectMessageHistory(activeConversation.id);
      setShowDMOptions(false);
    }
  };

  const handleDeleteConversation = () => {
    if (!activeConversation) return;
    if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      deleteDirectMessage(activeConversation.id);
      setShowDMOptions(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDMOptions && !(event.target as HTMLElement).closest('[data-dm-menu]')) {
        setShowDMOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDMOptions]);

  const conversationMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  const typingUsersList = Array.from(typingUsers.values());

  // Auto-scroll to bottom
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(scrollTimeout);
  }, [conversationMessages, typingUsersList]);

  if (!activeConversation || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select a conversation</h2>
          <p className="text-muted-foreground">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{activeConversation.name}</h1>
          {activeConversation.description && (
            <p className="text-sm text-muted-foreground">{activeConversation.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Members: {activeConversation.members.length}</p>
          </div>
          
          {/* Direct Message Options */}
          {activeConversation.isDirect && (
            <div className="relative" data-dm-menu>
              <button
                onClick={() => setShowDMOptions(!showDMOptions)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg"
                title="More options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              
              {showDMOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleClearHistory}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
                  >
                    Clear message history
                  </button>
                  <button
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    Delete conversation
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => router.push('/settings')}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No messages yet in this conversation.</p>
              <p className="text-sm text-muted-foreground">Be the first to send a message! 👇</p>
            </div>
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUser.id}
              />
            ))}

            {/* Typing indicators */}
            {typingUsersList.length > 0 && (
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce animate-bounce-delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce animate-bounce-delay-200"></div>
                </div>
                <span>
                  {typingUsersList.length === 1
                    ? `${typingUsersList[0]} is typing`
                    : `${typingUsersList.join(', ')} are typing`}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}
