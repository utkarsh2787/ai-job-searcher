import { v4 as uuidv4 } from 'uuid';
import striptags from 'striptags';
import { NormalizedJob, TheMuseRawJob } from '@job-platform/shared-types';
import { extractSkills } from '../enrichers/skill-extractor';
import { detectSeniority } from '../enrichers/seniority-detector';
import { normalizeCompanyName } from '../enrichers/company-normalizer';

const LEVEL_MAP: Record<string, NormalizedJob['seniorityLevel']> = {
  'entry level':        'junior',
  'mid level':          'mid',
  'senior level':       'senior',
  'management & executive': 'lead',
  'internship':         'intern',
};

export function normalizeTheMuse(raw: TheMuseRawJob, collectedAt: string): NormalizedJob {
  const description = striptags(raw.contents ?? '');
  const skills = extractSkills(raw.name, description);

  // The Muse provides structured seniority levels
  const levelName = raw.levels?.[0]?.name?.toLowerCase() ?? '';
  const seniorityLevel = LEVEL_MAP[levelName] ?? detectSeniority(raw.name, description);

  const locations = raw.locations?.map((l) => l.name) ?? [];
  const primaryLocation = locations[0] ?? 'Unknown';
  const isRemote = locations.some((l) => /remote/i.test(l));

  return {
    jobId:           uuidv4(),
    sourceId:        String(raw.id),
    sourceUrl:       raw.refs?.landing_page ?? '',
    title:           raw.name,
    titleNormalized: raw.name.toLowerCase().trim(),
    description,
    descriptionHtml: raw.contents,
    company: {
      name:           raw.company.name,
      nameNormalized: normalizeCompanyName(raw.company.name),
    },
    location: {
      raw:       primaryLocation,
      isRemote,
      remoteType: isRemote ? 'fully_remote' : undefined,
      city:      parseCity(primaryLocation),
      country:   parseCountry(primaryLocation),
    },
    jobType:        'full_time', // The Muse doesn't expose job type
    seniorityLevel,
    category:       raw.categories?.[0]?.name ?? 'Other',
    skills,
    skillsRaw:      [],
    salary: {
      currency:    'USD',
      period:      'unknown',
      isEstimated: true,
    },
    postedAt:    raw.publication_date,
    collectedAt,
    updatedAt:   collectedAt,
  };
}

function parseCity(location: string): string | undefined {
  // "New York, NY" → "New York"
  const parts = location.split(',');
  return parts[0]?.trim() || undefined;
}

function parseCountry(location: string): string | undefined {
  if (/remote/i.test(location)) return undefined;
  // The Muse is US-centric; assume US unless clearly international
  return 'US';
}
