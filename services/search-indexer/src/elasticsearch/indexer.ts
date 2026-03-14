import { NormalizedJob } from '@job-platform/shared-types';
import { getElasticsearchClient } from './client';
import { JOBS_MAPPING } from './mappings/jobs.mapping';
import { config } from '../config';

// Ensure the index exists with the correct mapping.
// Uses `create` with error suppression for "already exists" — idempotent.
export async function ensureIndex(): Promise<void> {
  const es = getElasticsearchClient();

  const exists = await es.indices.exists({ index: config.ELASTICSEARCH_INDEX_JOBS });
  if (exists) {
    console.log(`[elasticsearch] Index "${config.ELASTICSEARCH_INDEX_JOBS}" already exists`);
    return;
  }

  await es.indices.create({
    index: config.ELASTICSEARCH_INDEX_JOBS,
    ...JOBS_MAPPING,
  });

  console.log(`[elasticsearch] Index "${config.ELASTICSEARCH_INDEX_JOBS}" created`);
}

// Upsert a job document.
// Uses the jobId as the document _id — so re-processing the same job
// updates the existing document rather than creating a duplicate.
export async function upsertJob(job: NormalizedJob): Promise<void> {
  const es = getElasticsearchClient();

  // Build the document — strip fields not in the mapping
  const doc = {
    jobId:          job.jobId,
    sourceId:       job.sourceId,
    source:         undefined as unknown,   // set below from caller context
    sourceUrl:      job.sourceUrl,
    title:          job.title,
    titleNormalized: job.titleNormalized,
    description:    job.description.slice(0, 10_000), // cap at 10k chars
    company: {
      name:           job.company.name,
      nameNormalized: job.company.nameNormalized,
      logoUrl:        job.company.logoUrl,
    },
    location: {
      raw:        job.location.raw,
      city:       job.location.city,
      state:      job.location.state,
      country:    job.location.country,
      isRemote:   job.location.isRemote,
      remoteType: job.location.remoteType,
    },
    jobType:        job.jobType,
    seniorityLevel: job.seniorityLevel,
    category:       job.category,
    skills:         job.skills,
    salary: {
      raw:         job.salary.raw,
      min:         job.salary.min,
      max:         job.salary.max,
      currency:    job.salary.currency,
      period:      job.salary.period,
      isEstimated: job.salary.isEstimated,
    },
    postedAt:    job.postedAt,
    collectedAt: job.collectedAt,
    updatedAt:   job.updatedAt,
  };

  await es.update({
    index: config.ELASTICSEARCH_INDEX_JOBS,
    id:    job.jobId,
    body: {
      doc,
      doc_as_upsert: true,
    },
  });
}

// Bulk upsert for batching multiple jobs in one ES request.
// More efficient than individual upserts when processing bursts.
export async function bulkUpsertJobs(jobs: Array<{ job: NormalizedJob; source: string }>): Promise<void> {
  if (jobs.length === 0) return;

  const es = getElasticsearchClient();

  const operations = jobs.flatMap(({ job }) => [
    { update: { _index: config.ELASTICSEARCH_INDEX_JOBS, _id: job.jobId } },
    {
      doc: buildDoc(job),
      doc_as_upsert: true,
    },
  ]);

  const result = await es.bulk({ body: operations, refresh: false });

  if (result.errors) {
    const failed = result.items.filter((i) => i.update?.error);
    console.error(`[elasticsearch] Bulk upsert had ${failed.length} errors`);
    for (const item of failed) {
      console.error('[elasticsearch] Error:', JSON.stringify(item.update?.error));
    }
  }
}

function buildDoc(job: NormalizedJob) {
  return {
    jobId:           job.jobId,
    sourceId:        job.sourceId,
    sourceUrl:       job.sourceUrl,
    title:           job.title,
    titleNormalized: job.titleNormalized,
    description:     job.description.slice(0, 10_000),
    company: {
      name:           job.company.name,
      nameNormalized: job.company.nameNormalized,
      logoUrl:        job.company.logoUrl,
    },
    location: {
      raw:        job.location.raw,
      city:       job.location.city,
      state:      job.location.state,
      country:    job.location.country,
      isRemote:   job.location.isRemote,
      remoteType: job.location.remoteType,
    },
    jobType:        job.jobType,
    seniorityLevel: job.seniorityLevel,
    category:       job.category,
    skills:         job.skills,
    salary: {
      raw:         job.salary.raw,
      min:         job.salary.min,
      max:         job.salary.max,
      currency:    job.salary.currency,
      period:      job.salary.period,
      isEstimated: job.salary.isEstimated,
    },
    postedAt:    job.postedAt,
    collectedAt: job.collectedAt,
    updatedAt:   job.updatedAt,
  };
}
