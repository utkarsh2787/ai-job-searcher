import * as dotenv from 'dotenv';
dotenv.config();

import { waitForElasticsearch, getElasticsearchClient } from './elasticsearch/client';
import { ensureIndex } from './elasticsearch/indexer';
import { startConsumer } from './consumers/processed-job.consumer';

async function main(): Promise<void> {
  console.log('═══════════════════════════════════');
  console.log('  Search Indexer Service starting  ');
  console.log('═══════════════════════════════════');

  // Wait for ES to be ready before subscribing to Kafka
  await waitForElasticsearch();
  await ensureIndex();
  await startConsumer();
}

main().catch((err) => {
  console.error('[fatal] Search indexer crashed:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('[shutdown] Disconnecting ES client...');
  await getElasticsearchClient().close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await getElasticsearchClient().close();
  process.exit(0);
});
