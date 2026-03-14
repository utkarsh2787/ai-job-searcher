'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { SkillsData } from '@/types/api.types';
import { Card } from '@/components/ui/Card';

interface SkillsChartProps {
  data:      SkillsData | undefined;
  isLoading: boolean;
}

const COLORS = ['#00d4ff', '#3b82f6', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { skill: string; count: number; trend?: string } }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-hover)', border: '1px solid var(--border-bright)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-1)', fontWeight: 600 }}>{d.skill}</p>
      <p style={{ color: 'var(--cyan)', marginTop: 2 }}>{d.count.toLocaleString()} mentions
        {d.trend && <span style={{ color: 'var(--text-2)', marginLeft: 6 }}>{d.trend}</span>}
      </p>
    </div>
  );
};

export function SkillsChart({ data, isLoading }: SkillsChartProps) {
  const skills = (data?.skills ?? []).slice(0, 15);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Trending Skills</h2>
        {data && <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last {data.period}</span>}
      </div>

      {isLoading ? (
        <SkeletonBars />
      ) : skills.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skills} layout="vertical" margin={{ left: 4, right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="skill" width={85} tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {skills.map((_e, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

function SkeletonBars() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 300, justifyContent: 'center' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ height: 20, background: 'var(--bg-hover)', borderRadius: 4, width: `${60 + (i % 3) * 15}%`, opacity: 0.7 }}
          className="animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ fontSize: 32, opacity: 0.3 }}>◈</div>
      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No data yet — waiting for jobs to flow through</p>
    </div>
  );
}
