import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  username: text('username').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  notifications: integer('notifications', { mode: 'boolean' }).notNull().default(true),
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).notNull().default(true),
  status: text('status').notNull().default('online'),
  privateMessages: text('private_messages').notNull().default('all'),
  readReceipts: integer('read_receipts', { mode: 'boolean' }).notNull().default(true),
  lastActivityVisible: integer('last_activity_visible', { mode: 'boolean' }).notNull().default(true),
});

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  members: text('members', { mode: 'json' }).$type<string[]>().notNull(),
  isDirect: integer('is_direct', { mode: 'boolean' }).notNull().default(false),
  recipientId: text('recipient_id'),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  senderUsername: text('sender_username').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  status: text('status').default('sent'),
  readBy: text('read_by', { mode: 'json' }).$type<string[]>().default([]),
});