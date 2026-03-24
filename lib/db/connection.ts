import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create libSQL client (pure JavaScript SQLite)
const client = createClient({
  url: 'file:data/syncTalk.db',
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export for migration purposes
export { sqlite };