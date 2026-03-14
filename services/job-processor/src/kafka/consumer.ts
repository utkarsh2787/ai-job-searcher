import { v4 as uuidv4 } from 'uuid';
import { createKafkaClient } from '@job-platform/shared-config';
import {
  RawJobEvent,
  ProcessedJobEvent,
  DeadLetterEvent,
  RemotiveRawJob,
  AdzunaRawJob,
  TheMuseRawJob,
} from '@job-platform/shared-types';
import { normalizeRemotive } from '../normalizers/remotive.normalizer';
import { normalizeAdzuna } from '../normalizers/adzuna.normalizer';
import { normalizeTheMuse } from '../normalizers/themuse.normalizer';
import { buildFingerprint } from '../deduplication/fingerprint';
import { checkAndRegister } from '../deduplication/redis-check';
import { publishProcessedJob, publishDeadLetter } from './producer';
import { config } from '../config';

export async function startConsumer(): Promise<void> {
  const kafka = createKafkaClient([config.KAFKA_BROKERS], 'job-processor-consumer');

  // Ensure topics exist before subscribing
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [
      { topic: config.KAFKA_TOPIC_RAW,         numPartitions: 3 },
      { topic: config.KAFKA_TOPIC_PROCESSED,   numPartitions: 3 },
      { topic: config.KAFKA_TOPIC_DEAD_LETTER, numPartitions: 1 },
    ],
  });
  await admin.disconnect();

  const consumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({
    topic: config.KAFKA_TOPIC_RAW,
    fromBeginning: false,
  });

  console.log(`[kafka] Consumer subscribed to ${config.KAFKA_TOPIC_RAW} (group: ${config.KAFKA_GROUP_ID})`);

  await consumer.run({
    // Process one message at a time — safe for dedup operations
    eachMessage: async ({ message, partition, topic }) => {
      if (!message.value) return;

      let rawEvent: RawJobEvent;
      try {
        rawEvent = JSON.parse(message.value.toString()) as RawJobEvent;
      } catch (err) {
        console.error('[consumer] Failed to parse message:', err);
        return;
      }

      await processRawEvent(rawEvent);
    },
  });
}

async function processRawEvent(rawEvent: RawJobEvent): Promise<void> {
  const collectedAt = new Date().toISOString();

  try {
    // ── Step 1: Normalize ─────────────────────────────────────────────────
    const job = normalizeBySource(rawEvent, collectedAt);

    // ── Step 2: Deduplicate ───────────────────────────────────────────────
    const fingerprint = buildFingerprint(job);
    const { isFirstSeen, existingJobId } = await checkAndRegister(fingerprint, job.jobId);

    // If we've seen this before, use the stable existing ID so downstream
    // services can upsert rather than create duplicates
    if (!isFirstSeen && existingJobId) {
      job.jobId = existingJobId;
    }

    // ── Step 3: Publish processed event ──────────────────────────────────
    const processedEvent: ProcessedJobEvent = {
      eventId:       uuidv4(),
      eventType:     'job.processed',
      schemaVersion: '1.0',
      producedAt:    collectedAt,
      sourceEventId: rawEvent.eventId,
      source:        rawEvent.source,
      job,
      processing: {
        extractedAt:            collectedAt,
        deduplicationKey:       fingerprint,
        isFirstSeen,
        skillsExtractedCount:   job.skills.length,
      },
    };

    await publishProcessedJob(processedEvent);

    console.log(
      `[processor] ${isFirstSeen ? 'NEW' : 'UPD'} | ${rawEvent.source.padEnd(8)} | ` +
      `${job.company.name.slice(0, 20).padEnd(20)} | ${job.title.slice(0, 40)} ` +
      `| skills: ${job.skills.length}`
    );
  } catch (err) {
    // ── Step 4: Dead-letter on failure ────────────────────────────────────
    const failureReason = err instanceof Error ? err.message : String(err);
    console.error(`[processor] Failed to process event ${rawEvent.eventId}: ${failureReason}`);

    const deadLetter: DeadLetterEvent = {
      eventId:         uuidv4(),
      eventType:       'job.dead-letter',
      producedAt:      collectedAt,
      originalEventId: rawEvent.eventId,
      originalTopic:   config.KAFKA_TOPIC_RAW,
      source:          rawEvent.source,
      failureReason,
      failureStage:    'normalization',
      rawPayload:      rawEvent,
    };

    await publishDeadLetter(deadLetter).catch((e) =>
      console.error('[processor] Failed to publish dead letter:', e)
    );
  }
}

function normalizeBySource(rawEvent: RawJobEvent, collectedAt: string) {
  switch (rawEvent.source) {
    case 'remotive':
      return normalizeRemotive(rawEvent.payload as RemotiveRawJob, collectedAt);
    case 'adzuna':
      return normalizeAdzuna(rawEvent.payload as AdzunaRawJob, collectedAt);
    case 'themuse':
      return normalizeTheMuse(rawEvent.payload as TheMuseRawJob, collectedAt);
    default:
      throw new Error(`Unknown source: ${(rawEvent as RawJobEvent).source}`);
  }
}
