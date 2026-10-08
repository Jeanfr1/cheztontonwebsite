// Builds the web images from the kit PNGs (which stay untouched as masters).
//   npm run images
// Output: public/img/*.avif|webp (+ favicons) and src/data/asset-meta.json
// (trimmed sizes + anchor points used by the hero timeline).
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/img');
const kit = (p) => path.join(root, p);

// Alpha layers: cropped to the visible object (alpha > ALPHA_MIN) so CSS boxes = object boxes.
// `anchor` is in ORIGINAL pixel coordinates; it is re-expressed relative to the crop.
const ALPHA_MIN = 18;
const layers = [
  { id: 'bouteille', src: '03-camadas/03-bouteille-alpha.png', widths: [220, 441], anchor: { x: 500, y: 980 }, labelWidth: 410, angle: 3.4 },
  { id: 'verre', src: '03-camadas/05-verre-alpha.png', widths: [240, 602] },
  { id: 'ruban', src: '03-camadas/04-ruban-biere-alpha.png', widths: [760, 1400] },
  { id: 'logo', src: '05-logo/08-logo-chez-tonton-transparent.png', widths: [240, 480] },
];

const photos = [
  { id: 'frigo', src: '02-background/10-pov-frigo.png', widths: [800, 1280, 1672] },
  { id: 'bar', src: '04-secoes/06-bar-photo-retouche.png', widths: [640, 1100, 1575] },
  { id: 'cave', src: '04-secoes/07-cave-photo-retouche.png', widths: [640, 1100, 1522] },
  { id: 'convivialite', src: '04-secoes/11-pov-convivialite.png', widths: [800, 1280, 1672] },
  { id: 'pression', src: '04-secoes/09-pression-editorial.png', widths: [480, 900] },
];

async function alphaBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > ALPHA_MIN) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  // Fade out the residual glow below the threshold so the crop never shows a hard edge.
  for (let i = 3; i < data.length; i += 4) if (data[i] <= ALPHA_MIN) data[i] = 0;
  const pad = 6;
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  const width = Math.min(info.width, x1 + pad + 1) - left;
  const height = Math.min(info.height, y1 + pad + 1) - top;
  const cleaned = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left, top, width, height });
  return { buffer: await cleaned.png().toBuffer(), left, top, width, height };
}

async function variants(input, id, widths, { alpha = false } = {}) {
  const files = [];
  for (const w of widths) {
    const base = sharp(input).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: alpha ? 58 : 52, effort: 6 }).toFile(path.join(out, `${id}-${w}.avif`));
    await base.clone().webp({ quality: alpha ? 82 : 76, alphaQuality: 90, effort: 6 }).toFile(path.join(out, `${id}-${w}.webp`));
    files.push(w);
  }
  return files;
}

async function paperTile() {
  // Mirror the texture 2x2 so it repeats without seams.
  const half = 640;
  const a = await sharp(kit('02-background/02-papier-texture.png')).resize(half, half).toBuffer();
  const flop = await sharp(a).flop().toBuffer();
  const flip = await sharp(a).flip().toBuffer();
  const both = await sharp(a).flip().flop().toBuffer();
  const tile = sharp({ create: { width: half * 2, height: half * 2, channels: 3, background: '#F2EBDC' } })
    .composite([
      { input: a, left: 0, top: 0 }, { input: flop, left: half, top: 0 },
      { input: flip, left: 0, top: half }, { input: both, left: half, top: half },
    ]);
  const buf = await tile.png().toBuffer();
  await sharp(buf).webp({ quality: 60, effort: 6 }).toFile(path.join(out, 'papier.webp'));
  await sharp(buf).avif({ quality: 45, effort: 6 }).toFile(path.join(out, 'papier.avif'));
}

async function grainMask() {
  // Letterpress wear for the big titles: white, mostly opaque, with small worn specks.
  const size = 256;
  const px = Buffer.alloc(size * size * 4, 255);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 900; n++) {
    const cx = rand() * size, cy = rand() * size, r = 0.6 + rand() * 1.6, hole = 40 + rand() * 120;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
        const i = (((y + size) % size) * size + ((x + size) % size)) * 4 + 3;
        px[i] = Math.min(px[i], hole);
      }
    }
  }
  await sharp(px, { raw: { width: size, height: size, channels: 4 } }).png().toFile(path.join(out, 'grain.png'));
}

async function favicons() {
  const face = await sharp(kit('05-logo/08-logo-chez-tonton-transparent.png'))
    .extract({ left: 470, top: 40, width: 560, height: 560 }).png().toBuffer();
  await sharp(face).resize(64, 64).png().toFile(path.join(root, 'public/favicon.png'));
  const touch = await sharp(face).resize(150, 150).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: '#F2EBDC' } })
    .composite([{ input: touch, left: 15, top: 18 }]).png().toFile(path.join(root, 'public/apple-touch-icon.png'));
}

await mkdir(out, { recursive: true });
const meta = {};

for (const l of layers) {
  const box = await alphaBox(kit(l.src));
  await variants(box.buffer, l.id, l.widths, { alpha: true });
  meta[l.id] = { w: box.width, h: box.height, widths: l.widths };
  if (l.anchor) {
    meta[l.id].anchor = { x: (l.anchor.x - box.left) / box.width, y: (l.anchor.y - box.top) / box.height };
    meta[l.id].labelWidth = l.labelWidth / box.width;
    meta[l.id].angle = l.angle;
  }
  console.log(`${l.id}: crop ${box.width}x${box.height} @ ${box.left},${box.top}`);
}

for (const p of photos) {
  const { width, height } = await sharp(kit(p.src)).metadata();
  await variants(kit(p.src), p.id, p.widths);
  meta[p.id] = { w: width, h: height, widths: p.widths };
  console.log(`${p.id}: ${width}x${height}`);
}

// Where the bottle sits inside the fridge photo (original pixels), for the match cut.
// It points toward the camera (foreshortened), so the PNG is matched on length, not label width.
meta.frigo.bottle = { x: 885, y: 620, length: 620, angle: -15 };

await paperTile();
await grainMask();
await favicons();
await writeFile(path.join(root, 'src/data/asset-meta.json'), JSON.stringify(meta, null, 2) + '\n');
console.log('done');
