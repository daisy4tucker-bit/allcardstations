import { Router, Request, Response } from 'express';
import { sendTestEmailNotification } from '../services/emailService.js';

const router = Router();

/**
 * GET /api/email/status
 * Returns current admin email notification configuration status.
 */
router.get('/status', (req: Request, res: Response) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'daisy4tucker@gmail.com';
  const smtpHost = process.env.SMTP_HOST?.trim();
  const isSmtpConfigured = Boolean(smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS);

  res.json({
    status: 'ok',
    adminEmail,
    isSmtpConfigured,
    smtpHost: smtpHost || 'Not Set (Using Server Console Notification Logs)',
    deliveryMode: isSmtpConfigured ? 'Direct SMTP Delivery' : 'Server Log Fallback',
  });
});

/**
 * POST /api/email/test
 * Sends a live test email notification to Admin.
 */
router.post('/test', async (req: Request, res: Response) => {
  const customRecipient = req.body.recipientEmail || req.body.recipient;
  try {
    const result = await sendTestEmailNotification(customRecipient);
    if (result.success) {
      res.json({
        status: 'ok',
        deliveryMode: result.mode,
        message: result.message,
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.message,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to trigger test email',
    });
  }
});

export default router;
