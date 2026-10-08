// Business data from 07-integracao/contatos.json (mairie de Pont-Château, consulted 08/10/2026).
// Hours come from the supplied screenshot: TODO(tonton) confirm hours, bank holidays and exceptions before launch.
export const site = {
  name: 'Chez TonTon Bar Cave',
  address: '20 rue du Vélodrome, 44160 Pontchâteau',
  telephone: '+33240668419',
  telephoneDisplay: '02 40 66 84 19',
  map: 'https://www.google.com/maps/search/?api=1&query=Chez+TonTon+20+rue+du+Velodrome+44160+Pontchateau',
  instagram: 'https://www.instagram.com/cheztontonpontchateau/',
  facebook: 'https://www.facebook.com/ChezTonTonPontchateau/',
  timezone: 'Europe/Paris',
};

// [open, close] pairs, 24h. Empty array = fermé.
export const hours = [
  { day: 'monday', label: 'Lundi', slots: [['15:00', '20:00']] },
  { day: 'tuesday', label: 'Mardi', slots: [['10:00', '13:00'], ['15:00', '20:00']] },
  { day: 'wednesday', label: 'Mercredi', slots: [['10:00', '13:00'], ['15:00', '20:00']] },
  { day: 'thursday', label: 'Jeudi', slots: [['10:00', '13:00'], ['15:00', '21:00']] },
  { day: 'friday', label: 'Vendredi', slots: [['10:00', '21:00']] },
  { day: 'saturday', label: 'Samedi', slots: [['10:00', '21:00']] },
  { day: 'sunday', label: 'Dimanche', slots: [] },
];

const fmt = (t) => t.replace(':00', 'h').replace(':', 'h');

// Rendered into index.html at build time (vite.config.js), so the hours read without JavaScript.
export function hoursRowsHtml() {
  return hours
    .map(({ day, label, slots }) => {
      const value = slots.length
        ? slots.map(([a, b]) => `<span class="slot">${fmt(a)} – ${fmt(b)}</span>`).join('<span class="sep"> · </span>')
        : 'Fermé';
      return `<tr data-day="${day}"><th scope="row">${label}</th><td>${value}</td></tr>`;
    })
    .join('');
}

// Rendez-vous published by the venue only. Never add example or past dates here.
// Shape: { date: '2026-11-14', title: 'Concert', text: '…', link: 'https://…' }
// TODO(tonton) fill from the venue's channels, or leave empty (the list stays hidden).
export const events = [];
