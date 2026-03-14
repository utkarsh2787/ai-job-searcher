import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getDb } from './client';

export async function runMigrations(): Promise<void> {
  const sql = getDb();

  // Track applied migrations in a simple table
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename  VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();  // lexicographic sort — 001, 002, 003...

  for (const file of files) {
    const already = await sql`
      SELECT filename FROM schema_migrations WHERE filename = ${file}
    `;

    if (already.length > 0) {
      console.log(`[migrations] Skipping ${file} (already applied)`);
      continue;
    }

    const migrationSql = readFileSync(join(migrationsDir, file), 'utf8');

    // Execute the entire file as one call — splitting by ';' breaks
    // dollar-quoted DO $$ ... $$ blocks that contain semicolons internally.
    await sql.unsafe(migrationSql);

    await sql`
      INSERT INTO schema_migrations (filename) VALUES (${file})
    `;

    console.log(`[migrations] Applied ${file}`);
  }

  console.log('[migrations] All migrations up to date');
}
