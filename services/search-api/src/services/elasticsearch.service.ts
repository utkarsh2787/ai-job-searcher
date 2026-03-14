import { Client } from '@elastic/elasticsearch';
import type { Sort } from '@elastic/elasticsearch/lib/api/types';
import { config } from '../config';
import { JobSearchParams } from '../middleware/validation.middleware';

let esClient: Client | null = null;

function getClient(): Client {
  if (!esClient) {
    esClient = new Client({ node: config.ELASTICSEARCH_URL });
  }
  return esClient;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface JobSearchResult {
  total:    number;
  page:     number;
  pageSize: number;
  pages:    number;
  jobs:     JobDocument[];
  facets:   SearchFacets;
}

export interface JobDocument {
  jobId:          string;
  title:          string;
  company:        { name: string; logoUrl?: string };
  location:       { raw: string; city?: string; country?: string; isRemote: boolean };
  jobType:        string;
  seniorityLevel: string;
  category:       string;
  skills:         string[];
  salary:         { min?: number; max?: number; currency: string; isEstimated: boolean };
  source:         string;
  sourceUrl:      string;
  postedAt:       string;
}

export interface SearchFacets {
  skills:    Array<{ key: string; count: number }>;
  companies: Array<{ key: string; count: number }>;
  locations: Array<{ key: string; count: number }>;
  jobTypes:  Array<{ key: string; count: number }>;
  seniority: Array<{ key: string; count: number }>;
}

// ── Main search function ──────────────────────────────────────────────────────

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const es = getClient();
  const from = (params.page - 1) * params.pageSize;

  const query = buildQuery(params);
  const sort  = buildSort(params.sortBy);

  const response = await es.search({
    index: config.ELASTICSEARCH_INDEX_JOBS,
    body: {
      from,
      size: params.pageSize,
      query,
      sort,
      // Return only the fields the frontend needs — not the full description
      _source: [
        'jobId', 'title', 'company', 'location', 'jobType',
        'seniorityLevel', 'category', 'skills', 'salary',
        'source', 'sourceUrl', 'postedAt',
      ],
      // Facet aggregations — always return alongside results
      aggs: {
        skills:    { terms: { field: 'skills',                  size: 20 } },
        companies: { terms: { field: 'company.nameNormalized',  size: 10 } },
        locations: { terms: { field: 'location.country',        size: 15 } },
        job_types: { terms: { field: 'jobType',                 size: 5  } },
        seniority: { terms: { field: 'seniorityLevel',          size: 7  } },
      },
      // Highlight matching terms in title
      highlight: {
        fields: { title: { number_of_fragments: 0 } },
        pre_tags:  ['<mark>'],
        post_tags: ['</mark>'],
      },
    },
  });

  const hits   = response.hits.hits;
  const total  = typeof response.hits.total === 'number'
    ? response.hits.total
    : (response.hits.total?.value ?? 0);

  const jobs: JobDocument[] = hits.map((hit) => {
    const src = hit._source as Record<string, unknown>;
    return {
      jobId:          src['jobId'] as string,
      title:          src['title'] as string,
      company:        src['company'] as JobDocument['company'],
      location:       src['location'] as JobDocument['location'],
      jobType:        src['jobType'] as string,
      seniorityLevel: src['seniorityLevel'] as string,
      category:       src['category'] as string,
      skills:         src['skills'] as string[],
      salary:         src['salary'] as JobDocument['salary'],
      source:         src['source'] as string,
      sourceUrl:      src['sourceUrl'] as string,
      postedAt:       src['postedAt'] as string,
    };
  });

  const aggs    = response.aggregations as Record<string, { buckets: Array<{ key: string; doc_count: number }> }>;
  const facets  = extractFacets(aggs);

  return {
    total,
    page:     params.page,
    pageSize: params.pageSize,
    pages:    Math.ceil(total / params.pageSize),
    jobs,
    facets,
  };
}

