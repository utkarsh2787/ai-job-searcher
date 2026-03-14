import { Request, Response } from 'express';
import {
  getSkillsSnapshot,
  getCompaniesSnapshot,
  getSalarySnapshot,
  getJobGrowthSnapshot,
  getLocationsSnapshot,
  getPlatformStats,
} from '../services/analytics.service';

export async function handleGetSkills(req: Request, res: Response): Promise<void> {
  try {
    const period = (req.query.period as '7d' | '30d') ?? '7d';
    const data = await getSkillsSnapshot(period);

    if (!data) {
      res.status(503).json({ success: false, error: 'Analytics not yet available. Please check back shortly.' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('[analytics] Skills error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch skills data.' });
  }
}

export async function handleGetCompanies(req: Request, res: Response): Promise<void> {
  try {
    const period = (req.query.period as '7d' | '30d') ?? '30d';
    const data = await getCompaniesSnapshot(period);

    if (!data) {
      res.status(503).json({ success: false, error: 'Analytics not yet available.' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('[analytics] Companies error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch company data.' });
  }
}

export async function handleGetSalary(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSalarySnapshot();

    if (!data) {
      res.status(503).json({ success: false, error: 'Analytics not yet available.' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('[analytics] Salary error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch salary data.' });
  }
}

export async function handleGetJobGrowth(req: Request, res: Response): Promise<void> {
  try {
    const data = await getJobGrowthSnapshot();
    res.json({ success: true, data: data ?? { series: [] } });
  } catch (err) {
    console.error('[analytics] Job growth error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch job growth data.' });
  }
}

export async function handleGetLocations(req: Request, res: Response): Promise<void> {
  try {
    const data = await getLocationsSnapshot();
    res.json({ success: true, data: data ?? { locations: [] } });
  } catch (err) {
    console.error('[analytics] Locations error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch location data.' });
  }
}

export async function handleGetStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[analytics] Stats error:', err instanceof Error ? err.message : err);
    res.status(500).json({ success: false, error: 'Failed to fetch platform stats.' });
  }
}
