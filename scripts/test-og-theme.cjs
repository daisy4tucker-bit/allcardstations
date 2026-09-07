const sharp = require('sharp');
const fs = require('fs');

async function makeRoundedCard(svgPath, width, height, radius = 12) {
  // Render SVG to specified size
  const cardBuf = await sharp(svgPath)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  // Create rounded corner mask
  const mask = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff" />
    </svg>
  `);

  // Mask the card to have clean rounded corners
  const rounded = await sharp(cardBuf)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Add border and drop shadow using SVG frame
  const framed = await sharp({
    create: {
      width: width + 24,
      height: height + 24,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${width + 24}" height="${height + 24}">
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.65" />
            </filter>
          </defs>
          <rect x="12" y="12" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#1e293b" filter="url(#shadow)" />
          <rect x="12" y="12" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-opacity="0.6" />
        </svg>
      `),
      top: 0,
      left: 0
    },
    {
      input: rounded,
      top: 12,
      left: 12
    }
  ])
  .png()
  .toBuffer();

  return framed;
}

async function run() {
  const card1 = await makeRoundedCard('./public/cards/apple.svg', 230, 144, 12);
  const card2 = await makeRoundedCard('./public/cards/steam.svg', 230, 144, 12);
  const card3 = await makeRoundedCard('./public/cards/amazon.svg', 230, 144, 12);
  const card4 = await makeRoundedCard('./public/cards/playstation.svg', 230, 144, 12);
  console.log('Cards prepared successfully!');
}

run().catch(console.error);
