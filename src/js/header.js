// Fixed header: transparent over the hero (tone follows the hero), solid paper once past it.
// Mobile menu: disclosure button + panel; closes on link, Escape or a click outside.
export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return null;
  const toggle = header.querySelector('[data-menu-toggle]');
  const panel = header.querySelector('[data-menu]');
  const hero = document.querySelector('[data-hero]');
  const root = document.documentElement;
  const icon = toggle.querySelector('use');

  function solidAfter() {
    if (!root.classList.contains('hero-scroll') || !hero) return 8;
    return hero.offsetHeight - innerHeight * 0.5;
  }

  let ticking = false;
  function update() {
    ticking = false;
    header.classList.toggle('is-solid', scrollY > solidAfter());
  }
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener('resize', update);
  update();

  function setOpen(open, { focus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Fermer le menu' : 'Menu';
    icon.setAttribute('href', open ? '#i-close' : '#i-menu');
    panel.hidden = !open;
    header.classList.toggle('is-open', open);
    if (open) panel.querySelector('a')?.focus();
    else if (focus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false, { focus: true });
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !header.contains(e.target)) setOpen(false);
  });
  matchMedia('(min-width: 921px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  return {
    setTone(tone) {
      header.dataset.tone = tone;
    },
  };
}
