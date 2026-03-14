import { Request, Response } from 'express';
import { searchJobs, getJobById } from '../services/elasticsearch.service';
import { JobSearchParams } from '../middleware/validation.middleware';

export async function handleJobSearch(req: Request, res: Response): Promise<void> {
  try {
    const params = req.query as unknown as JobSearchParams;
    const results = await searchJobs(params);
    res.json({ success: true, ...results });
  } catch (err) {
    console.error('[jobs] Search error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Search failed. Please try again.' });
  }
}

export async function handleGetJobById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || id.length < 10) {
      res.status(400).json({ success: false, error: 'Invalid job ID' });
      return;
    }

    const job = await getJobById(id);

    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error('[jobs] Get by ID error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch job.' });
  }
}
