import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create libSQL client (pure JavaScript SQLite)
const client = createClient({
  url: process.env.DATABASE_URL || 'file:data/syncTalk.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

