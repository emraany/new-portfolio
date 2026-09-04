/**
 * Poster optimizer.
 *
 * The project posters were committed straight from a retina screenshot —
 * 3840px wide PNGs, 12.2MB across seven files, one of them 4.98MB on its own.
 * `next/image` resizes them at request time so visitors never downloaded that,
 * but every byte still lived in the repository and shipped in the deploy
 * bundle, and each one had to be decoded before it could be resized.
 *
 * It matters more than it used to: on the middle and low capability tiers the
 * poster is not a placeholder for a preview, it *is* the card.
 *
 * Converts every PNG in public/posters to WebP and removes the original.
 * Deliberately NOT wired into the build — a build step that rewrites the
 * working tree is a bad surprise in CI. Run it when adding a poster:
 *
 *     npm run posters
 */

import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public', 'posters');

/**
 * A card is at most a third of the content column, and the sheet hero is one
 * phone wide. 1600px covers either at 2x with room to spare; past that we are
 * storing detail no display will ever ask for.
 */
const MAX_WIDTH = 1600;

/** High enough that text edges in a UI screenshot stay clean. */
const QUALITY = 90;

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

const files = (await readdir(DIR)).filter((f) => f.endsWith('.png'));

if (files.length === 0) {
  console.log('No PNG posters to convert.');
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
  const src = path.join(DIR, file);
  const out = src.replace(/\.png$/, '.webp');

  const originalSize = (await stat(src)).size;

  await sharp(src)
    /* `withoutEnlargement` so a poster that is already small is left at its
       own size rather than upscaled into a bigger file. */
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  const newSize = (await stat(out)).size;
  await unlink(src);

  before += originalSize;
  after += newSize;

  const saved = ((1 - newSize / originalSize) * 100).toFixed(0);
  console.log(
    `${file.padEnd(38)} ${kb(originalSize).padStart(8)} → ${kb(newSize).padStart(7)}  (-${saved}%)`
  );
}

console.log(
  `\nTotal ${kb(before)} → ${kb(after)} (-${((1 - after / before) * 100).toFixed(0)}%)`
);
