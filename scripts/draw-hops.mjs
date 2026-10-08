// Draws the engraved hop sprig used as line-art decoration (the approved mockup's malt hop drawings;
// the kit has no file for them). Prints an SVG <symbol> to paste into index.html's sprite.
//   node scripts/draw-hops.mjs > hop-symbol.svg
// Every closed shape is its own filled path, drawn back to front, so later shapes hide earlier lines.
const f = (n) => Math.round(n * 10) / 10;
const rot = ([x, y], a, [ox, oy]) => [ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)];
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';

// Ovoid hop cone hanging from `top`, axis tilted by `a`: rows of rounded overlapping bracts, tip first.
function cone([cx, cy], len, maxW, a) {
  const rows = 6;
  const out = [];
  for (let r = rows - 1; r >= 0; r--) {
    const t = (r + 0.35) / rows;
    const w = maxW * Math.sin(Math.PI * (0.12 + t * 0.8)) ** 0.75;
    const y = t * len * 0.8;
    const h = (len / rows) * 1.7;
    const n = r % 2 ? 2 : 3;
    const bw = (w / n) * 1.32;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * (w / n) * 0.92;
      const pts = [];
      for (let k = 0; k <= 16; k++) {
        const th = Math.PI * (k / 16);
        // rounded scale with a soft point at the bottom
        const px = x - Math.cos(th) * (bw / 2);
        const py = y + Math.sin(th) ** 0.9 * h * (0.86 + 0.18 * Math.sin(th) ** 6);
        pts.push(rot([px, py], a, [cx, cy]));
      }
      const v1 = rot([x, y + h * 0.42], a, [cx, cy]);
      const v2 = rot([x, y + h * 0.8], a, [cx, cy]);
      out.push(`M${pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L')}M${f(v1[0])} ${f(v1[1])}L${f(v2[0])} ${f(v2[1])}`);
    }
  }
  // cap where the cone meets its stalk
  const cap = [];
  for (let k = 0; k <= 12; k++) {
    const th = Math.PI * (k / 12);
    cap.push(rot([-Math.cos(th) * maxW * 0.3, Math.sin(th) * len * 0.12 - len * 0.02], a, [cx, cy]));
  }
  out.push(poly(cap));
  return out;
}

// One serrated lobe along +x, length L, half-width W.
function lobe(L, W) {
  const top = [];
  const bottom = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const w = W * Math.sin(Math.PI * s ** 0.85) ** 0.9 * (1 - 0.25 * s);
    const tooth = i % 2 ? 1 : 0.86;
    top.push([s * L, -w * tooth]);
    bottom.unshift([s * L, w * tooth]);
  }
  return [...top, ...bottom];
}

// Three-lobed hop leaf: side lobes first, centre lobe on top, then veins.
function leaf(base, size, a) {
  const out = [];
  for (const [o, k] of [[-0.85, 0.7], [0.85, 0.7], [0, 1]]) {
    out.push(poly(lobe(size * k, size * 0.3 * (k === 1 ? 1 : 0.95)).map((p) => rot(p, a + o, base))));
  }
  const veins = [-0.85, 0.85, 0].map((o) => {
    const L = size * (o ? 0.6 : 0.86);
    const [x, y] = rot([L, 0], a + o, base);
    return `M${f(base[0])} ${f(base[1])}L${f(x)} ${f(y)}`;
  });
  out.push(veins.join(''));
  return out;
}

const stem = 'M150 4C132 34 118 66 112 98S104 160 118 196M112 98C98 104 82 104 70 96M114 150C128 152 146 146 156 134M70 96c-14-6-24 2-20 12s16 8 16-2';
const shapes = [
  ...leaf([112, 98], 62, -2.55),
  ...leaf([114, 150], 54, -0.35),
  ...cone([66, 98], 70, 42, 0.18),
  ...cone([158, 132], 62, 36, -0.22),
  ...cone([118, 194], 76, 46, 0.04),
];
const body = shapes.map((d) => `<path class="hop-fill" d="${d}"/>`).join('');
console.log(`<symbol id="hop" viewBox="0 0 220 280"><path fill="none" d="${stem}"/>${body}</symbol>`);
