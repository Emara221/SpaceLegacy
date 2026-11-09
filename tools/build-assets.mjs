// Rebuilds the web-ready image assets from NASA originals.
// Usage (from the project root, with Node 18+ and `sharp` installed in a tools folder):
//   node tools/build-assets.mjs
// Raw downloads are cached in _workbench/ (git-ignored). Output goes to assets/.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WB = join(ROOT, '_workbench');
const require = createRequire(join(WB, 'nodetools', 'package.json'));
const sharp = require('sharp');

const RAW = join(WB, 'dl_img_large');
mkdirSync(RAW, { recursive: true });

// NASA Image and Video Library IDs -> local slugs
const NASA_IMAGES = [
  ['as11-40-5927', 'a11-eagle-on-moon'],
  ['as11-40-5899', 'a11-plaque'],
  ['as11-40-5948', 'a11-easep-deployed'],
  ['6900957', 'a11-aldrin-carries-easep'],
  ['as14-67-09386', 'a14-lrrr-closeup'],
  ['PIA04413', 'mer-artist-concept'],
  ['PIA09491', 'spirit-silica-soil'],
  ['PIA12203', 'spirit-troy-panorama'],
  ['PIA25287', 'insight-final-selfie'],
  ['PIA23177', 'insight-seis-shield'],
  ['PIA22871', 'insight-deck'],
];

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

async function getNasaOriginal(id) {
  const file = join(RAW, `${id}.jpg`);
  if (existsSync(file)) return file;
  const list = await fetchJson(`https://images-assets.nasa.gov/image/${id}/collection.json`);
  const pick = ['~large.jpg', '~orig.jpg', '~medium.jpg']
    .map((s) => list.find((u) => u.endsWith(s)))
    .find(Boolean);
  if (!pick) throw new Error(`no jpg for ${id}`);
  await download(pick.replace('http://', 'https://'), file);
  return file;
}

async function webpVariants(src, slug, widths = [1600, 800]) {
  for (const w of widths) {
    const out = join(ROOT, 'assets', 'img', `${slug}-${w}.webp`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  }
  const meta = await sharp(join(ROOT, 'assets', 'img', `${slug}-${widths[0]}.webp`)).metadata();
  return { slug, width: meta.width, height: meta.height };
}

const report = [];
for (const [id, slug] of NASA_IMAGES) {
  const src = await getNasaOriginal(id);
  report.push({ id, ...(await webpVariants(src, slug)) });
}

// Moon map: NASA SVS CGI Moon Kit (LROC WAC color), equirectangular, 0 deg longitude at centre.
await sharp(join(WB, 'dl_tex', 'lroc_color_2k.jpg'))
  .webp({ quality: 74 })
  .toFile(join(ROOT, 'assets', 'maps', 'moon-lroc-color.webp'));

// Mars map: NASA 3D Resources "Mars" (Viking, USGS / JPL), equirectangular, -180..180.
// Re-centre on 180 deg E so Gusev Crater and Elysium Planitia sit mid-map: new x = lon / 360.
{
  const src = join(WB, 'dl_tex', 'mars.jpg');
  const { width, height } = await sharp(src).metadata();
  const half = Math.floor(width / 2);
  const left = await sharp(src).extract({ left: 0, top: 0, width: half, height }).toBuffer();
  const right = await sharp(src).extract({ left: half, top: 0, width: width - half, height }).toBuffer();
  await sharp({ create: { width, height, channels: 3, background: '#000' } })
    .composite([
      { input: right, left: 0, top: 0 },
      { input: left, left: width - half, top: 0 },
    ])
    .webp({ quality: 76 })
    .toFile(join(ROOT, 'assets', 'maps', 'mars-viking-0-360.webp'));
}

// Posters: NASA's own renders of each 3D model (shown while loading and as the no-WebGL fallback).
for (const [file, slug] of [
  ['lm.png', 'lm-render'],
  ['insight_arm.png', 'insight-render'],
  ['merb.png', 'mer-render'],
]) {
  await sharp(join(WB, 'dl_models', file))
    .resize({ width: 1280 })
    .webp({ quality: 80, alphaQuality: 90 })
    .toFile(join(ROOT, 'assets', 'posters', `${slug}.webp`));
}

console.table(report);
