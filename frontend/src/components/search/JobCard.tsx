import Link from 'next/link';
import { JobSummary } from '@/types/api.types';
import { Badge } from '@/components/ui/Badge';
import { formatSalary, timeAgo, formatSeniority, formatJobType } from '@/lib/formatters';

interface JobCardProps {
  job: JobSummary;
}

export function JobCard({ job }: JobCardProps) {
  const salary   = formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.isEstimated);
  const hasSalary = !!(job.salary.min || job.salary.max);
  const initials  = job.company.name.slice(0, 2).toUpperCase();

  return (
    <Link href={`/jobs/${job.jobId}`} className="block group">
      <div
        className="card-dark p-5 group-hover:border-[var(--border-bright)]"
        style={{ transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>

          {/* Left: avatar + info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            <div style={{
              height: 40, width: 40, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #0a1628, #0e2040)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--cyan)',
              letterSpacing: '0.05em',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{
                fontWeight: 600, fontSize: 15, color: 'var(--text-1)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
                className="group-hover:text-[var(--cyan)]"
              >
                {job.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
                {job.company.name}
              </p>
            </div>
          </div>

          {/* Right: salary + time */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {hasSalary && (
              <p style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{salary}</p>
            )}
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(job.postedAt)}</p>
          </div>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {job.location.isRemote
            ? <Badge variant="green">Remote</Badge>
            : job.location.raw && <Badge variant="gray">{job.location.raw}</Badge>
          }
          {formatJobType(job.jobType) && <Badge variant="blue">{formatJobType(job.jobType)}</Badge>}
          {formatSeniority(job.seniorityLevel) && <Badge variant="purple">{formatSeniority(job.seniorityLevel)}</Badge>}
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            {job.skills.slice(0, 6).map((skill) => (
              <span key={skill} className="tag-dark">{skill}</span>
            ))}
            {job.skills.length > 6 && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '2px 4px' }}>
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
