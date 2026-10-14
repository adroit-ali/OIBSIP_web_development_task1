import cron from 'node-cron';
import dbStore from '../models/store.js';
import { sendLowStockAlertEmail } from '../config/emailService.js';
import { getIO } from '../socket/socketHandler.js';

export const initStockNotifierCron = () => {
  // Run every 10 minutes (* /10 * * * *) in production, or configurable
  // For easy demonstration, also logs low stock summary
  const cronSchedule = process.env.CRON_SCHEDULE || '*/15 * * * *';

  console.log(`⏰ Initializing Inventory Stock Monitor Cron Job (${cronSchedule})...`);

  cron.schedule(cronSchedule, async () => {
    try {
      console.log('🔍 [CRON JOB] Running scheduled inventory low-stock audit...');
      const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '20', 10);
      const lowStockItems = await dbStore.getLowStockItems(threshold);

      if (lowStockItems.length > 0) {
        console.warn(`⚠️ [CRON JOB] Detected ${lowStockItems.length} items below threshold (${threshold})!`);
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@slicecraft.com';

        await sendLowStockAlertEmail(adminEmail, lowStockItems, threshold);

        const io = getIO();
        if (io) {
          io.emit('inventory:low_stock_alert', {
            count: lowStockItems.length,
            items: lowStockItems,
            source: 'cron_scheduler',
            checkedAt: new Date(),
          });
        }
      } else {
        console.log('✅ [CRON JOB] All inventory ingredient stocks are healthy.');
      }
    } catch (err) {
      console.error('Cron job stock audit error:', err.message);
    }
  });
};
