const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Blocks rise 24px into place once; content is never hidden without JS or with reduced motion (CSS).
export function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || reduced.matches) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  items.forEach((el) => {
    const group = el.parentElement.querySelectorAll(':scope > [data-reveal]');
    el.style.setProperty('--i', String([...group].indexOf(el)));
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

// Desktop only, 14px at most (brief), off with reduced motion.
export function initParallax() {
  const els = [...document.querySelectorAll('[data-parallax]')];
  const desktop = matchMedia('(min-width: 761px)');
  if (!els.length) return;
  let raf = 0;
  function paint() {
    raf = 0;
    const on = desktop.matches && !reduced.matches;
    els.forEach((el) => {
      if (!on) {
        el.style.removeProperty('transform');
        return;
      }
      const r = el.getBoundingClientRect();
      const t = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
      el.style.transform = `translate3d(0, ${(Math.max(-1, Math.min(1, t)) * -14).toFixed(1)}px, 0)`;
    });
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(paint);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  paint();
}
