'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { SalaryData } from '@/types/api.types';
import { Card } from '@/components/ui/Card';

interface SalaryChartProps {
  data:      SalaryData | undefined;
  isLoading: boolean;
}

const LEVEL_ORDER  = ['intern', 'junior', 'mid', 'senior', 'lead', 'executive'];
const LEVEL_LABELS: Record<string, string> = {
  intern: 'Intern', junior: 'Junior', mid: 'Mid',
  senior: 'Senior', lead: 'Lead',   executive: 'Exec',
};

function formatUSD(value: number) {
  return `$${(value / 1000).toFixed(0)}k`;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-hover)', border: '1px solid var(--border-bright)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, marginTop: 2 }}>
          {p.name}: <span style={{ color: 'var(--text-1)' }}>{formatUSD(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export function SalaryChart({ data, isLoading }: SalaryChartProps) {
  const sorted = (data?.data ?? [])
    .slice()
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level))
    .map((d) => ({ ...d, level: LEVEL_LABELS[d.level] ?? d.level }));

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Salary by Seniority</h2>
        <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Annual USD</span>
      </div>

      {isLoading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading...</div>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 32, opacity: 0.3 }}>$</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No salary data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sorted} margin={{ bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="level" tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatUSD} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-2)' }} />
            <Bar dataKey="p25"    name="25th pctile" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
            <Bar dataKey="median" name="Median"      fill="#00d4ff" radius={[2, 2, 0, 0]} />
            <Bar dataKey="p75"    name="75th pctile" fill="#7c3aed" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
