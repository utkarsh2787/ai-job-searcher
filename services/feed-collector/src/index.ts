import * as dotenv from 'dotenv';
dotenv.config();

import { collectRemotive } from './collectors/remotive.collector';
import { collectAdzuna } from './collectors/adzuna.collector';
import { collectTheMuse } from './collectors/themuse.collector';
import { disconnectProducer } from './kafka/producer';
import { startScheduler } from './scheduler';

async function runInitialCollection(): Promise<void> {
  console.log('[startup] Running initial collection from all sources...');
  await Promise.allSettled([
    collectRemotive(),
    collectAdzuna(),
    collectTheMuse(),
  ]);
  console.log('[startup] Initial collection complete.');
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════');
  console.log('  Feed Collector Service starting  ');
  console.log('═══════════════════════════════════');

  // Collect immediately on startup so we don't wait for the first cron tick
  await runInitialCollection();

  // Then schedule recurring polls
  startScheduler();
}

main().catch((err) => {
  console.error('[fatal] Feed collector crashed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[shutdown] SIGTERM received, disconnecting...');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[shutdown] SIGINT received, disconnecting...');
  await disconnectProducer();
  process.exit(0);
});
