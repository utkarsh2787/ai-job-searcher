import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RawJobEvent, TheMuseRawJob } from '@job-platform/shared-types';
import { publishRawJob } from '../kafka/producer';
import { config } from '../config';

// The Muse requires repeated params for arrays (level=a&level=b), not level[0]=a
function toRepeatedParams(params: Record<string, string | string[] | number | boolean>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

const BASE_URL = 'https://www.themuse.com/api/public/jobs';

interface TheMuseResponse {
  results: TheMuseRawJob[];
  page_count: number;
  total: number;
  page: number;
}

export async function collectTheMuse(): Promise<void> {
  console.log('[themuse] Starting collection...');

  let totalPublished = 0;

  // Fetch 3 pages of tech-focused jobs
  for (let page = 1; page <= 3; page++) {
    try {
      const qs = toRepeatedParams({
        api_key:    config.THEMUSE_API_KEY,
        category:   'Software Engineer',
        level:      ['Mid Level', 'Senior Level', 'Management & Executive'],
        page,
        descending: true,
      });
      const response = await axios.get<TheMuseResponse>(`${BASE_URL}?${qs}`, {
        timeout: 15000,
      });

      const jobs = response.data.results ?? [];
      console.log(`[themuse] Fetched ${jobs.length} jobs on page ${page}`);

      for (const job of jobs) {
        const event: RawJobEvent = {
          eventId: uuidv4(),
          eventType: 'job.raw',
          schemaVersion: '1.0',
          producedAt: new Date().toISOString(),
          source: 'themuse',
          sourceJobId: String(job.id),
          payload: job,
        };

        await publishRawJob(event);
        totalPublished++;
      }

      // Respect rate limits
      await sleep(300);
    } catch (err) {
      console.error(`[themuse] Failed page ${page}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`[themuse] Collection complete. Published ${totalPublished} events.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
