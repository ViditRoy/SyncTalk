import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'file:data/syncTalk.db';

const client = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    console.log(`Database: ${databaseUrl}`);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS __synctalk_migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);

    const applied = await client.execute('SELECT id FROM __synctalk_migrations');
    const appliedMigrationIds = new Set(applied.rows.map((row) => String(row.id)));

    const migrationsDir = path.join(process.cwd(), 'lib', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (appliedMigrationIds.has(file)) {
        console.log(`Skipping migration: ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      const statements = migrationSQL.split('--> statement-breakpoint');

      for (const statement of statements) {
        const trimmed = statement
          .trim()
          .replace(/^CREATE TABLE `/i, 'CREATE TABLE IF NOT EXISTS `')
          .replace(/^CREATE UNIQUE INDEX `/i, 'CREATE UNIQUE INDEX IF NOT EXISTS `');

        if (trimmed && !trimmed.startsWith('--')) {
          await client.execute(trimmed);
        }
      }

      await client.execute({
        sql: 'INSERT INTO __synctalk_migrations (id, applied_at) VALUES (?, ?)',
        args: [file, new Date().toISOString()],
      });
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

runMigrations();
