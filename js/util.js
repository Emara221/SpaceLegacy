// Small DOM and formatting helpers shared by all views.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Tagged template that escapes interpolated values unless wrapped with raw(). */
export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) out += toHtml(values[i]);
  });
  return new Raw(out);
}
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(String(s ?? ''));
function toHtml(v) {
  if (v == null || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(toHtml).join('');
  return esc(v);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function announce(msg) {
  const live = document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  // Re-set on next frame so screen readers announce repeated messages.
  requestAnimationFrame(() => { live.textContent = msg; });
}

export const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Responsive <img> for an image id from content.images. */
export function picture(data, id, { sizes = '(min-width: 1000px) 50vw, 100vw', cls = '', eager = false, alt } = {}) {
  const im = data.images[id];
  if (!im) return '';
  const small = Math.min(800, im.w);
  const ratioH = Math.round((im.h / im.w) * 1000);
  return html`<img class="${cls}" src="${im.src}-800.webp" srcset="${im.src}-800.webp ${small}w, ${im.src}-1600.webp ${im.w}w" sizes="${sizes}" width="1000" height="${ratioH}" alt="${alt ?? im.alt}" ${raw(eager ? 'fetchpriority="high"' : 'loading="lazy"')} decoding="async">`;
}

export function figure(data, id, { cls = '', sizes } = {}) {
  const im = data.images[id];
  if (!im) return '';
  return html`<figure class="${cls}">${picture(data, id, { sizes })}<figcaption>${im.caption} <span class="credit">Credit: ${im.credit}.</span> ${sourceLink(data, im.sourceId, 'Source')}</figcaption></figure>`;
}

export function sourceLink(data, id, label) {
  const s = data.sources[id];
  if (!s) return '';
  return html`<a href="${s.url}" target="_blank" rel="noopener" title="${s.title} (${s.publisher})">${label ?? s.publisher}<span class="visually-hidden"> (opens in a new tab)</span> ↗</a>`;
}

export function evidence(data, ids = [], prefix = 'Evidence:') {
  const uniq = [...new Set(ids)].filter((id) => data.sources[id]);
  if (!uniq.length) return '';
  return html`<p class="evidence">${prefix} ${uniq.map((id, i) => html`${i ? ' · ' : ''}${sourceLink(data, id, shortTitle(data.sources[id]))}`)}</p>`;
}

function shortTitle(s) {
  const t = s.title.replace(/\s*\(.*?\)\s*$/, '');
  return t.length > 60 ? t.slice(0, 57) + '…' : t;
}

export function fmtCoord(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  const digits = Math.abs(lat) < 1 ? 4 : 2;
  return `${Math.abs(lat).toFixed(digits)}° ${ns}, ${Math.abs(lon).toFixed(digits)}° ${ew}`;
}

export const icons = {
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zoomIn: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 8v6M8 11h6M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  zoomOut: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11h6M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
  pen: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  laser: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="12" r="1.6" fill="currentColor"/></svg>',
};
