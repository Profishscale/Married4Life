import cron from 'node-cron';
import { scheduledCheckInService } from './scheduledCheckInService';

/**
 * Initialize and start all scheduled tasks
 */
export function initializeCronJobs(): void {
  console.log('⏰ Initializing scheduled tasks...');

  // Daily check-in at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Daily check-in triggered');
    await scheduledCheckInService.sendDailyCheckIns();
  });

  // Weekly reflection every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('🕐 Weekly reflection triggered');
    await scheduledCheckInService.sendWeeklyReflections();
  });

  console.log('✅ Cron jobs initialized:');
  console.log('  - Daily check-in: 9:00 AM every day');
  console.log('  - Weekly reflection: 9:00 AM every Monday');
}

/**
 * Manual trigger for testing (does not require waiting for scheduled time)
 */
export async function triggerDailyCheckIn(): Promise<void> {
  console.log('🧪 Manual trigger: Daily check-in');
  await scheduledCheckInService.sendDailyCheckIns();
}

export async function triggerWeeklyReflection(): Promise<void> {
  console.log('🧪 Manual trigger: Weekly reflection');
  await scheduledCheckInService.sendWeeklyReflections();
}

