// A short guided tour that walks through one complete learning journey.
import { html, $, $$ } from './util.js';

const KEY = 'spacelegacy.tour';
const STEPS = [
  { route: '#/', target: '[data-tour="hero"]', title: 'Welcome to SpaceLegacy', text: 'A museum of real machines left on the Moon and Mars. Every exhibit follows the same journey: choose a world, inspect a machine, follow its story, try the science, then check what you learned.' },
  { route: '#/explore/moon', target: '[data-tour="map"]', title: '1 · Choose a world', text: 'Markers sit at published landing coordinates on a NASA map. Tranquility Base, where Apollo 11 landed, holds two exhibits.' },
  { route: '#/exhibit/apollo11-descent-stage', target: '[data-tour="stage"]', title: '2 · Inspect it in 3D', text: 'Drag to rotate, scroll or pinch to zoom, and tap the numbers. Each part explains what it did, why it was designed that way and what it helped us learn.' },
  { route: '#/exhibit/apollo11-descent-stage', target: '[data-tour="variant"]', title: 'Honest about what is left', text: 'Switch between July 1969 and today. Only Eagle\'s descent stage is still on the Moon; the crew cabin flew back to orbit.' },
  { route: '#/exhibit/apollo11-descent-stage', target: '[data-tour="how"]', title: 'How it worked', text: 'Step through the landing in order. Each step flies the camera to the part involved.' },
  { route: '#/exhibit/apollo11-descent-stage/story', target: '#story', title: '3 · Follow the story', text: 'Five questions every exhibit answers, told in the machine\'s voice. The narration is clearly labelled as creative, and NASA evidence is linked under each chapter.' },
  { route: '#/exhibit/apollo11-retroreflector/activity', target: '#activity', title: '4 · Try the science', text: 'Fire a laser at the Apollo 11 reflector and use t = 2d ÷ c to find the Earth–Moon distance, the same idea real observatories use.' },
  { route: '#/exhibit/apollo11-retroreflector/quiz', target: '#quiz', title: '5 · Check what you learned', text: 'Each exhibit ends with short questions and explanations. Progress is saved only on this device, in your explorer log. Enjoy exploring!' },
];

let idx = -1;
let card = null;

function saveIdx() { try { sessionStorage.setItem(KEY, String(idx)); } catch { /* ignore */ } }
function loadIdx() { try { return Number(sessionStorage.getItem(KEY) ?? -1); } catch { return -1; } }

export const tour = {
  start() { idx = 0; saveIdx(); go(); },
  /** Called by the router after each render. */
  onRender() {
    if (idx < 0) idx = loadIdx();
    if (idx < 0 || idx >= STEPS.length) return;
    const step = STEPS[idx];
    if (normalize(location.hash) === normalize(step.route)) show();
  },
  active: () => idx >= 0,
};

function normalize(h) { return (h || '#/').replace(/\/$/, '') || '#'; }

function go() {
  const step = STEPS[idx];
  if (normalize(location.hash) !== normalize(step.route)) location.hash = step.route;
  else show();
}

function show() {
  const step = STEPS[idx];
  $$('.tour-highlight').forEach((el) => el.classList.remove('tour-highlight'));
  renderCard(step);
  // Wait for async content (e.g. the 3D viewer controls) to appear.
  let tries = 0;
  const find = () => {
    const el = $(step.target);
    if (el) {
      el.classList.add('tour-highlight');
      el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else if (tries++ < 20) setTimeout(find, 150);
  };
  setTimeout(find, 120);
}

function renderCard(step) {
  const root = document.getElementById('tour-root');
  root.innerHTML = String(html`
    <div class="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title">
      <p class="tour-count">Guided tour · ${idx + 1} of ${STEPS.length}</p>
      <h2 id="tour-title" tabindex="-1">${step.title}</h2>
      <p>${step.text}</p>
      <div class="btn-row">
        <button type="button" class="btn btn-sm" data-t="back" ${idx === 0 ? 'disabled' : ''}>Back</button>
        <button type="button" class="btn btn-sm btn-primary" data-t="next">${idx === STEPS.length - 1 ? 'Finish' : 'Next'}</button>
        <button type="button" class="btn btn-sm btn-ghost" data-t="exit">Exit tour</button>
      </div>
    </div>`);
  card = root.firstElementChild;
  card.addEventListener('click', onClick);
  card.addEventListener('keydown', (e) => { if (e.key === 'Escape') end(); });
  $('#tour-title', card).focus({ preventScroll: true });
}

function onClick(e) {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.t === 'next') { if (idx >= STEPS.length - 1) end(); else { idx++; saveIdx(); go(); } }
  if (b.dataset.t === 'back') { idx = Math.max(0, idx - 1); saveIdx(); go(); }
  if (b.dataset.t === 'exit') end();
}

function end() {
  idx = -1;
  saveIdx();
  $$('.tour-highlight').forEach((el) => el.classList.remove('tour-highlight'));
  const root = document.getElementById('tour-root');
  root.innerHTML = '';
  card = null;
  const main = document.getElementById('main');
  if (main) main.focus({ preventScroll: true });
}
