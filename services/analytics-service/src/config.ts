import { z } from 'zod';
import { parseEnv } from '@job-platform/shared-config';

const schema = z.object({
  KAFKA_BROKERS:           z.string().min(1),
  KAFKA_TOPIC_PROCESSED:   z.string().default('job.processed'),
  KAFKA_GROUP_ID:          z.string().default('analytics-service-group'),

  POSTGRES_URL:            z.string().min(1),

  SNAPSHOT_INTERVAL_MINUTES: z.coerce.number().default(15),
});

export const config = parseEnv(schema);
export type Config = typeof config;
