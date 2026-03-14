'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar }   from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { JobList }     from '@/components/search/JobList';
import { StatsBar }    from '@/components/analytics/StatsBar';
import { searchJobs, getPlatformStats } from '@/lib/api-client';
import { SearchParams } from '@/types/api.types';

export default function HomePage() {
  const [params, setParams] = useState<SearchParams>({ page: 1, pageSize: 20, sortBy: 'relevance' });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey:    ['jobs', params],
    queryFn:     () => searchJobs(params),
    staleTime:   30_000,
    placeholderData: (prev) => prev,
  });

  const { data: statsData } = useQuery({
    queryKey:  ['stats'],
    queryFn:   getPlatformStats,
    staleTime: 60_000,
  });

  const updateParams = useCallback((updates: Partial<SearchParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: 1 }));
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}
            className="gradient-text">
            Job Intelligence Platform
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1' }}>
            Real-time jobs from Remotive, Adzuna, and The Muse — powered by Kafka + Elasticsearch
          </p>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 24 }}>
          <StatsBar stats={statsData?.data} />
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <SearchBar
            initialValue={params.q ?? ''}
            onSearch={(q) => updateParams({ q: q || undefined })}
            isLoading={searchLoading}
          />
        </div>

        {/* Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {searchData ? `${searchData.total.toLocaleString()} jobs found` : ''}
          </p>
          <select
            value={params.sortBy ?? 'relevance'}
            onChange={(e) => updateParams({ sortBy: e.target.value as SearchParams['sortBy'] })}
            className="input-dark"
            style={{ fontSize: 12, padding: '5px 10px', cursor: 'pointer' }}
          >
            <option value="relevance">Most relevant</option>
            <option value="date">Most recent</option>
            <option value="salary">Highest salary</option>
          </select>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar */}
          <div className="hidden lg:block" style={{ width: 220, flexShrink: 0 }}>
            <FilterPanel
              facets={searchData?.facets}
              filters={params}
              onChange={updateParams}
            />
          </div>

          {/* Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <JobList
              jobs={searchData?.jobs ?? []}
              total={searchData?.total ?? 0}
              page={params.page ?? 1}
              pages={searchData?.pages ?? 1}
              isLoading={searchLoading}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
