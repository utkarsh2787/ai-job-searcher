'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsBar }      from '@/components/analytics/StatsBar';
import { SkillsChart }   from '@/components/analytics/SkillsChart';
import { SalaryChart }   from '@/components/analytics/SalaryChart';
import { GrowthChart, HiringCompanies } from '@/components/analytics/HiringChart';
import {
  getSkills, getCompanies, getSalary, getJobGrowth, getPlatformStats,
} from '@/lib/api-client';

type Period = '7d' | '30d';

export default function AnalyticsPage() {
  const [skillsPeriod,  setSkillsPeriod]  = useState<Period>('7d');
  const [companyPeriod, setCompanyPeriod] = useState<Period>('30d');

  const { data: statsData } = useQuery({ queryKey: ['stats'], queryFn: getPlatformStats, staleTime: 60_000 });
  const { data: skillsData,    isLoading: skillsLoading    } = useQuery({ queryKey: ['skills', skillsPeriod],   queryFn: () => getSkills(skillsPeriod),      staleTime: 300_000 });
  const { data: companiesData, isLoading: companiesLoading } = useQuery({ queryKey: ['companies', companyPeriod], queryFn: () => getCompanies(companyPeriod), staleTime: 300_000 });
  const { data: salaryData,    isLoading: salaryLoading    } = useQuery({ queryKey: ['salary'],                   queryFn: getSalary,                         staleTime: 300_000 });
  const { data: growthData,    isLoading: growthLoading    } = useQuery({ queryKey: ['growth'],                   queryFn: getJobGrowth,                      staleTime: 300_000 });

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}
            className="gradient-text">
            Market Intelligence
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1' }}>
            Aggregated insights from real job postings — updated every 15 minutes
          </p>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 24 }}>
          <StatsBar stats={statsData?.data} />
        </div>

        {/* Growth chart */}
        <div style={{ marginBottom: 16 }}>
          <GrowthChart data={growthData?.data} isLoading={growthLoading} />
        </div>

        {/* Skills + Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <PeriodToggle value={skillsPeriod} onChange={setSkillsPeriod} />
            </div>
            <SkillsChart data={skillsData?.data} isLoading={skillsLoading} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <PeriodToggle value={companyPeriod} onChange={setCompanyPeriod} />
            </div>
            <HiringCompanies data={companiesData?.data} isLoading={companiesLoading} />
          </div>
        </div>

        {/* Salary */}
        <SalaryChart data={salaryData?.data} isLoading={salaryLoading} />
      </div>
    </div>
  );
}

function PeriodToggle({ value, onChange }: { value: string; onChange: (v: Period) => void }) {
  return (
    <div style={{
      display: 'inline-flex', borderRadius: 6, overflow: 'hidden',
      border: '1px solid var(--border)', background: 'var(--bg-deep)',
    }}>
      {(['7d', '30d'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            padding: '4px 12px', fontSize: 11, fontWeight: 500,
            background: value === p ? 'rgba(0,212,255,0.12)' : 'transparent',
            color: value === p ? 'var(--cyan)' : 'var(--text-3)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            letterSpacing: '0.05em',
          }}
        >
          {p === '7d' ? '7D' : '30D'}
        </button>
      ))}
    </div>
  );
}
