import {
  JobSearchResponse,
  JobSummary,
  SkillsData,
  CompaniesData,
  SalaryData,
  JobGrowthData,
  LocationPoint,
  PlatformStats,
  SearchParams,
} from '@/types/api.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 0 }, // disable Next.js static caching — we have Redis
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export async function searchJobs(params: SearchParams): Promise<JobSearchResponse> {
  return apiFetch<JobSearchResponse>('/api/jobs/search', {
    ...params,
    remote: params.remote !== undefined ? String(params.remote) : undefined,
  } as Record<string, string | number | boolean | undefined>);
}

export async function getJobById(id: string): Promise<{ success: boolean; job: JobSummary }> {
  return apiFetch(`/api/jobs/${id}`);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getSkills(period: '7d' | '30d' = '7d'): Promise<{ success: boolean; data: SkillsData }> {
  return apiFetch('/api/analytics/skills', { period });
}

export async function getCompanies(period: '7d' | '30d' = '30d'): Promise<{ success: boolean; data: CompaniesData }> {
  return apiFetch('/api/analytics/companies', { period });
}

export async function getSalary(): Promise<{ success: boolean; data: SalaryData }> {
  return apiFetch('/api/analytics/salary');
}

export async function getJobGrowth(): Promise<{ success: boolean; data: JobGrowthData }> {
  return apiFetch('/api/analytics/growth');
}

export async function getLocations(): Promise<{ success: boolean; data: { locations: LocationPoint[] } }> {
  return apiFetch('/api/analytics/locations');
}

export async function getPlatformStats(): Promise<{ success: boolean; data: PlatformStats }> {
  return apiFetch('/api/analytics/stats');
}
