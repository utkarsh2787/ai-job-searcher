import { v4 as uuidv4 } from 'uuid';
import striptags from 'striptags';
import { NormalizedJob, RemotiveRawJob } from '@job-platform/shared-types';
import { extractSkills } from '../enrichers/skill-extractor';
import { detectSeniority } from '../enrichers/seniority-detector';
import { normalizeSalaryText } from '../enrichers/salary-normalizer';
import { normalizeCompanyName } from '../enrichers/company-normalizer';

const JOB_TYPE_MAP: Record<string, NormalizedJob['jobType']> = {
  'full_time':  'full_time',
  'full-time':  'full_time',
  'part_time':  'part_time',
  'part-time':  'part_time',
  'contract':   'contract',
  'contractor': 'contract',
  'internship': 'internship',
  'intern':     'internship',
};

export function normalizeRemotive(raw: RemotiveRawJob, collectedAt: string): NormalizedJob {
  const description = striptags(raw.description ?? '');
  const skills = extractSkills(raw.title, description);
  const salary = normalizeSalaryText(raw.salary ?? '');

  return {
    jobId:           uuidv4(),
    sourceId:        String(raw.id),
    sourceUrl:       raw.url,
    title:           raw.title,
    titleNormalized: raw.title.toLowerCase().trim(),
    description,
    company: {
      name:           raw.company_name,
      nameNormalized: normalizeCompanyName(raw.company_name),
      logoUrl:        raw.company_logo,
    },
    location: {
      raw:      raw.candidate_required_location ?? 'Worldwide',
      isRemote: true,
      remoteType: 'fully_remote',
      country:  parseRemotiveCountry(raw.candidate_required_location),
    },
    jobType:        JOB_TYPE_MAP[raw.job_type?.toLowerCase()] ?? 'unknown',
    seniorityLevel: detectSeniority(raw.title, description),
    category:       raw.category ?? 'Other',
    skills,
    skillsRaw:      raw.tags ?? [],
    salary,
    postedAt:       raw.publication_date,
    collectedAt,
    updatedAt:      collectedAt,
  };
}

function parseRemotiveCountry(location: string): string | undefined {
  if (!location) return undefined;
  const lower = location.toLowerCase();
  if (lower.includes('usa') || lower.includes('united states')) return 'US';
  if (lower.includes('uk') || lower.includes('united kingdom')) return 'GB';
  if (lower.includes('canada')) return 'CA';
  if (lower.includes('europe')) return 'EU';
  if (lower === 'worldwide' || lower === 'anywhere') return undefined;
  return location.trim();
}
