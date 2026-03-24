// In-memory store for demo purposes
export interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string;
  createdAt: string;
  status?: 'online' | 'offline' | 'away';
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  isTyping?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[];
  readByUsers?: string[]; // Array of user IDs who have read this message
}

export interface Conversation {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: string[];
  lastMessage?: Message;
  isDirect?: boolean;
  recipientId?: string;
}

export interface Presence {
  userId: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// Function to get all users (from database)
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return mockUsers; // Fallback to mock users
  }
}

// Demo data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    username: 'Bob',
    email: 'bob@example.com',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    username: 'Charlie',
    email: 'charlie@example.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'General',
    description: 'General discussion channel',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    members: ['1', '2', '3'],
    isDirect: false,
  },
  {
    id: 'conv-2',
    name: 'Development',
    description: 'Development and technical discussions',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    members: ['1', '2'],
    isDirect: false,
  },
  {
    id: 'conv-3',
    name: 'Random',
    description: 'Off-topic conversations',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    members: ['1', '3'],
    isDirect: false,
  },
  {
    id: 'dm-1-2',
    name: 'Bob',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    members: ['1', '2'],
    isDirect: true,
    recipientId: '2',
  },
  {
    id: 'dm-1-3',
    name: 'Charlie',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    members: ['1', '3'],
    isDirect: true,
    recipientId: '3',
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: '1',
    senderUsername: 'Alice',
    content: 'Hey everyone! Welcome to SyncTalk! 👋',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: '2',
    senderUsername: 'Bob',
    content: 'Thanks Alice! Excited to try this out.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: '3',
    senderUsername: 'Charlie',
    content: 'This is awesome! Real-time messaging ftw! 🚀',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: '1',
    senderUsername: 'Alice',
    content: 'Let\'s discuss the new feature implementation',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: '2',
    senderUsername: 'Bob',
    content: 'Sure! I have some ideas on the architecture',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dm-msg-1',
    conversationId: 'dm-1-2',
    senderId: '1',
    senderUsername: 'Alice',
    content: 'Hey Bob! How are you?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'dm-msg-2',
    conversationId: 'dm-1-2',
    senderId: '2',
    senderUsername: 'Bob',
    content: 'Hi Alice! Doing great, thanks for asking!',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'dm-msg-3',
    conversationId: 'dm-1-3',
    senderId: '3',
    senderUsername: 'Charlie',
    content: 'Alice, check out this new feature!',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export const mockPresence: Presence[] = [
  {
    userId: '1',
    username: 'Alice',
    status: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    userId: '2',
    username: 'Bob',
    status: 'online',
    lastSeen: new Date().toISOString(),
  },
  {
    userId: '3',
    username: 'Charlie',
    status: 'away',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

// Function to get initial presence including all users
export function getInitialPresence(): Presence[] {
  const presenceMap = new Map<string, Presence>();

  // First, add demo users' presence
  mockPresence.forEach((p) => {
    presenceMap.set(p.userId, p);
  });

  // Then, add newly created users with online status
  if (typeof window !== 'undefined') {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    Object.values(storedUsers).forEach((user: any) => {
      if (!presenceMap.has(user.id)) {
        presenceMap.set(user.id, {
          userId: user.id,
          username: user.username,
          status: 'online',
          lastSeen: new Date().toISOString(),
        });
      }
    });
  }

  return Array.from(presenceMap.values());
}
