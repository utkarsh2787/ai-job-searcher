import { z } from 'zod';
import { parseEnv } from '@job-platform/shared-config';

const schema = z.object({
  KAFKA_BROKERS:             z.string().min(1),
  KAFKA_TOPIC_RAW:           z.string().default('job.raw.feed'),
  KAFKA_TOPIC_PROCESSED:     z.string().default('job.processed'),
  KAFKA_TOPIC_DEAD_LETTER:   z.string().default('job.dead-letter'),
  KAFKA_GROUP_ID:            z.string().default('job-processor-group'),

  REDIS_URL:              z.string().default('redis://localhost:6379'),
  REDIS_DEDUP_TTL_DAYS:   z.coerce.number().default(30),
});

export const config = parseEnv(schema);
export type Config = typeof config;
