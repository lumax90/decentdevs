import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { copyFile } from 'node:fs/promises';

const input = fileURLToPath(new URL('../../public/film/intro/poster.jpg', import.meta.url));
const output = fileURLToPath(new URL('../../public/film/intro/poster-mobile.webp', import.meta.url));

// Keep the complete headline and wordmark inside the mobile card, without
// clipping the desktop poster's secondary call to action at its right edge.
await sharp(input).extract({ left: 40, top: 40, width: 1100, height: 880 }).resize(880, 704).webp({ quality: 86 }).toFile(output);
await Promise.all([
  copyFile(input, fileURLToPath(new URL('../../public/film/intro/poster-04.jpg', import.meta.url))),
  copyFile(output, fileURLToPath(new URL('../../public/film/intro/poster-04-mobile.webp', import.meta.url))),
]);
console.log('Mobile film poster prepared.');
