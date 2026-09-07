const sharp = require('sharp');
const fs = require('fs');

async function renderCardWithShadow(svgPath, width, height, radius = 16, strokeColor = '#3b82f6', rotate = 0) {
  // Render SVG to target size
  const cardRaw = await sharp(svgPath)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  // Create rounded corner mask with stroke
  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff" />
    </svg>
  `);

  const rounded = await sharp(cardRaw)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Add sleek card border & inner sheen
  const bordered = await sharp(rounded)
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}">
            <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius}" ry="${radius}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-opacity="0.85" />
            <!-- Specular top-edge shine -->
            <path d="M 0 0 L ${width} 0 L ${width} 2 L 0 2 Z" fill="#ffffff" opacity="0.3" />
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();

  if (rotate !== 0) {
    return await sharp(bordered)
      .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }

  return bordered;
}

async function test() {
  const c1 = await renderCardWithShadow('./public/cards/apple.svg', 260, 162, 16, '#60a5fa', -6);
  const c2 = await renderCardWithShadow('./public/cards/steam.svg', 260, 162, 16, '#38bdf8', 8);
  const c3 = await renderCardWithShadow('./public/cards/amazon.svg', 260, 162, 16, '#f59e0b', -2);
  const c4 = await renderCardWithShadow('./public/cards/playstation.svg', 260, 162, 16, '#818cf8', 4);
  console.log('Cards successfully built, sizes:', c1.length, c2.length, c3.length, c4.length);
}

test().catch(console.error);
