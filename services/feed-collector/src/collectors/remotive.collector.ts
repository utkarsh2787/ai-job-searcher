import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RawJobEvent, RemotiveRawJob } from '@job-platform/shared-types';
import { publishRawJob } from '../kafka/producer';

const BASE_URL = 'https://remotive.com/api/remote-jobs';

interface RemotiveResponse {
  jobs: RemotiveRawJob[];
  'job-count': number;
}

export async function collectRemotive(): Promise<void> {
  console.log('[remotive] Starting collection...');

  let totalPublished = 0;

  // Fetch across top tech categories for broader coverage
  const categories = ['software-dev', 'data', 'devops-sysadmin', 'product'];

  for (const category of categories) {
    try {
      const response = await axios.get<RemotiveResponse>(BASE_URL, {
        params: { category, limit: 50 },
        timeout: 15000,
      });

      const jobs = response.data.jobs ?? [];
      console.log(`[remotive] Fetched ${jobs.length} jobs for category: ${category}`);

      for (const job of jobs) {
        const event: RawJobEvent = {
          eventId: uuidv4(),
          eventType: 'job.raw',
          schemaVersion: '1.0',
          producedAt: new Date().toISOString(),
          source: 'remotive',
          sourceJobId: String(job.id),
          payload: job,
        };

        await publishRawJob(event);
        totalPublished++;
      }
    } catch (err) {
      console.error(`[remotive] Failed to fetch category ${category}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`[remotive] Collection complete. Published ${totalPublished} events.`);
}
