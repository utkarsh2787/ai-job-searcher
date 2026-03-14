import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getJobById } from '@/lib/api-client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatSalary, timeAgo, formatSeniority, formatJobType, formatSource } from '@/lib/formatters';

interface Props {
  params: { id: string };
}

export default async function JobDetailPage({ params }: Props) {
  let job;
  try {
    const res = await getJobById(params.id);
    job = res.job;
  } catch {
    notFound();
  }

  const salary = formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.isEstimated);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-base font-bold text-gray-500">
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600 mt-0.5">{job.company.name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.location.isRemote
                    ? <Badge variant="green">Remote</Badge>
                    : job.location.raw && <Badge variant="gray">{job.location.raw}</Badge>
                  }
                  {formatJobType(job.jobType) && <Badge variant="blue">{formatJobType(job.jobType)}</Badge>}
                  {formatSeniority(job.seniorityLevel) && <Badge>{formatSeniority(job.seniorityLevel)}</Badge>}
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description ? job.description.slice(0, 4000) : 'No description available.'}
              {job.description && job.description.length > 4000 && (
                <span className="text-gray-400"> [truncated]</span>
              )}
            </div>
          </Card>

          {/* Skills */}
          {job.skills.length > 0 && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
            <dl className="space-y-2.5 text-sm">
              <InfoRow label="Salary" value={salary} highlight={!!(job.salary.min || job.salary.max)} />
              <InfoRow label="Category" value={job.category} />
              <InfoRow label="Posted" value={timeAgo(job.postedAt)} />
              <InfoRow label="Source" value={formatSource(job.source)} />
            </dl>
          </Card>

          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Apply on {formatSource(job.source)} →
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-medium text-right ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</dd>
    </div>
  );
}
