import { createKafkaClient } from '@job-platform/shared-config';
import { ProcessedJobEvent } from '@job-platform/shared-types';
import { bulkUpsertJobs } from '../elasticsearch/indexer';
import { config } from '../config';

// Batch size and flush interval for bulk indexing.
// Batching reduces ES round trips dramatically on burst ingestion.
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 2000;

export async function startConsumer(): Promise<void> {
  const kafka = createKafkaClient([config.KAFKA_BROKERS], 'search-indexer-consumer');

  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: config.KAFKA_TOPIC_PROCESSED, numPartitions: 3 }],
  });
  await admin.disconnect();

  const consumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({
    topic: config.KAFKA_TOPIC_PROCESSED,
    fromBeginning: false,
  });

  console.log(`[kafka] Consumer subscribed to ${config.KAFKA_TOPIC_PROCESSED} (group: ${config.KAFKA_GROUP_ID})`);

  // Buffer for micro-batching
  let batch: Array<{ job: ProcessedJobEvent['job']; source: string }> = [];
  let flushTimer: NodeJS.Timeout | null = null;

  const flush = async () => {
    if (batch.length === 0) return;
    const toFlush = batch.splice(0);
    try {
      await bulkUpsertJobs(toFlush);
      console.log(`[indexer] Indexed ${toFlush.length} jobs`);
    } catch (err) {
      console.error('[indexer] Bulk upsert failed:', err instanceof Error ? err.message : err);
    }
  };

  const scheduleFlush = () => {
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      flushTimer = null;
      await flush();
    }, FLUSH_INTERVAL_MS);
  };

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      let event: ProcessedJobEvent;
      try {
        event = JSON.parse(message.value.toString()) as ProcessedJobEvent;
      } catch {
        console.error('[indexer] Failed to parse message');
        return;
      }

      // Skip duplicates — fingerprint hasn't changed so ES already has this exact content
      if (!event.processing.isFirstSeen) return;

      batch.push({ job: event.job, source: event.source });

      // Flush immediately when batch is full
      if (batch.length >= BATCH_SIZE) {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        await flush();
      } else {
        scheduleFlush();
      }
    },
  });
}
