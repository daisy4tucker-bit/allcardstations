const sharp = require('sharp');
const fs = require('fs');

async function generateModestOG() {
  const width = 1200;
  const height = 630;

  // 1. Process background photo - warm gift aesthetic (1200x630)
  const bg = await sharp('/tmp/unsplash_gift.jpg')
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Create an elegant, modest overlay SVG with clean typography and relatable messaging
  const overlaySvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="photoVignette" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#090d16" stop-opacity="0.92" />
        <stop offset="42%" stop-color="#090d16" stop-opacity="0.80" />
        <stop offset="70%" stop-color="#090d16" stop-opacity="0.30" />
        <stop offset="100%" stop-color="#090d16" stop-opacity="0.05" />
      </linearGradient>
    </defs>

    <!-- Warm vignette so text is perfectly crisp and readable while photo shines on right -->
    <rect width="${width}" height="${height}" fill="url(#photoVignette)" />

    <!-- Left Content Column -->
    <g transform="translate(80, 110)">
      
      <!-- Brand Pill -->
      <g transform="translate(0, 0)">
        <rect width="168" height="34" rx="17" fill="#4f46e5" fill-opacity="0.3" stroke="#818cf8" stroke-width="1.2" stroke-opacity="0.7" />
        <circle cx="22" cy="17" r="5" fill="#60a5fa" />
        <text x="36" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#e0e7ff" letter-spacing="1">ALLCARDSTATUS</text>
      </g>

      <!-- Main Warm Headline -->
      <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
        Digital Gift Cards
      </text>
      <text x="0" y="155" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#cbd5e1" letter-spacing="-0.5">
        Made Simple &amp; Safe
      </text>

      <!-- Modest, Relatable Subtitle -->
      <text x="0" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#e2e8f0">
        Instantly send digital cards for gaming, apps, and shopping.
      </text>
      <text x="0" y="258" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#94a3b8">
        Fast delivery straight to your email with verified codes.
      </text>

      <!-- Trust Pillars (Friendly, modest rounded badges) -->
      <g transform="translate(0, 310)">
        <!-- Badge 1 -->
        <g transform="translate(0, 0)">
          <rect width="180" height="42" rx="21" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-width="1" stroke-opacity="0.12" />
          <circle cx="22" cy="21" r="5" fill="#10b981" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Instant Delivery</text>
        </g>

        <!-- Badge 2 -->
        <g transform="translate(195, 0)">
          <rect width="185" height="42" rx="21" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-width="1" stroke-opacity="0.12" />
          <circle cx="22" cy="21" r="5" fill="#38bdf8" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Verified Codes</text>
        </g>

        <!-- Badge 3 -->
        <g transform="translate(395, 0)">
          <rect width="185" height="42" rx="21" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-width="1" stroke-opacity="0.12" />
          <circle cx="22" cy="21" r="5" fill="#a78bfa" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Top 24+ Brands</text>
        </g>
      </g>

      <!-- Brand Logos / Text -->
      <g transform="translate(0, 395)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#64748b" letter-spacing="0.2">
          Apple • Steam • Amazon • PlayStation • Xbox • Google Play • Netflix
        </text>
      </g>

    </g>
  </svg>
  `;

  await sharp(bg)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toFile('./public/og-image.png');

  await sharp('./public/og-image.png')
    .jpeg({ quality: 92 })
    .toFile('./public/og-image.jpg');

  console.log('Successfully created modest, relatable og-image.png and og-image.jpg');
}

generateModestOG().catch(console.error);
