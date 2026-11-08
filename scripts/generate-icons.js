import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/icons');
const screensDir = path.resolve('public/screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

const svgBuffer = fs.readFileSync(path.resolve('public/icon.svg'));

async function generate() {
  console.log('Generating PWA icons...');

  // 1. icon-192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // 2. icon-512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. maskable-512.png (512x512 with safe padding)
  // Maskable SVG with full-bleed background and centered logo inside 80% safe zone
  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a4c9a" />
          <stop offset="100%" stop-color="#1d6fd1" />
        </linearGradient>
      </defs>
      <!-- Full bleed background for any Android crop -->
      <rect width="512" height="512" fill="url(#bg)" />
      <!-- Centered emblem inside 75% safe area -->
      <g transform="translate(64, 64) scale(0.75)">
        <path d="M256 80 L384 136 V248 C384 336 328 412 256 436 C184 412 128 336 128 248 V136 Z" fill="#F15A31" />
        <path d="M256 180 V330 M181 255 H331" stroke="#ffffff" stroke-width="36" stroke-linecap="round" />
      </g>
    </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'maskable-512.png'));
  console.log('Created maskable-512.png');

  // 5. App showcase screenshots for PWABuilder
  // Mobile screenshot (1080x1920)
  const mobileSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
      <rect width="1080" height="1920" fill="#f2f5fa" />
      <rect width="1080" height="240" fill="#0a4c9a" />
      <text x="540" y="140" fill="#ffffff" font-size="52" font-family="sans-serif" font-weight="bold" text-anchor="middle">مراکز درمانی طرف قرارداد کارآفرین</text>
      <text x="540" y="195" fill="#93c5fd" font-size="32" font-family="sans-serif" text-anchor="middle">ارومیه · جستجوی سریع و فیلتر تخصص‌ها</text>
      <!-- Cards preview -->
      <rect x="60" y="290" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="60" y="500" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="60" y="710" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="60" y="920" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="60" y="1130" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="60" y="1340" width="960" height="180" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
    </svg>
  `;
  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile(path.join(screensDir, 'screenshot-mobile.png'));
  console.log('Created screenshot-mobile.png');

  // Desktop screenshot (1280x720)
  const desktopSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <rect width="1280" height="720" fill="#f2f5fa" />
      <rect width="1280" height="110" fill="#0a4c9a" />
      <text x="640" y="65" fill="#ffffff" font-size="32" font-family="sans-serif" font-weight="bold" text-anchor="middle">سامانه مراکز درمانی طرف قرارداد بیمه کارآفرین ارومیه</text>
      <!-- Grid -->
      <rect x="100" y="150" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="670" y="150" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="100" y="330" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="670" y="330" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="100" y="510" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <rect x="670" y="510" width="510" height="150" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
    </svg>
  `;
  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile(path.join(screensDir, 'screenshot-desktop.png'));
  console.log('Created screenshot-desktop.png');

  console.log('All icons and screenshots successfully generated!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
