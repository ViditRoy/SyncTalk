'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, Conversation, Presence } from './store';
import { SessionManager } from './session';

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  presence: Presence[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation) => void;
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  setTyping: (isTyping: boolean) => void;
  typingUsers: Map<string, string>;
  createDirectMessage: (recipientId: string, recipientUsername?: string) => Promise<void>;
  createGroupConversation: (name: string, memberIds: string[], description?: string) => Promise<{ success: boolean; error?: string }>;
  getUnreadCount: (conversationId: string) => number;
  clearDirectMessageHistory: (conversationId: string) => void;
  deleteDirectMessage: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sessionText = localStorage.getItem('synctalk_session');
  if (!sessionText) return {};

  try {
    const session = JSON.parse(sessionText);
    return { Authorization: `Bearer ${session.token}` };
  } catch {
    return {};
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const initializeData = async () => {
      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem('user');
      const storedSession = localStorage.getItem('synctalk_session');
      if (!storedUser || !storedSession) return;

      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      const headers = getAuthHeaders();

      try {
        const [conversationRes, messageRes, presenceRes] = await Promise.all([
          fetch('/api/conversations', { headers }),
          fetch('/api/messages', { headers }),
          fetch('/api/presence', { headers }),
        ]);

        if ([conversationRes, messageRes, presenceRes].some((response) => response.status === 401)) {
          SessionManager.clearSession();
          window.location.assign('/login');
          return;
        }

        if (conversationRes.ok) {
          const apiConversations = await conversationRes.json();
          setConversations(apiConversations || []);
          if (apiConversations.length > 0) {
            setActiveConversationState(apiConversations[0]);
          }
        }

        if (messageRes.ok) {
          setMessages(await messageRes.json());
        }

        if (presenceRes.ok) {
          setPresence(await presenceRes.json());
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
      }

      try {
        const token = JSON.parse(storedSession).token;
        eventSource = new EventSource(`/api/events?token=${token}`);

        eventSource.addEventListener('message', (event) => {
          try {
            const incoming: Message = JSON.parse(event.data);
            if (!incoming?.id) return;
            setMessages((current) => (current.some((m) => m.id === incoming.id) ? current : [...current, incoming]));
          } catch (error) {
            console.error('Realtime message parse error:', error);
          }
        });

        eventSource.addEventListener('conversation', (event) => {
          try {
            const conversation: Conversation = JSON.parse(event.data);
            setConversations((current) => (current.some((c) => c.id === conversation.id) ? current : [...current, conversation]));
          } catch (error) {
            console.error('Realtime conversation parse error:', error);
          }
        });

        eventSource.addEventListener('presence', (event) => {
          try {
            const updatedPresence: Presence = JSON.parse(event.data);
            setPresence((current) => {
              const next = current.filter((item) => item.userId !== updatedPresence.userId);
              return [...next, updatedPresence];
            });
          } catch (error) {
            console.error('Realtime presence parse error:', error);
          }
        });

        eventSource.addEventListener('typing', (event) => {
          try {
            const payload = JSON.parse(event.data);
            setTypingUsers((current) => {
              const next = new Map(current);
              if (payload.isTyping) {
                next.set(payload.userId, payload.username);
              } else {
                next.delete(payload.userId);
              }
              return next;
            });
          } catch (error) {
            console.error('Realtime typing parse error:', error);
          }
        });

        eventSource.onerror = () => {
          eventSource?.close();
        };
      } catch (error) {
        console.error('EventSource setup failed:', error);
      }
    };

    initializeData();

    return () => {
      eventSource?.close();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
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
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            conversationId: activeConversation.id,
            content: content.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, error: errorData?.error || 'Failed to send message' };
        }

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        return { success: true };
      } catch (error) {
        console.error('sendMessage failed:', error);
        return { success: false, error: 'Failed to send message. Please try again.' };
      }
    },
    [activeConversation, currentUser],
  );

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!currentUser || !activeConversation) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(currentUser.id, currentUser.username);
        } else {
          next.delete(currentUser.id);
        }
        return next;
      });

      try {
        await fetch('/api/typing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            conversationId: activeConversation.id,
            isTyping,
          }),
        });
      } catch (error) {
        console.error('Failed to broadcast typing state:', error);
      }
    },
    [activeConversation, currentUser],
  );

  const createDirectMessage = useCallback(
    async (recipientId: string, recipientUsername?: string) => {
      if (!currentUser || recipientId === currentUser.id) return;
      if (!recipientId) {
        console.error('createDirectMessage called without a recipientId');
        return;
      }

      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            name: recipientUsername || `User ${recipientId}`,
            isDirect: true,
            recipientId,
          }),
        });

        if (!response.ok) {
          const rawText = await response.text().catch(() => '');
          let parsedError: string | Record<string, unknown> | null = null;

          if (rawText) {
            try {
              parsedError = JSON.parse(rawText);
            } catch {
              parsedError = rawText;
            }
          }

          const errorDetail = parsedError ?? (rawText || 'No response body');
          console.warn('Failed to create direct message conversation', {
            status: response.status,
            statusText: response.statusText,
            error: errorDetail,
            requestBody: {
              name: recipientUsername || `User ${recipientId}`,
              isDirect: true,
              recipientId,
            },
          });

          toast?.({
            title: 'Unable to open direct message',
            description: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
            variant: 'destructive',
          });

          return;
        }

        const conversation = await response.json();
        setConversations((prev) => (prev.some((conv) => conv.id === conversation.id) ? prev : [...prev, conversation]));
        setActiveConversationState(conversation);
      } catch (error) {
        console.warn('Error creating direct message:', error);
        toast?.({
          title: 'Unable to open direct message',
          description: 'Network or unexpected error creating the direct message.',
          variant: 'destructive',
        });
      }
    },
    [currentUser],
  );

  const createGroupConversation = useCallback(
    async (name: string, memberIds: string[], description?: string) => {
      if (!currentUser) {
        return { success: false, error: 'No user is signed in.' };
      }

      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            name,
            description,
            members: memberIds,
            isDirect: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          return { success: false, error: errorData?.error || 'Failed to create group' };
        }

        const conversation = await response.json();
        setConversations((prev) => (prev.some((conv) => conv.id === conversation.id) ? prev : [...prev, conversation]));
        setActiveConversationState(conversation);
        return { success: true };
      } catch (error) {
        console.error('createGroupConversation failed:', error);
        return { success: false, error: 'Failed to create group. Please try again.' };
      }
    },
    [currentUser],
  );

  const getUnreadCount = useCallback(
    (conversationId: string) => {
      if (!currentUser) return 0;
      return messages.filter((msg) => msg.conversationId === conversationId && msg.senderId !== currentUser.id && !(msg.readBy || []).includes(currentUser.id)).length;
    },
    [messages, currentUser],
  );

  const clearDirectMessageHistory = useCallback((conversationId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.conversationId !== conversationId));
  }, []);

  const deleteDirectMessage = useCallback((conversationId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    setMessages((prev) => prev.filter((msg) => msg.conversationId !== conversationId));
    setActiveConversationState((prev) => (prev?.id === conversationId ? null : prev));
  }, []);

  const setActiveConversation = useCallback(
    (conv: Conversation) => {
      setActiveConversationState(conv);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.conversationId === conv.id && msg.senderId !== currentUser?.id) {
            const readBy = msg.readBy || [];
            if (!readBy.includes(currentUser!.id)) {
              return { ...msg, readBy: [...readBy, currentUser!.id] };
            }
          }
          return msg;
        }),
      );
    },
    [currentUser],
  );

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
        createGroupConversation,
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
