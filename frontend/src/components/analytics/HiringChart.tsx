'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CompaniesData, JobGrowthData } from '@/types/api.types';
import { Card } from '@/components/ui/Card';

// ── Job growth over time ──────────────────────────────────────────────────────

interface GrowthChartProps {
  data:      JobGrowthData | undefined;
  isLoading: boolean;
}

const GrowthTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-hover)', border: '1px solid var(--border-bright)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-2)' }}>{label}</p>
      <p style={{ color: 'var(--cyan)', fontWeight: 600, marginTop: 2 }}>{payload[0].value.toLocaleString()} jobs</p>
    </div>
  );
};

export function GrowthChart({ data, isLoading }: GrowthChartProps) {
  const series = (data?.series ?? []).map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card glow>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Job Postings Over Time</h2>
        <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last 90 days</span>
      </div>

      {isLoading ? (
        <div style={{ height: 200, background: 'var(--bg-hover)', borderRadius: 8 }} className="animate-pulse" />
      ) : series.length === 0 ? (
        <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 32, opacity: 0.3 }}>↑</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No growth data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={series} margin={{ top: 4 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<GrowthTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="count" name="Jobs posted"
              stroke="var(--cyan)" fill="url(#growthGrad)" strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

// ── Top hiring companies ──────────────────────────────────────────────────────

interface HiringCompaniesProps {
  data:      CompaniesData | undefined;
  isLoading: boolean;
}

export function HiringCompanies({ data, isLoading }: HiringCompaniesProps) {
  const companies = (data?.companies ?? []).slice(0, 10);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Top Hiring Companies</h2>
        {data && <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last {data.period}</span>}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 36, background: 'var(--bg-hover)', borderRadius: 6 }} className="animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 32, opacity: 0.3 }}>⬡</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No company data yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {companies.map((c, i) => {
            const max = companies[0].postings;
            const pct = Math.round((c.postings / max) * 100);
            const isPositive = c.trend && c.trend !== 'new' && c.trend.startsWith('+');
            return (
              <div key={c.normalized} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8, flexShrink: 0 }}>
                      {c.postings}
                      {c.trend && c.trend !== 'new' && (
                        <span style={{ marginLeft: 4, color: isPositive ? '#34d399' : '#f87171' }}>{c.trend}</span>
                      )}
                      {c.trend === 'new' && (
                        <span style={{ marginLeft: 4, color: 'var(--cyan)' }}>new</span>
                      )}
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'var(--bg-deep)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, var(--cyan), #3b82f6)`,
                      borderRadius: 2, transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
