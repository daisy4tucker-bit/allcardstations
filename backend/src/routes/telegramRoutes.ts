import { Router } from 'express';
import { sendTelegramTestMessage } from '../services/telegramService.js';

const router = Router();

// GET /api/telegram/status - Check if Telegram bot variables are configured
router.get('/status', (req, res) => {
  const isConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  res.json({
    status: 'ok',
    isConfigured,
    botTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    chatIdConfigured: Boolean(process.env.TELEGRAM_CHAT_ID),
  });
});

// POST /api/telegram/test - Send a test alert to Telegram
router.post('/test', async (req, res) => {
  const { botToken, chatId } = req.body || {};
  const result = await sendTelegramTestMessage(botToken, chatId);
  
  if (result.success) {
    res.json({ status: 'ok', message: result.message });
  } else {
    res.status(400).json({ status: 'error', message: result.message });
  }
});

export default router;
