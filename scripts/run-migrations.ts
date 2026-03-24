import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Create libSQL client (same as in lib/db/connection.ts)
const client = createClient({
  url: 'file:data/syncTalk.db',
});

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'lib', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

      // Split by statement-breakpoint and execute each statement
      const statements = migrationSQL.split('--> statement-breakpoint');
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          await client.execute(trimmed);
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigrations();