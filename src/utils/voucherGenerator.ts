import { PurchaseTransaction } from '../types/order';

/**
 * Formats a currency amount with symbol.
 */
export const formatAmount = (amount: number, currency: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
  };
  const sym = symbols[currency] || `${currency} `;
  return `${sym}${amount.toFixed(2)}`;
};

/**
 * Generates an SVG Barcode element string for receipts and vouchers.
 */
export const generateBarcodeSvg = (code: string): string => {
  // Generates visual barcode stripes from code characters
  const bars = Array.from(code).map((char, index) => {
    const width = (char.charCodeAt(0) % 3) + 1.5;
    const height = 45 + ((char.charCodeAt(0) * 7) % 20);
    return `<rect x="${index * 7 + 10}" y="5" width="${width}" height="${height}" fill="#1e293b" />`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${code.length * 7 + 25} 75" class="barcode-svg" style="width: 100%; max-width: 280px; height: 60px;">
      <rect width="100%" height="100%" fill="#ffffff" />
      ${bars}
      <text x="50%" y="70" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748b" font-weight="bold">${code}</text>
    </svg>
  `;
};

/**
 * Builds printable HTML template for an eGift Card Voucher & Official Receipt.
 */
export const buildVoucherHtml = (tx: PurchaseTransaction): string => {
  const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const expiryDate = tx.expiresAt || new Date(new Date(tx.createdAt).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const barcodeSvg = generateBarcodeSvg(tx.eCode || tx.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AllCardVault - eGift Card Voucher & Receipt (${tx.id})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 32px; }
    .voucher-card { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { color: #a5b4fc; }
    .badge { background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .body { padding: 32px; }
    .card-banner { background: #f1f5f9; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .card-title { font-size: 20px; font-weight: 800; color: #1e293b; }
    .card-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
    .card-val { font-size: 28px; font-weight: 900; color: #4f46e5; text-align: right; }
    .crypto-val { font-size: 12px; font-family: monospace; color: #d97706; font-weight: 700; }
    .credentials { background: #faf5ff; border: 2px dashed #c084fc; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px; }
    .cred-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #7e22ce; letter-spacing: 1px; margin-bottom: 8px; }
    .ecode { font-family: monospace; font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #1e1b4b; background: #ffffff; padding: 10px 20px; border-radius: 10px; display: inline-block; border: 1px solid #e9d5ff; }
    .pin-row { margin-top: 12px; font-size: 14px; color: #581c87; font-weight: 600; }
    .pin-val { font-family: monospace; font-weight: 800; background: #f3e8ff; padding: 2px 8px; border-radius: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .item { background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .item-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .item-val { font-size: 13px; color: #0f172a; font-weight: 700; margin-top: 2px; word-break: break-all; }
    .barcode-section { text-align: center; margin: 24px 0 16px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; }
    @media print {
      body { padding: 0; background: transparent; }
      .voucher-card { box-shadow: none; border: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <div class="logo">All<span>Card</span>Vault</div>
      <div class="badge">Official eGift Voucher</div>
    </div>
    <div class="body">
      <div class="card-banner">
        <div>
          <div class="card-title">${tx.cardName}</div>
          <div class="card-meta">Instant Digital Code • Order ID: ${tx.id}</div>
        </div>
        <div>
          <div class="card-val">${formatAmount(tx.amount, tx.currency)}</div>
          <div class="crypto-val">Paid: ${tx.cryptoAmount} ${tx.cryptoCurrency}</div>
        </div>
      </div>

      <div class="credentials">
        <div class="cred-label">Your Digital Redemption Code</div>
        <div class="ecode">${tx.eCode || 'ACV-9842-7719-5501'}</div>
        ${tx.pin ? `<div class="pin-row">Security PIN: <span class="pin-val">${tx.pin}</span></div>` : ''}
      </div>

      <div class="barcode-section">
        ${barcodeSvg}
      </div>

      <div class="grid">
        <div class="item">
          <div class="item-label">Delivery Recipient</div>
          <div class="item-val">${tx.customerEmail}</div>
        </div>
        <div class="item">
          <div class="item-label">Status</div>
          <div class="item-val" style="color: #059669;">${tx.statusLabel || tx.status}</div>
        </div>
        <div class="item">
          <div class="item-label">Issue Date</div>
          <div class="item-val">${formattedDate}</div>
        </div>
        <div class="item">
          <div class="item-label">Valid Until</div>
          <div class="item-val">${expiryDate}</div>
        </div>
        ${tx.txHash ? `
        <div class="item" style="grid-column: span 2;">
          <div class="item-label">Blockchain TX Hash</div>
          <div class="item-val font-mono">${tx.txHash}</div>
        </div>` : ''}
      </div>
    </div>
    <div class="footer">
      <p>This is a verified digital gift card token issued by AllCardVault Enterprise Marketplace.</p>
      <p>Redeemable directly on official merchant storefronts or apps. For 24/7 support, contact support@allcardvault.com.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Triggers a browser print popup for the eGift voucher.
 */
export const printVoucher = (tx: PurchaseTransaction): void => {
  const html = buildVoucherHtml(tx);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  }
};

/**
 * Triggers a download of the eGift voucher HTML/PDF receipt file.
 */
export const downloadVoucherFile = (tx: PurchaseTransaction): void => {
  const html = buildVoucherHtml(tx);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AllCardVault-Voucher-${tx.cardName.replace(/\s+/g, '-')}-${tx.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
