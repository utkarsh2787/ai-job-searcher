import * as dotenv from 'dotenv';
dotenv.config();

import { runMigrations } from './db/migrate';
import { closeDb } from './db/client';
import { startConsumer } from './consumers/processed-job.consumer';
import { rebuildAllSnapshots } from './snapshots/snapshot-builder';
import { config } from './config';

async function main(): Promise<void> {
  console.log('═══════════════════════════════════');
  console.log('  Analytics Service starting       ');
  console.log('═══════════════════════════════════');

  // Apply any pending migrations before consuming events
  await runMigrations();

  // Build initial snapshots (tables may be empty — that's fine)
  await rebuildAllSnapshots().catch((err) =>
    console.warn('[startup] Initial snapshot build skipped:', err.message)
  );

  // Schedule recurring snapshot rebuilds
  const intervalMs = config.SNAPSHOT_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    rebuildAllSnapshots().catch((err) =>
      console.error('[snapshots] Rebuild failed:', err.message)
    );
  }, intervalMs);

  console.log(`[snapshots] Scheduled rebuild every ${config.SNAPSHOT_INTERVAL_MINUTES}m`);

  // Start consuming events
  await startConsumer();
}

main().catch((err) => {
  console.error('[fatal] Analytics service crashed:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('[shutdown] Closing DB connection...');
  await closeDb();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});
