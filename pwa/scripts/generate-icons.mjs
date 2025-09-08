import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const srcLogo = path.join(publicDir, 'assets', 'branding', 'logo.png');
const outDir = path.join(publicDir, 'assets', 'icons');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generateStandard(size, filename) {
  const dest = path.join(outDir, filename);
  await sharp(srcLogo)
    .resize(size, size, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(dest);
  console.log('✓', filename);
}

async function generateMaskable(size, filename) {
  const inner = Math.round(size * 0.82); // safe zone
  const resized = await sharp(srcLogo)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90 })
    .toBuffer();

  const dest = path.join(outDir, filename);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .composite([
      { input: resized, gravity: 'center' },
    ])
    .toFile(dest);
  console.log('✓', filename);
}

async function generateApple(size, filename) {
  const dest = path.join(outDir, filename);
  await sharp(srcLogo)
    .resize(size, size, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(dest);
  console.log('✓', filename);
}

async function main() {
  if (!fs.existsSync(srcLogo)) {
    console.error('Logo source not found at', srcLogo);
    process.exit(1);
  }
  await ensureDir(outDir);
  await generateStandard(192, 'icon-192x192.png');
  await generateStandard(512, 'icon-512x512.png');
  await generateMaskable(192, 'maskable-192x192.png');
  await generateMaskable(512, 'maskable-512x512.png');
  await generateApple(180, 'apple-touch-icon.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

