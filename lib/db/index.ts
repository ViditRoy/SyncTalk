import fs from 'fs';
import path from 'path';
import { db as drizzleDb } from './connection';
import { eq, or } from 'drizzle-orm';
import * as schema from './schema';

const DB_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json');
const CONVERSATIONS_FILE = path.join(DB_DIR, 'conversations.json');
const MESSAGES_FILE = path.join(DB_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper functions for JSON fallback
function readJsonFile(filePath: string): any {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeJsonFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Try to use SQLite, fallback to JSON files
let useSQLite = true; // libsql should work without native compilation

// Database operations
export const db = {
  // Users
  users: {
    async findMany() {
      if (useSQLite) {
        return await drizzleDb.select().from(schema.users);
      }
      const data = readJsonFile(USERS_FILE);
      return Object.values(data);
    },
    async findUnique({ where: { id } }: { where: { id: string } }) {
      if (useSQLite) {
        const result = await drizzleDb.select().from(schema.users).where(eq(schema.users.id, id));
        return result[0] || null;
      }
      const data = readJsonFile(USERS_FILE);
      return data[id] || null;
    },
    async findFirst({ where }: { where: any }) {
      if (useSQLite) {
        // Handle OR queries for login (username OR email)
        if (where.OR) {
          const conditions = where.OR.map((condition: any) => {
            if (condition.username) {
              return eq(schema.users.username, condition.username.toLowerCase());
            }
            if (condition.email) {
              return eq(schema.users.email, condition.email.toLowerCase());
            }
            return null;
          }).filter(Boolean);

          if (conditions.length > 0) {
            const result = await drizzleDb.select().from(schema.users).where(or(...conditions));
            return result[0] || null;
          }
          return null;
        }

        // Handle simple queries
        if (where.username) {
          const result = await drizzleDb.select().from(schema.users).where(eq(schema.users.username, where.username.toLowerCase()));
          return result[0] || null;
        }
        if (where.email) {
          const result = await drizzleDb.select().from(schema.users).where(eq(schema.users.email, where.email.toLowerCase()));
          return result[0] || null;
        }
        return null;
      }

      // JSON fallback
      const data = readJsonFile(USERS_FILE);
      const users = Object.values(data) as any[];

      // Handle OR queries for login
      if (where.OR) {
        for (const condition of where.OR) {
          if (condition.username) {
            const user = users.find((user: any) => user.username?.toLowerCase() === condition.username?.toLowerCase());
            if (user) return user;
          }
          if (condition.email) {
            const user = users.find((user: any) => user.email?.toLowerCase() === condition.email?.toLowerCase());
            if (user) return user;
          }
        }
        return null;
      }

      // Handle simple username query
      if (where.username) {
        return users.find((user: any) => user.username?.toLowerCase() === where.username?.toLowerCase()) || null;
      }

      // Handle email query
      if (where.email) {
        return users.find((user: any) => user.email?.toLowerCase() === where.email?.toLowerCase()) || null;
      }

      return null;
    },
    async create({ data: userData }: { data: any }) {
      if (useSQLite) {
        const result = await drizzleDb.insert(schema.users).values(userData).returning();
        return result[0];
      }
      const data = readJsonFile(USERS_FILE);
      data[userData.id] = userData;
      writeJsonFile(USERS_FILE, data);
      return userData;
    },
  },

  // Sessions
  sessions: {
    async findFirst({ where: { id } }: { where: { id: string } }) {
      if (useSQLite) {
        const result = await drizzleDb.select().from(sessions).where(eq(sessions.id, id));
        return result[0] || null;
      }
      const data = readJsonFile(SESSIONS_FILE);
      return data[id] || null;
    },
    async create({ data: sessionData }: { data: any }) {
      if (useSQLite) {
        const result = await drizzleDb.insert(sessions).values(sessionData).returning();
        return result[0];
      }
      const data = readJsonFile(SESSIONS_FILE);
      data[sessionData.id] = sessionData;
      writeJsonFile(SESSIONS_FILE, data);
      return sessionData;
    },
    async delete({ where: { id } }: { where: { id: string } }) {
      if (useSQLite) {
        await drizzleDb.delete(schema.sessions).where(eq(schema.sessions.id, id));
        return;
      }
      const data = readJsonFile(SESSIONS_FILE);
      delete data[id];
      writeJsonFile(SESSIONS_FILE, data);
    },
  },

  // Settings
  userSettings: {
    async findUnique({ where: { userId } }: { where: { userId: string } }) {
      if (useSQLite) {
        const result = await drizzleDb.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId));
        return result[0] || null;
      }
      const data = readJsonFile(SETTINGS_FILE);
      return data[userId] || null;
    },
    async upsert({ where: { userId }, update, create }: { where: { userId: string }, update: any, create: any }) {
      if (useSQLite) {
        const result = await drizzleDb.insert(schema.userSettings)
          .values({ ...create, userId })
          .onConflictDoUpdate({
            target: schema.userSettings.userId,
            set: update
          })
          .returning();
        return result[0];
      }
      const data = readJsonFile(SETTINGS_FILE);
      const existing = data[userId];
      if (existing) {
        data[userId] = { ...existing, ...update };
      } else {
        data[userId] = { id: userId, userId, ...create };
      }
      writeJsonFile(SETTINGS_FILE, data);
      return data[userId];
    },
  },

  // Conversations
  conversations: {
    async findMany() {
      if (useSQLite) {
        return await drizzleDb.select().from(conversations);
      }
      const data = readJsonFile(CONVERSATIONS_FILE);
      return Object.values(data);
    },
    async findUnique({ where: { id } }: { where: { id: string } }) {
      if (useSQLite) {
        const result = await drizzleDb.select().from(conversations).where(eq(conversations.id, id));
        return result[0] || null;
      }
      const data = readJsonFile(CONVERSATIONS_FILE);
      return data[id] || null;
    },
    async create({ data: convData }: { data: any }) {
      if (useSQLite) {
        const result = await drizzleDb.insert(conversations).values(convData).returning();
        return result[0];
      }
      const data = readJsonFile(CONVERSATIONS_FILE);
      data[convData.id] = convData;
      writeJsonFile(CONVERSATIONS_FILE, data);
      return convData;
    },
    async update({ where: { id }, data: updateData }: { where: { id: string }, data: any }) {
      if (useSQLite) {
        const result = await drizzleDb.update(schema.conversations)
          .set(updateData)
          .where(eq(schema.conversations.id, id))
          .returning();
        return result[0] || null;
      }
      const data = readJsonFile(CONVERSATIONS_FILE);
      if (data[id]) {
        data[id] = { ...data[id], ...updateData };
        writeJsonFile(CONVERSATIONS_FILE, data);
        return data[id];
      }
      return null;
    },
  },

  // Messages
  messages: {
    async findMany({ where: { conversationId } }: { where: { conversationId: string } }) {
      if (useSQLite) {
        return await drizzleDb.select().from(messages).where(eq(messages.conversationId, conversationId));
      }
      const data = readJsonFile(MESSAGES_FILE);
      return Object.values(data).filter((msg: any) => msg.conversationId === conversationId);
    },
    async create({ data: msgData }: { data: any }) {
      if (useSQLite) {
        const result = await drizzleDb.insert(schema.messages).values(msgData).returning();
        return result[0];
      }
      const data = readJsonFile(MESSAGES_FILE);
      data[msgData.id] = msgData;
      writeJsonFile(MESSAGES_FILE, data);
      return msgData;
    },
  },
};

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  notifications: boolean;
  soundEnabled: boolean;
  status: string;
  privateMessages: string;
  readReceipts: boolean;
  lastActivityVisible: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: string[];
  isDirect: boolean;
  recipientId?: string;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  status: string;
  readBy: string[];
}