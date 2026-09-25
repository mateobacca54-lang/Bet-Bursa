import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const originals = path.resolve(root, '../../Animaciones/Generados/bursa-v2');
const output = path.join(root, 'public/illustrations');
await fs.mkdir(output, { recursive: true });
for (const name of ['empanada', 'presupuesto', 'alcancia']) {
  const input = path.join(originals, `${name}-v2.png`);
  const meta = await sharp(input).metadata();
  if (!meta.hasAlpha) throw new Error(`${name}: falta canal alfa`);
  const target = path.join(output, `${name}-v2.webp`);
  await sharp(input).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(target);
  console.log(JSON.stringify({ name, original: [meta.width, meta.height], alpha: meta.hasAlpha, bytes: (await fs.stat(target)).size }));
}
