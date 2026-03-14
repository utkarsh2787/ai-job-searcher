import { z } from 'zod';
import { parseEnv } from '@job-platform/shared-config';

const schema = z.object({
  KAFKA_BROKERS:           z.string().min(1),
  KAFKA_TOPIC_PROCESSED:   z.string().default('job.processed'),
  KAFKA_GROUP_ID:          z.string().default('search-indexer-group'),

  ELASTICSEARCH_URL:        z.string().default('http://localhost:9200'),
  ELASTICSEARCH_INDEX_JOBS: z.string().default('jobs'),
});

export const config = parseEnv(schema);
export type Config = typeof config;
