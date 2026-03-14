import cron from 'node-cron';
import { collectRemotive } from '../collectors/remotive.collector';
import { collectAdzuna } from '../collectors/adzuna.collector';
import { collectTheMuse } from '../collectors/themuse.collector';
import { config } from '../config';

// Convert minute interval → cron expression
function minutesToCron(minutes: number): string {
  return `*/${minutes} * * * *`;
}

export function startScheduler(): void {
  const remotiveCron = minutesToCron(config.POLL_INTERVAL_REMOTIVE);
  const adzunaCron   = minutesToCron(config.POLL_INTERVAL_ADZUNA);
  const theMuseCron  = minutesToCron(config.POLL_INTERVAL_THEMUSE);

  console.log(`[scheduler] Remotive  → every ${config.POLL_INTERVAL_REMOTIVE}m  (${remotiveCron})`);
  console.log(`[scheduler] Adzuna    → every ${config.POLL_INTERVAL_ADZUNA}m  (${adzunaCron})`);
  console.log(`[scheduler] The Muse  → every ${config.POLL_INTERVAL_THEMUSE}m  (${theMuseCron})`);

  cron.schedule(remotiveCron, () => {
    collectRemotive().catch((err) =>
      console.error('[scheduler] Remotive collection error:', err)
    );
  });

  cron.schedule(adzunaCron, () => {
    collectAdzuna().catch((err) =>
      console.error('[scheduler] Adzuna collection error:', err)
    );
  });

  cron.schedule(theMuseCron, () => {
    collectTheMuse().catch((err) =>
      console.error('[scheduler] The Muse collection error:', err)
    );
  });

  console.log('[scheduler] All collectors scheduled.');
}
