import { JobSummary } from '@/types/api.types';
import { JobCard } from './JobCard';
import { Spinner } from '@/components/ui/Spinner';

interface JobListProps {
  jobs:         JobSummary[];
  total:        number;
  page:         number;
  pages:        number;
  isLoading:    boolean;
  onPageChange: (page: number) => void;
}

export function JobList({ jobs, total, page, pages, isLoading, onPageChange }: JobListProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-2)' }}>
        <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-1)' }}>No jobs found</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>
        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{' '}
        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{total.toLocaleString()}</span> jobs
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jobs.map((job) => <JobCard key={job.jobId} job={job} />)}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 }}>
          <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1}>← Prev</PageBtn>

          {getPaginationRange(page, pages).map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} style={{ color: 'var(--text-3)', padding: '0 4px' }}>…</span>
            ) : (
              <PageBtn key={p} onClick={() => onPageChange(Number(p))} active={p === page}>{p}</PageBtn>
            )
          )}

          <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= pages}>Next →</PageBtn>
        </div>
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 12px', fontSize: 12, borderRadius: 6, border: '1px solid',
        borderColor: active ? 'var(--cyan)' : 'var(--border)',
        background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
        color: active ? 'var(--cyan)' : disabled ? 'var(--text-3)' : 'var(--text-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function getPaginationRange(page: number, pages: number): Array<number | '...'> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const range: Array<number | '...'> = [1];
  if (page > 3) range.push('...');
  for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) range.push(p);
  if (page < pages - 2) range.push('...');
  range.push(pages);
  return range;
}
