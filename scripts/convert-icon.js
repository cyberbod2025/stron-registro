import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convert() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const png192Path = path.join(__dirname, '..', 'public', 'pwa-192x192.png');
  const png512Path = path.join(__dirname, '..', 'public', 'pwa-512x512.png');

  try {
    await sharp(svgPath).resize(192, 192).toFile(png192Path);
    console.log('Generated 192x192');
    await sharp(svgPath).resize(512, 512).toFile(png512Path);
    console.log('Generated 512x512');
  } catch (err) {
    console.error('Error converting:', err);
  }
}

convert();
