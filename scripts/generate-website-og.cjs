const sharp = require('sharp');
const fs = require('fs');

async function renderCard(svgPath, width, height, radius = 16, strokeColor = '#3b82f6', rotateDeg = 0) {
  // 1. Render raw SVG to dimensions
  const cardRaw = await sharp(svgPath)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  // 2. Rounded corner mask
  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff" />
    </svg>
  `);

  const rounded = await sharp(cardRaw)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Add luxury border, inner edge highlight, and drop shadow
  const pad = 30;
  const outerW = width + pad * 2;
  const outerH = height + pad * 2;

  const framed = await sharp({
    create: {
      width: outerW,
      height: outerH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${outerW}" height="${outerH}">
          <defs>
            <filter id="cShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.8" />
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${strokeColor}" flood-opacity="0.25" />
            </filter>
          </defs>
          <!-- Deep Card Shadow -->
          <rect x="${pad}" y="${pad}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#0f172a" filter="url(#cShadow)" />
          <!-- Neon Accent Border -->
          <rect x="${pad}" y="${pad}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-opacity="0.8" />
        </svg>
      `),
      top: 0,
      left: 0
    },
    {
      input: rounded,
      top: pad,
      left: pad
    },
    {
      // Specular glass shine on top rim
      input: Buffer.from(`
        <svg width="${outerW}" height="${outerH}">
          <path d="M ${pad + 2} ${pad + 2} L ${pad + width - 2} ${pad + 2} L ${pad + width - 2} ${pad + 4} L ${pad + 2} ${pad + 4} Z" fill="#ffffff" opacity="0.3" />
        </svg>
      `),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toBuffer();

  // 4. Rotate if needed
  if (rotateDeg !== 0) {
    return await sharp(framed)
      .rotate(rotateDeg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  return framed;
}

async function generateOG() {
  const width = 1200;
  const height = 630;

  console.log('Rendering 3D styled brand cards...');
  const cardW = 280;
  const cardH = 175;

  // Background cards: Steam, Amazon, PlayStation
  const steamCard = await renderCard('./public/cards/steam.svg', cardW, cardH, 16, '#0284c7', 8);
  const amazonCard = await renderCard('./public/cards/amazon.svg', cardW, cardH, 16, '#d97706', -10);
  const playstationCard = await renderCard('./public/cards/playstation.svg', cardW, cardH, 16, '#4f46e5', 5);
  
  // Hero Front Card: Apple (larger, high contrast, radiant border)
  const heroW = 310;
  const heroH = 194;
  const appleCard = await renderCard('./public/cards/apple.svg', heroW, heroH, 18, '#38bdf8', -3);

  // Status HUD Card: Floating Verification Badge
  const statusHudSvg = Buffer.from(`
    <svg width="340" height="96" viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1329" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
        </linearGradient>
        <filter id="hudShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.8" />
          <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#10b981" flood-opacity="0.35" />
        </filter>
      </defs>

      <!-- Glass HUD Body -->
      <rect x="4" y="4" width="332" height="88" rx="16" fill="url(#hudGrad)" stroke="#10b981" stroke-width="1.8" filter="url(#hudShadow)" />
      
      <!-- Verified Icon -->
      <g transform="translate(20, 24)">
        <circle cx="24" cy="24" r="22" fill="#064e3b" stroke="#10b981" stroke-width="2" />
        <path d="M 16 24 L 22 30 L 32 18" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Status Text -->
      <g transform="translate(76, 26)">
        <text x="0" y="14" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="800" fill="#34d399" letter-spacing="1">CARD STATUS: VERIFIED &amp; ACTIVE</text>
        <text x="0" y="36" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="900" fill="#ffffff">Instant Balance Check</text>
        <text x="0" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Ready for instant email delivery</text>
      </g>
    </svg>
  `);
  const statusHud = await sharp(statusHudSvg).png().toBuffer();

  // Base layout SVG
  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Luxury Dark Canvas -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050811" />
        <stop offset="40%" stop-color="#091124" />
        <stop offset="100%" stop-color="#060a14" />
      </linearGradient>

      <!-- Electric Brand Lighting -->
      <radialGradient id="royalGlow" cx="18%" cy="22%" r="65%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.38" />
        <stop offset="60%" stop-color="#1e1b4b" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="cyanGlow" cx="82%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.30" />
        <stop offset="50%" stop-color="#4f46e5" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="emeraldGlow" cx="65%" cy="85%" r="45%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <!-- Subtle background grid -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.45" />
      </pattern>

      <!-- Text Gradient for Headline Accent -->
      <linearGradient id="headlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="50%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>

      <filter id="pillGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#2563eb" flood-opacity="0.5" />
      </filter>
    </defs>

    <!-- Background Base -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />
    <rect width="${width}" height="${height}" fill="url(#royalGlow)" />
    <rect width="${width}" height="${height}" fill="url(#cyanGlow)" />
    <rect width="${width}" height="${height}" fill="url(#emeraldGlow)" />

    <!-- Premium Inset Rim Frame -->
    <rect x="18" y="18" width="1164" height="594" rx="22" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.85" />
    <rect x="20" y="20" width="1160" height="590" rx="20" fill="none" stroke="#3b82f6" stroke-width="1" stroke-opacity="0.15" />

    <!-- ================= LEFT COLUMN: CLEAN TYPOGRAPHY & VALUE ================= -->
    <g transform="translate(68, 62)">
      
      <!-- Brand Pill Header with Verified Live Dot -->
      <g transform="translate(0, 0)" filter="url(#pillGlow)">
        <rect width="250" height="38" rx="19" fill="#0f172a" stroke="#3b82f6" stroke-width="1.6" />
        <!-- Glowing Pulse Dot -->
        <circle cx="22" cy="19" r="6" fill="#10b981" />
        <circle cx="22" cy="19" r="10" fill="#10b981" opacity="0.25" />
        <text x="38" y="24" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="1.2">ALLCARDSTATUS</text>
        <text x="156" y="24" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" letter-spacing="0.8">• VERIFIED</text>
      </g>

      <!-- Main Headline in High-End Modern Archetype -->
      <text x="0" y="98" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="-1">
        Buy, Send &amp; Check
      </text>
      <text x="0" y="158" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="900" fill="url(#headlineGrad)" letter-spacing="-1">
        Digital Gift Cards
      </text>

      <!-- Subtitle Matching Official Site Description -->
      <text x="0" y="218" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="500" fill="#e2e8f0">
        Check your gift card status &amp; buy digital codes online.
      </text>
      <text x="0" y="248" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="400" fill="#94a3b8">
        Instant email delivery • 24+ top brands • Secure checkout
      </text>

      <!-- Value Proposition Pillars -->
      <g transform="translate(0, 296)">
        <!-- Pillar 1: Check Card Status -->
        <g transform="translate(0, 0)">
          <rect width="176" height="42" rx="21" fill="#0b1329" stroke="#1e293b" stroke-width="1.4" />
          <circle cx="22" cy="21" r="6" fill="#38bdf8" />
          <text x="38" y="26" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">Check Card Status</text>
        </g>

        <!-- Pillar 2: Instant Delivery -->
        <g transform="translate(188, 0)">
          <rect width="168" height="42" rx="21" fill="#0b1329" stroke="#1e293b" stroke-width="1.4" />
          <circle cx="22" cy="21" r="6" fill="#10b981" />
          <text x="38" y="26" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">Instant Delivery</text>
        </g>

        <!-- Pillar 3: Zero Hidden Fees -->
        <g transform="translate(368, 0)">
          <rect width="164" height="42" rx="21" fill="#0b1329" stroke="#1e293b" stroke-width="1.4" />
          <circle cx="22" cy="21" r="6" fill="#f59e0b" />
          <text x="38" y="26" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">Zero Extra Fees</text>
        </g>
      </g>

      <!-- Popular Brand Badges Grid -->
      <g transform="translate(0, 376)">
        <text x="0" y="0" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="800" fill="#64748b" letter-spacing="1.5">FEATURED GLOBAL BRANDS</text>
        
        <!-- Row 1 -->
        <g transform="translate(0, 14)">
          <!-- Apple Badge -->
          <g transform="translate(0, 0)">
            <rect width="102" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <text x="51" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle"> Apple</text>
          </g>

          <!-- Steam Badge -->
          <g transform="translate(112, 0)">
            <rect width="106" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#38bdf8" />
            <text x="60" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Steam</text>
          </g>

          <!-- Amazon Badge -->
          <g transform="translate(228, 0)">
            <rect width="118" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#f59e0b" />
            <text x="66" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Amazon</text>
          </g>

          <!-- PlayStation Badge -->
          <g transform="translate(356, 0)">
            <rect width="134" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#818cf8" />
            <text x="74" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">PlayStation</text>
          </g>
        </g>

        <!-- Row 2 -->
        <g transform="translate(0, 58)">
          <!-- Xbox Badge -->
          <g transform="translate(0, 0)">
            <rect width="102" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#22c55e" />
            <text x="58" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Xbox</text>
          </g>

          <!-- Google Play Badge -->
          <g transform="translate(112, 0)">
            <rect width="134" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#10b981" />
            <text x="74" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Google Play</text>
          </g>

          <!-- Netflix Badge -->
          <g transform="translate(256, 0)">
            <rect width="108" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#ef4444" />
            <text x="61" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Netflix</text>
          </g>

          <!-- Visa / Vanilla Badge -->
          <g transform="translate(374, 0)">
            <rect width="116" height="34" rx="17" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="20" cy="17" r="5" fill="#3b82f6" />
            <text x="65" y="22" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9" text-anchor="middle">Visa / Van.</text>
          </g>
        </g>
      </g>

      <!-- Trust Footer Line -->
      <g transform="translate(0, 488)">
        <text x="0" y="0" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#475569">
          allcardstatus.com • Official Digital Gift Card Marketplace
        </text>
      </g>

    </g>
  </svg>
  `;

  console.log('Compositing master image with layered 3D fan...');
  const baseBuffer = await sharp(Buffer.from(baseSvg)).png().toBuffer();

  const finalImage = await sharp(baseBuffer)
    .composite([
      // Layer 1 (Back Left): Amazon Card
      { input: amazonCard, left: 630, top: 40 },
      // Layer 2 (Back Right): Steam Card
      { input: steamCard, left: 830, top: 90 },
      // Layer 3 (Lower Right): PlayStation Card
      { input: playstationCard, left: 810, top: 290 },
      // Layer 4 (Hero Center): Apple Card (front and prominent)
      { input: appleCard, left: 640, top: 195 },
      // Layer 5 (Floating Status HUD widget): Highlights "Check Card Status" in real time
      { input: statusHud, left: 690, top: 445 }
    ])
    .png()
    .toBuffer();

  // Save both PNG and high-quality JPG
  fs.writeFileSync('./public/og-image.png', finalImage);

  const jpgBuffer = await sharp(finalImage)
    .jpeg({ quality: 93 })
    .toBuffer();
  fs.writeFileSync('./public/og-image.jpg', jpgBuffer);

  // Copy to dist if dist exists
  if (fs.existsSync('./dist')) {
    fs.writeFileSync('./dist/og-image.png', finalImage);
    fs.writeFileSync('./dist/og-image.jpg', jpgBuffer);
  }

  console.log('Master website preview image generated successfully!');
}

generateOG().catch(console.error);
