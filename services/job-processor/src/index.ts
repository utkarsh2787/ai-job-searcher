import * as dotenv from 'dotenv';
dotenv.config();

import { startConsumer } from './kafka/consumer';
import { disconnectProducer } from './kafka/producer';
import { disconnectRedis } from './deduplication/redis-check';

async function main(): Promise<void> {
  console.log('═══════════════════════════════════');
  console.log('  Job Processor Service starting   ');
  console.log('═══════════════════════════════════');

  await startConsumer();
}

main().catch((err) => {
  console.error('[fatal] Job processor crashed:', err);
  process.exit(1);
});

async function shutdown(): Promise<void> {
  console.log('[shutdown] Gracefully shutting down...');
  await Promise.allSettled([disconnectProducer(), disconnectRedis()]);
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
