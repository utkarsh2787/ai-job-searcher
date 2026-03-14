// Salary
export function formatSalary(min?: number, max?: number, currency = 'USD', isEstimated = false): string {
  if (!min && !max) return 'Salary not listed';

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  const prefix = isEstimated ? '~' : '';

  if (min && max && min !== max) return `${prefix}${fmt(min)} – ${fmt(max)}`;
  if (min) return `${prefix}${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return 'Salary not listed';
}

// Relative time
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 60)  return `${minutes}m ago`;
  if (hours   < 24)  return `${hours}h ago`;
  if (days    < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Seniority display
export function formatSeniority(level: string): string {
  const MAP: Record<string, string> = {
    intern:    'Intern',
    junior:    'Junior',
    mid:       'Mid-level',
    senior:    'Senior',
    lead:      'Lead / Staff',
    executive: 'Executive',
    unknown:   '',
  };
  return MAP[level] ?? level;
}

// Job type display
export function formatJobType(type: string): string {
  const MAP: Record<string, string> = {
    full_time:  'Full-time',
    part_time:  'Part-time',
    contract:   'Contract',
    internship: 'Internship',
    unknown:    '',
  };
  return MAP[type] ?? type;
}

// Source display
export function formatSource(source: string): string {
  const MAP: Record<string, string> = {
    remotive: 'Remotive',
    adzuna:   'Adzuna',
    themuse:  'The Muse',
  };
  return MAP[source] ?? source;
}

// Number abbreviation
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
