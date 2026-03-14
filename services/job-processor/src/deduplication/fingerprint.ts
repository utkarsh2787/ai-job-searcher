import { createHash } from 'crypto';
import { NormalizedJob } from '@job-platform/shared-types';

// A stable fingerprint for a job based on its identity — not its content.
// Two jobs from different sources with the same title + company + URL
// are considered the same job.
//
// Intentionally excludes: salary, description, skills, timestamps.
// Those can change legitimately without making it a "new" job.

export function buildFingerprint(job: Pick<NormalizedJob, 'titleNormalized' | 'company' | 'sourceUrl'>): string {
  const components = [
    job.titleNormalized.trim().toLowerCase(),
    job.company.nameNormalized.trim().toLowerCase(),
    normalizeUrl(job.sourceUrl),
  ];

  return createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Strip query params and fragments — keep only origin + path
    return `${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}
