'use client';

import React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Message,
  Conversation,
  Presence,
  mockMessages,
  mockConversations,
  mockPresence,
  mockUsers,
  getAllUsers,
  getInitialPresence,
} from './store';

// Shared message store using localStorage as source of truth
const MESSAGES_STORAGE_KEY = 'synctalk_messages';
const CONVERSATIONS_STORAGE_KEY = 'synctalk_conversations';

function loadMessagesFromStorage(): Message[] {
  if (typeof window === 'undefined') return mockMessages;
  const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockMessages;
}

function loadConversationsFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return mockConversations;
  const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockConversations;
}

function saveMessagesToStorage(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  // Database persistence is handled through API routes
}

function saveConversationsToStorage(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  // Database persistence is handled through API routes
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  presence: Presence[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation) => void;
  sendMessage: (content: string) => { success: boolean; error?: string };
  setTyping: (isTyping: boolean) => void;
  typingUsers: Map<string, string>;
  createDirectMessage: (recipientId: string, recipientUsername?: string) => void;
  getUnreadCount: (conversationId: string) => number;
  clearDirectMessageHistory: (conversationId: string) => void;
  deleteDirectMessage: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Initialize demo data from storage
  useEffect(() => {
    const initializeData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }

      // Load messages and conversations from storage (shared across all tabs/windows)
      const loadedMessages = loadMessagesFromStorage();
      const loadedConversations = loadConversationsFromStorage();

      setMessages(loadedMessages);
      setConversations(loadedConversations);

      // Load presence data (now async)
      const initialPresence = await getInitialPresence();
      setPresence(initialPresence);

      if (loadedConversations.length > 0) {
        setActiveConversation(loadedConversations[0]);
      }
    };

    initializeData();
  }, []);

  const sendMessage = useCallback(
    (content: string): { success: boolean; error?: string } => {
      if (!content.trim()) {
        return { success: false, error: 'Cannot send an empty message.' };
      }

      if (!currentUser) {
        return { success: false, error: 'No user is signed in.' };
      }

      if (!activeConversation) {
        return { success: false, error: 'No active conversation selected.' };
      }

      try {
        const trimmedContent = content.trim();

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          conversationId: activeConversation.id,
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          content: trimmedContent,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => {
          const updated = [...prev, newMessage];
          saveMessagesToStorage(updated);
          return updated;
        });

        // Update conversation last message
        setConversations((prev) => {
          const updated = prev.map((conv) =>
            conv.id === activeConversation.id ? { ...conv, lastMessage: newMessage } : conv,
          );
          saveConversationsToStorage(updated);
          return updated;
        });

        // Clear typing indicator
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(currentUser.id);
          return next;
        });

        return { success: true };
      } catch (error) {
        console.error('sendMessage failed:', error);
        return { success: false, error: 'Failed to send message. Please try again.' };
      }
    },
    [activeConversation, currentUser],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentUser) return;

      if (isTyping) {
        setTypingUsers((prev) => new Map(prev).set(currentUser.id, currentUser.username));
      } else {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(currentUser.id);
          return next;
        });
      }
    },
    [currentUser],
  );

  const createDirectMessage = useCallback(
    (recipientId: string, recipientUsername?: string) => {
      if (!currentUser || recipientId === currentUser.id) return;

      const conversationId = `dm-${currentUser.id}-${recipientId}`;
      const existingConv = conversations.find((c) => c.id === conversationId);

      // Use provided username or try to find it
      let username = recipientUsername;
      if (!username) {
        // Fallback: try to get from stored users (this should be avoided in production)
        try {
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const user = storedUsers.find((u: any) => u.id === recipientId);
          username = user?.username;
        } catch {
          username = `User ${recipientId}`;
        }
      }

      if (existingConv) {
        // Update existing conversation with current recipient name
        const updatedConv = { ...existingConv, name: username };
        setConversations((prev) => {
          const updated = prev.map((c) => (c.id === conversationId ? updatedConv : c));
          saveConversationsToStorage(updated);
          return updated;
        });
        setActiveConversationState(updatedConv);
      } else {
        const newConversation: Conversation = {
          id: conversationId,
          name: username,
          createdAt: new Date().toISOString(),
          members: [currentUser.id, recipientId],
          isDirect: true,
          recipientId: recipientId,
        };
        setConversations((prev) => {
          const updated = [...prev, newConversation];
          saveConversationsToStorage(updated);
          return updated;
        });
        setActiveConversationState(newConversation);
      }
    },
    [currentUser, conversations, setActiveConversationState],
  );

  // Mark messages as read when conversation is opened
  const setActiveConversation = useCallback(
    (conv: Conversation) => {
      if (!currentUser) return;

      setActiveConversationState(conv);

      // Mark all messages in this conversation as read by current user
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          if (msg.conversationId === conv.id && msg.senderId !== currentUser.id) {
            const readByUsers = msg.readByUsers || [];
            if (!readByUsers.includes(currentUser.id)) {
              return { ...msg, readByUsers: [...readByUsers, currentUser.id] };
            }
          }
          return msg;
        });
        saveMessagesToStorage(updated);
        return updated;
      });
    },
    [currentUser],
  );

  // Calculate unread count for a conversation
  const getUnreadCount = useCallback(
    (conversationId: string): number => {
      if (!currentUser) return 0;

      return messages.filter((msg) => {
        // Count messages that are:
        // 1. In this conversation
        // 2. NOT sent by current user
        // 3. NOT read by current user (not in readByUsers array)
        return (
          msg.conversationId === conversationId &&
          msg.senderId !== currentUser.id &&
          !(msg.readByUsers || []).includes(currentUser.id)
        );
      }).length;
    },
    [messages, currentUser],
  );

  // Clear message history for sender in a direct message conversation
  const clearDirectMessageHistory = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;

      // Remove all messages in this conversation
      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.conversationId !== conversationId);
        saveMessagesToStorage(updated);
        return updated;
      });
    },
    [currentUser],
  );

  // Delete entire direct message conversation for sender
  const deleteDirectMessage = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;

      // Remove conversation
      setConversations((prev) => {
        const updated = prev.filter((conv) => conv.id !== conversationId);
        saveConversationsToStorage(updated);
        return updated;
      });

      // Remove all messages in this conversation
      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.conversationId !== conversationId);
        saveMessagesToStorage(updated);
        return updated;
      });

      // Set active conversation to first available
      setActiveConversationState(null);
    },
    [currentUser],
  );

  // Simulate real-time presence updates
  useEffect(() => {
    const interval = setInterval(async () => {
      // Update existing presence and include any newly created users
      const currentPresence = await getInitialPresence();
      setPresence(
        currentPresence.map((p) => ({
          ...p,
          lastSeen: new Date().toISOString(),
        })),
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync messages and conversations from storage (for cross-browser/tab communication)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const storedMessages = loadMessagesFromStorage();
      const storedConversations = loadConversationsFromStorage();
      
      setMessages(storedMessages);
      setConversations(storedConversations);
    }, 1000); // Check for updates every second

    return () => clearInterval(syncInterval);
  }, []);

  // Sync presence to include newly created users
  useEffect(() => {
    const presenceSyncInterval = setInterval(() => {
      setPresence(getInitialPresence());
    }, 1000); // Check for new users every second

    return () => clearInterval(presenceSyncInterval);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        presence,
        activeConversation,
        setActiveConversation,
        sendMessage,
        setTyping,
        typingUsers,
        createDirectMessage,
        getUnreadCount,
        clearDirectMessageHistory,
        deleteDirectMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
