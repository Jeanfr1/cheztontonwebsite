import '@fontsource/bebas-neue/400.css';
import '@fontsource-variable/inter';
import './styles/main.css';

import { initHero } from './js/hero.js';
import { initHeader } from './js/header.js';
import { markToday, renderEvents } from './js/content.js';
import { initReveal, initParallax } from './js/motion.js';

const header = initHeader();
initHero({ onTone: (tone) => header?.setTone(tone) });
markToday(document.querySelector('[data-hours]'));
renderEvents(document.querySelector('[data-events]'));
initReveal();
initParallax();

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());
