import { PlatformStats } from '@/types/api.types';
import { formatCount } from '@/lib/formatters';

interface StatsBarProps {
  stats: PlatformStats | undefined;
}

const ITEMS = [
  { key: 'totalJobs',      label: 'Total Jobs',      icon: '◈', color: '#00d4ff' },
  { key: 'totalCompanies', label: 'Companies',        icon: '⬡', color: '#7c3aed' },
  { key: 'remoteJobs',     label: 'Remote Jobs',      icon: '⊕', color: '#10b981' },
  { key: 'jobsLast7Days',  label: 'Added This Week',  icon: '↑', color: '#f59e0b' },
] as const;

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ITEMS.map(({ key, label, icon, color }) => {
        const value = stats ? formatCount(stats[key]) : null;
        return (
          <div key={key} className="stat-card p-4 text-center">
            <div style={{ fontSize: 20, marginBottom: 4, color }}>{icon}</div>
            <p style={{ fontSize: 26, fontWeight: 700, color: value ? '#e2e8f0' : 'var(--text-3)', letterSpacing: '-0.02em' }}>
              {value ?? '—'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