export async function getJobById(jobId: string): Promise<JobDocument | null> {
  const es = getClient();

  try {
    const response = await es.get({
      index: config.ELASTICSEARCH_INDEX_JOBS,
      id:    jobId,
    });

    if (!response.found) return null;
    const src = response._source as Record<string, unknown>;
    return src as unknown as JobDocument;
  } catch (err: unknown) {
    // ES returns 404 as an error — treat it as null
    if ((err as { statusCode?: number }).statusCode === 404) return null;
    throw err;
  }
}

// ── Query builder ─────────────────────────────────────────────────────────────

function buildQuery(params: JobSearchParams): Record<string, unknown> {
  const mustClauses: unknown[]   = [];
  const filterClauses: unknown[] = [];

  // Full-text search — boost title matches 3x over description
  if (params.q?.trim()) {
    mustClauses.push({
      multi_match: {
        query:  params.q,
        fields: ['title^3', 'description', 'skills^2', 'company.name'],
        type:   'best_fields',
        fuzziness: 'AUTO',
      },
    });
  } else {
    // No query — match all, but still apply filters
    mustClauses.push({ match_all: {} });
  }

  // Filters (exact matches — don't affect relevance score)
  if (params.remote === 'true') {
    filterClauses.push({ term: { 'location.isRemote': true } });
  }

  if (params.jobType) {
    filterClauses.push({ term: { jobType: params.jobType } });
  }

  if (params.seniority) {
    filterClauses.push({ term: { seniorityLevel: params.seniority } });
  }

  if (params.company) {
    filterClauses.push({
      match: { 'company.name': { query: params.company, fuzziness: 'AUTO' } },
    });
  }

  if (params.location) {
    filterClauses.push({
      bool: {
        should: [
          { term: { 'location.city':    params.location } },
          { term: { 'location.country': params.location } },
          { term: { 'location.state':   params.location } },
        ],
        minimum_should_match: 1,
      },
    });
  }

  if (params.skills) {
    const skillList = params.skills.split(',').map((s) => s.trim().toLowerCase());
    filterClauses.push({ terms: { skills: skillList } });
  }

  if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
    // Match jobs where the max salary is at least salaryMin, so high-paying roles
    // that don't set salary.min are still included (e.g. salary.max = 250k)
    const salaryShould: unknown[] = [];
    if (params.salaryMin !== undefined) {
      salaryShould.push({ range: { 'salary.max': { gte: params.salaryMin } } });
      salaryShould.push({ range: { 'salary.min': { gte: params.salaryMin } } });
    }
    if (params.salaryMax !== undefined) {
      salaryShould.push({ range: { 'salary.min': { lte: params.salaryMax } } });
    }
    filterClauses.push({ bool: { should: salaryShould, minimum_should_match: 1 } });
  }

  if (params.postedWithin) {
    filterClauses.push({
      range: { postedAt: { gte: `now-${params.postedWithin}d/d` } },
    });
  }

  return {
    bool: {
      must:   mustClauses,
      filter: filterClauses,
    },
  };
}

function buildSort(sortBy: string): Sort {
  switch (sortBy) {
    case 'date':
      return [{ postedAt: { order: 'desc' } }, '_score'];
    case 'salary':
      return [{ 'salary.max': { order: 'desc', missing: '_last' } }, '_score'];
    case 'relevance':
    default:
      return ['_score', { postedAt: { order: 'desc' } }];
  }
}

function extractFacets(aggs: Record<string, { buckets: Array<{ key: string; doc_count: number }> }>): SearchFacets {
  const toBuckets = (key: string) =>
    (aggs[key]?.buckets ?? []).map((b) => ({ key: b.key, count: b.doc_count }));

  return {
    skills:    toBuckets('skills'),
    companies: toBuckets('companies'),
    locations: toBuckets('locations'),
    jobTypes:  toBuckets('job_types'),
    seniority: toBuckets('seniority'),
  };
}
