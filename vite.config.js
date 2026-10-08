import { defineConfig } from 'vite';
import { hoursRowsHtml } from './src/data/site.js';

// Only index.html is the site; the kit's HTML studies (catalogo.html, 07-integracao/) stay out of the build.
// The opening hours are written into the HTML from src/data/site.js so they read without JavaScript.
export default defineConfig({
  optimizeDeps: { entries: ['index.html'] },
  build: { target: 'es2020', assetsInlineLimit: 0 },
  plugins: [
    {
      name: 'chez-tonton-hours',
      transformIndexHtml: (html) => html.replace('<tbody data-hours></tbody>', `<tbody data-hours>${hoursRowsHtml()}</tbody>`),
    },
  ],
});
