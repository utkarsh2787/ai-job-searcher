import { z } from 'zod';
import { parseEnv } from '@job-platform/shared-config';

const schema = z.object({
  KAFKA_BROKERS:    z.string().min(1),
  KAFKA_TOPIC_RAW:  z.string().default('job.raw.feed'),

  ADZUNA_APP_ID:  z.string().min(1),
  ADZUNA_APP_KEY: z.string().min(1),
  ADZUNA_COUNTRY: z.string().default('us'),

  THEMUSE_API_KEY: z.string().min(1),

  POLL_INTERVAL_REMOTIVE: z.coerce.number().default(15),
  POLL_INTERVAL_ADZUNA:   z.coerce.number().default(30),
  POLL_INTERVAL_THEMUSE:  z.coerce.number().default(20),
});

export const config = parseEnv(schema);
export type Config = typeof config;
