import { JobSource, NormalizedJob } from './jobs';

// ─── Raw source payload shapes ────────────────────────────────────────────────

export interface RemotiveRawJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

export interface AdzunaRawJob {
  id: string;
  title: string;
  description: string;
  created: string;
  redirect_url: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min?: number;
  salary_max?: number;
  category: { label: string; tag: string };
  contract_type?: string;
  contract_time?: string;
}

export interface TheMuseRawJob {
  id: number;
  name: string;
  publication_date: string;
  short_name: string;
  refs: { landing_page: string };
  contents: string;
  levels: Array<{ name: string; short_name: string }>;
  locations: Array<{ name: string }>;
  categories: Array<{ name: string }>;
  company: {
    id: number;
    name: string;
    short_name: string;
  };
}

export type RawJobPayload = RemotiveRawJob | AdzunaRawJob | TheMuseRawJob;

// ─── Kafka event envelopes ────────────────────────────────────────────────────

export interface RawJobEvent {
  eventId: string;
  eventType: 'job.raw';
  schemaVersion: '1.0';
  producedAt: string;
  source: JobSource;
  sourceJobId: string;
  payload: RawJobPayload;
}

export interface ProcessedJobEvent {
  eventId: string;
  eventType: 'job.processed';
  schemaVersion: '1.0';
  producedAt: string;
  sourceEventId: string;
  source: JobSource;
  job: NormalizedJob;
  processing: {
    extractedAt: string;
    deduplicationKey: string;
    isFirstSeen: boolean;
    skillsExtractedCount: number;
  };
}

export interface DeadLetterEvent {
  eventId: string;
  eventType: 'job.dead-letter';
  producedAt: string;
  originalEventId: string;
  originalTopic: string;
  source: string;
  failureReason: string;
  failureStage: 'validation' | 'normalization' | 'enrichment';
  rawPayload: unknown;
}
