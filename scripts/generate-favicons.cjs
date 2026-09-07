const sharp = require('sharp');
const fs = require('fs');
const { execSync } = require('child_process');

async function generateFavicons() {
  const svg = fs.readFileSync('./public/logo.svg');

  // Copy logo.svg to favicon.svg as well so vector browsers get the crisp logo
  fs.writeFileSync('./public/favicon.svg', svg);
  console.log('Updated favicon.svg from logo.svg');

  // Multiples of 48px required by Googlebot & search snippets:
  await sharp(svg).resize(48, 48).png().toFile('./public/favicon-48x48.png');
  console.log('Generated favicon-48x48.png');

  await sharp(svg).resize(96, 96).png().toFile('./public/favicon-96x96.png');
  console.log('Generated favicon-96x96.png');

  await sharp(svg).resize(192, 192).png().toFile('./public/favicon-192x192.png');
  console.log('Generated favicon-192x192.png');

  await sharp(svg).resize(512, 512).png().toFile('./public/favicon-512x512.png');
  console.log('Generated favicon-512x512.png');

  await sharp(svg).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
  console.log('Generated apple-touch-icon.png');

  // Generate 32x32 and 16x16 for the standard favicon.ico
  await sharp(svg).resize(32, 32).png().toFile('/tmp/favicon-32x32.png');
  await sharp(svg).resize(16, 16).png().toFile('/tmp/favicon-16x16.png');
  await sharp(svg).resize(48, 48).png().toFile('./public/favicon.png');

  // Convert to multi-resolution favicon.ico
  try {
    execSync('convert /tmp/favicon-16x16.png /tmp/favicon-32x32.png ./public/favicon-48x48.png ./public/favicon.ico');
    console.log('Generated multi-resolution favicon.ico');
  } catch (err) {
    // Fallback if multi-res convert has issues
    execSync('convert ./public/favicon-48x48.png ./public/favicon.ico');
    console.log('Generated fallback favicon.ico');
  }

  console.log('All favicons successfully generated!');
}

generateFavicons().catch(console.error);
