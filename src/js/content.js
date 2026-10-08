import { events, site } from '../data/site.js';

// Today's row is highlighted (Europe/Paris). No "ouvert maintenant": hours still await confirmation.
export function markToday(tbody) {
  if (!tbody) return;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: site.timezone }).format(new Date()).toLowerCase();
  const row = tbody.querySelector(`tr[data-day="${today}"]`);
  if (!row) return;
  row.setAttribute('aria-current', 'date');
  row.querySelector('th').insertAdjacentHTML('beforeend', '<span class="today">Aujourd’hui</span>');
}

// Only upcoming events published by the venue; the list stays hidden while empty.
export function renderEvents(list) {
  if (!list) return;
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= now).sort((a, b) => a.date.localeCompare(b.date));
  if (!upcoming.length) return;
  const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: site.timezone });
  list.innerHTML = upcoming
    .map((e) => {
      const label = dateFmt.format(new Date(`${e.date}T12:00:00`));
      const body = `<time datetime="${e.date}">${label}</time><strong>${e.title}</strong>${e.text ? `<span>${e.text}</span>` : ''}`;
      return `<li>${e.link ? `<a href="${e.link}" target="_blank" rel="noopener">${body}</a>` : body}</li>`;
    })
    .join('');
  list.hidden = false;
}
