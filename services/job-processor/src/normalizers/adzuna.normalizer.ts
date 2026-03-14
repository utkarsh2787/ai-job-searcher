import { v4 as uuidv4 } from 'uuid';
import striptags from 'striptags';
import { NormalizedJob, AdzunaRawJob } from '@job-platform/shared-types';
import { extractSkills } from '../enrichers/skill-extractor';
import { detectSeniority } from '../enrichers/seniority-detector';
import { normalizeSalaryRange } from '../enrichers/salary-normalizer';
import { normalizeCompanyName } from '../enrichers/company-normalizer';

export function normalizeAdzuna(raw: AdzunaRawJob, collectedAt: string): NormalizedJob {
  const description = striptags(raw.description ?? '');
  const skills = extractSkills(raw.title, description);
  const salary = normalizeSalaryRange(raw.salary_min, raw.salary_max);

  const locationRaw = raw.location?.display_name ?? '';
  const locationParts = raw.location?.area ?? [];

  return {
    jobId:           uuidv4(),
    sourceId:        raw.id,
    sourceUrl:       raw.redirect_url,
    title:           raw.title,
    titleNormalized: raw.title.toLowerCase().trim(),
    description,
    company: {
      name:           raw.company.display_name,
      nameNormalized: normalizeCompanyName(raw.company.display_name),
    },
    location: {
      raw:     locationRaw,
      city:    locationParts[locationParts.length - 2] ?? locationParts[0],
      state:   locationParts[locationParts.length - 2] ?? undefined,
      country: locationParts[locationParts.length - 1] ?? 'US',
      isRemote: isRemoteJob(raw.title, description),
      remoteType: isRemoteJob(raw.title, description) ? 'fully_remote' : undefined,
    },
    jobType:        detectJobType(raw.contract_type, raw.contract_time),
    seniorityLevel: detectSeniority(raw.title, description),
    category:       raw.category?.label ?? 'Other',
    skills,
    skillsRaw:      [],
    salary,
    postedAt:       raw.created,
    collectedAt,
    updatedAt:      collectedAt,
  };
}

function detectJobType(
  contractType?: string,
  contractTime?: string
): NormalizedJob['jobType'] {
  const combined = `${contractType ?? ''} ${contractTime ?? ''}`.toLowerCase();
  if (combined.includes('permanent') || combined.includes('full_time')) return 'full_time';
  if (combined.includes('contract')) return 'contract';
  if (combined.includes('part_time')) return 'part_time';
  return 'full_time'; // Adzuna default
}

function isRemoteJob(title: string, description: string): boolean {
  const text = `${title} ${description.slice(0, 500)}`.toLowerCase();
  return /\bremote\b|\bwork from home\b|\bwfh\b/.test(text);
}
