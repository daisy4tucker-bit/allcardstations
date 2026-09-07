const sharp = require('sharp');
const fs = require('fs');

async function createWebsiteThemeOG() {
  const width = 1200;
  const height = 630;

  // SVG graphic with website theme colors: Deep navy (#070b14 to #0f172a), vibrant royal blue (#2563eb) and indigo (#4f46e5)
  // Featuring sleek digital cards on the right side to reflect the marketplace
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Website theme background gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070b14" />
        <stop offset="50%" stop-color="#0c1527" />
        <stop offset="100%" stop-color="#080d1a" />
      </linearGradient>

      <!-- Website theme radial glow (Royal blue & indigo) -->
      <radialGradient id="royalGlow" cx="25%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.32" />
        <stop offset="60%" stop-color="#1e1b4b" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="indigoGlow" cx="85%" cy="50%" r="55%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.35" />
        <stop offset="50%" stop-color="#2563eb" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <!-- Digital Card 1: Apple / Clean Minimalist Dark Card -->
      <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <!-- Digital Card 2: Steam / Gaming Vibrant Blue Card -->
      <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <!-- Digital Card 3: Hero Royal Card -->
      <linearGradient id="cardGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="60%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </linearGradient>

      <!-- Golden Chip Gradient -->
      <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#eab308" />
        <stop offset="100%" stop-color="#ca8a04" />
      </linearGradient>

      <!-- Drop shadows -->
      <filter id="cardShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6" />
      </filter>

      <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#2563eb" flood-opacity="0.4" />
      </filter>

      <!-- Subtle background grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
      </pattern>
    </defs>

    <!-- Base Canvas -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    
    <!-- Subtle Grid Overlay -->
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Ambient Glows -->
    <rect width="${width}" height="${height}" fill="url(#royalGlow)" />
    <rect width="${width}" height="${height}" fill="url(#indigoGlow)" />

    <!-- Subtle circuit / accent lines in background -->
    <path d="M 0 480 Q 300 450, 600 500 T 1200 470" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-opacity="0.2" />
    <path d="M 0 520 Q 400 500, 800 540 T 1200 510" fill="none" stroke="#4f46e5" stroke-width="1" stroke-opacity="0.15" />

    <!-- ================= RIGHT SIDE: 3D FLOATING DIGITAL GIFT CARDS ================= -->
    <g transform="translate(730, 90)">
      
      <!-- Card 1 (Back left, tilted -14 deg) -->
      <g transform="translate(30, 40) rotate(-14)" filter="url(#cardShadow)">
        <rect width="320" height="200" rx="16" fill="url(#cardGrad1)" stroke="#334155" stroke-width="1.5" />
        <!-- Subtle card accents -->
        <rect x="25" y="25" width="48" height="32" rx="6" fill="url(#chipGrad)" opacity="0.9" />
        <circle cx="270" cy="40" r="14" fill="#ffffff" opacity="0.1" />
        <rect x="25" y="145" width="120" height="12" rx="4" fill="#64748b" opacity="0.5" />
        <rect x="25" y="165" width="70" height="10" rx="3" fill="#475569" opacity="0.5" />
        <text x="275" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#94a3b8" text-anchor="end" opacity="0.6">$50</text>
      </g>

      <!-- Card 2 (Middle, tilted 8 deg) -->
      <g transform="translate(70, 70) rotate(8)" filter="url(#cardShadow)">
        <rect width="330" height="206" rx="16" fill="url(#cardGrad2)" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.7" />
        <!-- Card inner sheen -->
        <path d="M 0 0 L 160 0 L 80 206 L 0 206 Z" fill="#ffffff" opacity="0.06" />
        <rect x="26" y="26" width="50" height="34" rx="6" fill="url(#chipGrad)" />
        <rect x="26" y="150" width="140" height="14" rx="4" fill="#93c5fd" opacity="0.8" />
        <rect x="26" y="172" width="90" height="10" rx="3" fill="#60a5fa" opacity="0.7" />
        <text x="285" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="end">$100</text>
      </g>

      <!-- Card 3 (Hero Front, tilted -3 deg) -->
      <g transform="translate(10, 160) rotate(-3)" filter="url(#cardShadow)">
        <rect width="340" height="212" rx="18" fill="url(#cardGrad3)" stroke="#60a5fa" stroke-width="2" />
        <!-- Diagonal sheen -->
        <path d="M 0 0 L 180 0 L 60 212 L 0 212 Z" fill="#ffffff" opacity="0.12" />
        
        <!-- Gold Smart Chip -->
        <g transform="translate(28, 28)">
          <rect width="52" height="36" rx="6" fill="url(#chipGrad)" stroke="#b45309" stroke-width="0.8" />
          <line x1="18" y1="0" x2="18" y2="36" stroke="#ca8a04" stroke-width="1" />
          <line x1="34" y1="0" x2="34" y2="36" stroke="#ca8a04" stroke-width="1" />
          <line x1="0" y1="18" x2="52" y2="18" stroke="#ca8a04" stroke-width="1" />
        </g>

        <!-- Wireless Contactless icon -->
        <g transform="translate(92, 38)" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8">
          <path d="M 0 4 A 12 12 0 0 1 0 20" />
          <path d="M 5 7 A 8 8 0 0 1 5 17" />
          <path d="M 10 10 A 4 4 0 0 1 10 14" />
        </g>

        <!-- Card Logo & Wordmark -->
        <text x="310" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="end" letter-spacing="1">ALLCARDSTATUS</text>

        <!-- Card Number Mock / Security Indicator -->
        <text x="28" y="130" font-family="monospace, Courier" font-size="17" font-weight="600" fill="#e0e7ff" letter-spacing="3.5">••••  ••••  ••••  8492</text>

        <!-- Card Holder & Amount -->
        <text x="28" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" letter-spacing="1">AUTHENTIC DIGITAL CARD</text>
        <text x="28" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#ffffff">VERIFIED CLAIM CODE</text>
        <text x="310" y="188" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="end">$200</text>
      </g>
    </g>

    <!-- ================= LEFT SIDE: MAIN TYPOGRAPHY & BRANDING ================= -->
    <g transform="translate(80, 105)">
      
      <!-- Brand Pill Header with Website Royal Blue -->
      <g transform="translate(0, 0)" filter="url(#badgeGlow)">
        <rect width="186" height="36" rx="18" fill="#1e3a8a" fill-opacity="0.6" stroke="#3b82f6" stroke-width="1.5" />
        <circle cx="22" cy="18" r="5" fill="#38bdf8" />
        <text x="36" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#f0fdf4" letter-spacing="1.2">ALLCARDSTATUS</text>
      </g>

      <!-- Main Headline in Website Clean Style -->
      <text x="0" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" fill="#ffffff" letter-spacing="-0.8">
        Digital Gift Cards
      </text>
      <text x="0" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" fill="#60a5fa" letter-spacing="-0.8">
        Made Simple &amp; Safe
      </text>

      <!-- Subtitle (strictly NO redeem option!) -->
      <text x="0" y="232" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#e2e8f0">
        Instantly buy and send digital cards for gaming, apps, and shopping.
      </text>
      <text x="0" y="266" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#94a3b8">
        Fast delivery straight to your email with verified codes.
      </text>

      <!-- Feature Badges in Website Theme (Navy pill with neon accents) -->
      <g transform="translate(0, 318)">
        <!-- Badge 1: Instant Delivery -->
        <g transform="translate(0, 0)">
          <rect width="180" height="42" rx="21" fill="#0f172a" fill-opacity="0.8" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="22" cy="21" r="5" fill="#10b981" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Instant Delivery</text>
        </g>

        <!-- Badge 2: Verified Codes -->
        <g transform="translate(195, 0)">
          <rect width="185" height="42" rx="21" fill="#0f172a" fill-opacity="0.8" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="22" cy="21" r="5" fill="#38bdf8" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Verified Codes</text>
        </g>

        <!-- Badge 3: Top 24+ Brands -->
        <g transform="translate(395, 0)">
          <rect width="185" height="42" rx="21" fill="#0f172a" fill-opacity="0.8" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="22" cy="21" r="5" fill="#818cf8" />
          <text x="36" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#f8fafc">Top 24+ Brands</text>
        </g>
      </g>

      <!-- Popular Brand Names Footer -->
      <g transform="translate(0, 402)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="500" fill="#64748b" letter-spacing="0.4">
          Apple • Steam • Amazon • PlayStation • Xbox • Google Play • Netflix
        </text>
      </g>

    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('./public/og-image.png');

  await sharp('./public/og-image.png')
    .jpeg({ quality: 92 })
    .toFile('./public/og-image.jpg');

  console.log('Successfully generated website theme OG image (PNG and JPG)');
}

createWebsiteThemeOG().catch(console.error);
