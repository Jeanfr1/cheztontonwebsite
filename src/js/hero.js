// Hero « De la cave au comptoir »: native scroll drives one progress value (0–1) over the
// 225svh track; layers only get transform/opacity (the beer arc uses a short-lived mask).
// Flat mode (phones, short screens, reduced motion) leaves the CSS poster untouched.
import meta from '../data/asset-meta.json';
import { segments as S } from '../data/timeline.js';

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const span = (t, [a, b]) => clamp01((t - a) / (b - a));
const sub = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out = (t) => 1 - (1 - t) ** 3;

const ZOOM_START = 1.06;
const ZOOM_CUT = 1.02; // fridge zoom when the bottle lifts out (brief: 1.06 → 1.02)

export function initHero({ onTone } = {}) {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const stage = hero.querySelector('[data-stage]');
  const L = Object.fromEntries([...stage.querySelectorAll('[data-layer]')].map((el) => [el.dataset.layer, el]));
  const bar = stage.querySelector('[data-progress]');
  const root = document.documentElement;
  const mqRoomy = matchMedia('(min-width: 761px) and (min-height: 560px)');
  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = !new URLSearchParams(location.search).has('nosmooth');

  let active = false;
  let target = 0;
  let current = 0;
  let raf = 0;
  let geo = null;
  let tone = null;

  const b = meta.bouteille;
  L.bouteille.style.transformOrigin = `${b.anchor.x * 100}% ${b.anchor.y * 100}%`;

  function setTone(next) {
    if (next === tone) return;
    tone = next;
    stage.dataset.tone = next;
    onTone?.(next);
  }

  function offsetIn(el) {
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== stage; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { x, y };
  }

  // Where the photographed bottle sits on screen (object-fit: cover, centred, zoomed about the centre),
  // and how the PNG bottle must be posed to sit on it: label centre on label centre, a touch longer than
  // the photographed bottle (it is coming toward the camera).
  function measure() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const f = meta.frigo;
    const s = Math.max(W / f.w, H / f.h) * ZOOM_CUT;
    const px = W / 2 + (f.bottle.x - f.w / 2) * s;
    const py = H / 2 + (f.bottle.y - f.h / 2) * s;
    const { x, y } = offsetIn(L.bouteille);
    const bw = L.bouteille.offsetWidth;
    const bh = L.bouteille.offsetHeight;
    geo = {
      W,
      H,
      dx: px - (x + b.anchor.x * bw),
      dy: py - (y + b.anchor.y * bh),
      scale0: (1.08 * f.bottle.length * s) / bh,
      rot0: f.bottle.angle - b.angle,
    };
  }

  function pose(el, opacity, transform) {
    el.style.opacity = opacity.toFixed(3);
    el.style.visibility = opacity < 0.004 ? 'hidden' : '';
    el.style.transform = transform;
  }

  function paint(p) {
    const { W, H } = geo;
    const r = span(p, S.revelation);
    const g = span(p, S.composition);
    const a = span(p, S.arc);

    // 1 · Frigo: slow pull-back, then the cold light gives way to paper.
    const fade = inOut(sub(r, 0.2, 0.9));
    const zoom = lerp(ZOOM_START, ZOOM_CUT, out(span(p, S.frigo))) + 0.05 * inOut(sub(r, 0.3, 1));
    pose(L.frigo, 1 - fade, `scale(${zoom.toFixed(4)})`);
    L.scrim.style.opacity = (1 - fade).toFixed(3);
    L.hops.style.opacity = fade.toFixed(3);
    setTone(fade > 0.55 ? 'paper' : 'cold');

    // 2 · The bottle appears on the photographed one, then travels toward the camera to its poster pose.
    const m = inOut(sub(r, 0.22, 1));
    const lift = Math.sin(Math.PI * m);
    const bScale = lerp(geo.scale0, 1, m) * (1 + 0.05 * lift);
    const bx = geo.dx * (1 - m);
    const by = geo.dy * (1 - m) - lift * H * 0.035 - a * H * 0.01;
    pose(L.bouteille, sub(r, 0, 0.28), `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0) rotate(${(geo.rot0 * (1 - m)).toFixed(2)}deg) scale(${bScale.toFixed(4)})`);

    // 3 · The glass rises in the foreground.
    const ge = out(g);
    const gy = (1 - ge) * H * 0.1 - a * H * 0.014;
    pose(L.verre, ge, `translate3d(0, ${gy.toFixed(1)}px, 0) scale(${lerp(1.08, 1, ge).toFixed(4)})`);
    pose(L.shadow, sub(r, 0.5, 1), `scaleX(${lerp(0.7, 1, ge).toFixed(3)})`);

    // 4 · The arc pours in along its own diagonal, then drifts a little so the composition breathes.
    const k = inOut(sub(g, 0.15, 1));
    const edge = lerp(-16, 104, k);
    const mask = k >= 1 ? 'none' : `linear-gradient(118deg, #000 ${edge - 14}%, transparent ${edge + 2}%)`;
    L.ruban.style.webkitMaskImage = mask;
    L.ruban.style.maskImage = mask;
    const rx = -a * W * 0.018;
    const ry = a * H * 0.022 - (1 - k) * H * 0.02;
    pose(L.ruban, sub(g, 0.1, 0.5), `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) rotate(${(a * 3).toFixed(2)}deg)`);

    // Motion signature, read while the poster holds still.
    const sig = sub(g, 0.55, 1);
    pose(L.signature, sig, `translate3d(0, ${((1 - sig) * 16).toFixed(1)}px, 0) rotate(-4deg)`);

    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }

  function progress() {
    const run = hero.offsetHeight - stage.offsetHeight;
    return clamp01(-hero.getBoundingClientRect().top / Math.max(1, run));
  }

  function tick() {
    raf = 0;
    const d = target - current;
    current = smooth && Math.abs(d) > 0.0004 ? current + d * 0.16 : target;
    paint(current);
    if (current !== target) raf = requestAnimationFrame(tick);
  }

  function onScroll() {
    if (!active) return;
    target = progress();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function clear() {
    Object.values(L).forEach((el) => {
      el.style.removeProperty('opacity');
      el.style.removeProperty('visibility');
      el.style.removeProperty('transform');
      el.style.removeProperty('mask-image');
      el.style.removeProperty('-webkit-mask-image');
    });
  }

  function apply() {
    const scroll = mqRoomy.matches && !mqReduced.matches;
    root.classList.toggle('hero-scroll', scroll);
    root.classList.toggle('hero-flat', !scroll);
    active = scroll;
    if (!scroll) {
      cancelAnimationFrame(raf);
      raf = 0;
      clear();
      setTone('paper');
      return;
    }
    measure();
    target = current = progress();
    paint(current);
  }

  let resizeRaf = 0;
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (!active) return;
      measure();
      target = current = progress();
      paint(current);
    });
  });
  mqRoomy.addEventListener('change', apply);
  mqReduced.addEventListener('change', apply);
  apply();
}
