// Lunar laser ranging: an educational model of t = 2d / c.
import { html, raw, $, $$, announce, prefersReducedMotion, evidence, icons } from './util.js';
import { store } from './store.js';

export const C_M_PER_S = 299792458; // exact, by definition of the metre
const PERIGEE_KM = 363300; // NSSDCA Moon fact sheet (centre to centre)
const MEAN_KM = 384400; // semimajor axis
const APOGEE_KM = 405500;

export const roundTripSeconds = (km) => (2 * km * 1000) / C_M_PER_S;
export const distanceKm = (seconds) => (C_M_PER_S * seconds) / 2 / 1000;

const fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const CHALLENGES = [2.42, 2.51, 2.6, 2.69];

export function createLaserActivity(root, data, { activityKey = 'laser-ranging' } = {}) {
  let km = MEAN_KM;
  let slow = false;
  let raf = 0;
  let challengeIdx = 0;
  const reduced = prefersReducedMotion();

  root.innerHTML = String(html`
    <div class="activity">
      <div>
        <div class="laser-scene">
          <svg viewBox="0 0 800 300" role="img" aria-labelledby="ls-title ls-desc">
            <title id="ls-title">Laser pulse between Earth and the Moon</title>
            <desc id="ls-desc">Earth is on the left with a telescope; the Moon is on the right with the Apollo 11 reflector. A pulse of light travels to the Moon and back. Not to scale.</desc>
            <defs>
              <radialGradient id="earthG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#4f8fd6"/><stop offset="0.6" stop-color="#1f4f8f"/><stop offset="1" stop-color="#0d2547"/></radialGradient>
              <radialGradient id="moonG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#e9e3d6"/><stop offset="1" stop-color="#8d887d"/></radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g fill="#ffffff" opacity="0.55">${raw(stars())}</g>
            <circle cx="70" cy="150" r="62" fill="url(#earthG)"/>
            <rect x="128" y="141" width="14" height="18" rx="3" fill="#cfd6e4"/>
            <text x="12" y="240" text-anchor="start" fill="#aab1c0" font-size="15" font-family="IBM Plex Mono, monospace">Earth · telescope</text>
            <circle cx="728" cy="150" r="20" fill="url(#moonG)"/>
            <rect x="700" y="145" width="8" height="10" fill="#52d6ec"/>
            <text x="788" y="200" text-anchor="end" fill="#aab1c0" font-size="15" font-family="IBM Plex Mono, monospace">Moon · reflector</text>
            <line x1="142" y1="150" x2="700" y2="150" stroke="#52d6ec" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="6 8"/>
            <line data-beam x1="142" y1="150" x2="142" y2="150" stroke="#52d6ec" stroke-width="3" filter="url(#glow)"/>
            <circle data-pulse cx="142" cy="150" r="7" fill="#d9fbff" filter="url(#glow)" opacity="0"/>
            <text data-dist x="421" y="128" text-anchor="middle" fill="#efe9dc" font-size="17" font-family="IBM Plex Mono, monospace"></text>
          </svg>
          <p class="scene-note">Not to scale: at true scale the Moon would sit about 30 Earth-widths away.</p>
        </div>
        <div class="readout" aria-live="off">
          <div><span class="k">Distance d</span><span class="v" data-out-d></span></div>
          <div><span class="k">Round-trip clock</span><span class="v" data-out-clock>0.000 s</span></div>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn btn-primary" data-fire>${raw(icons.laser)} Fire laser</button>
          <label class="option" style="margin:0;min-height:44px"><input type="checkbox" data-slow> Slow motion (4× slower)</label>
        </div>
        <p class="small muted" style="margin-top:10px" data-timing-note>${reduced ? 'Reduced motion is on, so the result appears without animation.' : 'Animation timing: in normal mode the pulse takes the real calculated time. The clock always shows physical time.'}</p>
      </div>

      <div class="control-group">
        <label for="dist-range">Assumed Earth–Moon distance (d)</label>
        <input id="dist-range" type="range" min="${PERIGEE_KM}" max="${APOGEE_KM}" step="100" value="${MEAN_KM}" aria-describedby="dist-help">
        <div class="num-input">
          <input id="dist-num" type="number" inputmode="numeric" min="${PERIGEE_KM}" max="${APOGEE_KM}" step="100" value="${MEAN_KM}" aria-label="Distance in kilometres">
          <span>km</span>
        </div>
        <p id="dist-help" class="small muted">The Moon's orbit is an ellipse, so its distance changes every month. Range shown: closest to farthest, centre to centre.</p>
        <div class="presets" role="group" aria-label="Distance presets">
          <button type="button" class="btn btn-sm" data-preset="${PERIGEE_KM}">Closest (${fmt(PERIGEE_KM)} km)</button>
          <button type="button" class="btn btn-sm" data-preset="${MEAN_KM}">Average (${fmt(MEAN_KM)} km)</button>
          <button type="button" class="btn btn-sm" data-preset="${APOGEE_KM}">Farthest (${fmt(APOGEE_KM)} km)</button>
        </div>
        <div class="math" aria-live="polite" data-math></div>
        <ul class="vars">
          <li><b>t</b> = round-trip time of the pulse, in seconds</li>
          <li><b>d</b> = one-way distance from Earth to the Moon, in metres</li>
          <li><b>c</b> = speed of light = 299,792,458 m/s (exact)</li>
          <li><b>2</b> because the light goes there <em>and</em> back</li>
        </ul>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:28px">
      <div class="challenge">
        <h3>Your turn: measure like a scientist</h3>
        <p data-ch-q></p>
        <form class="num-input" data-ch-form>
          <label for="ch-ans" class="visually-hidden">Your distance answer in kilometres</label>
          <input id="ch-ans" type="number" inputmode="numeric" placeholder="distance" required>
          <span>km</span>
          <button type="submit" class="btn btn-sm btn-primary">Check</button>
        </form>
        <div data-ch-fb></div>
        <p class="small muted" style="margin-top:10px">Hint: rearrange the formula: d = c × t ÷ 2. Divide by 1,000 to turn metres into kilometres.</p>
        <button type="button" class="btn btn-sm btn-ghost" data-ch-new>New measurement</button>
      </div>
      <div class="card">
        <h3>Why a corner cube sends light home</h3>
        <svg class="corner-svg" viewBox="0 0 320 220" role="img" aria-labelledby="cc-t cc-d">
          <title id="cc-t">Corner reflector diagram</title>
          <desc id="cc-d">Two mirrors meet at a right angle. A ray comes in, bounces off both mirrors, and leaves parallel to the way it came, heading back toward its source.</desc>
          <path d="M40 30 L40 190 L250 190" fill="none" stroke="#cfc8b8" stroke-width="6" stroke-linecap="round"/>
          <!-- 45° ray: (-1,+1) in, mirrored to (+1,+1), then (+1,-1) out: exactly antiparallel -->
          <path d="M165 5 L42 128" stroke="#52d6ec" stroke-width="3" marker-end="url(#ah)" fill="none"/>
          <path d="M40 130 L100 190" stroke="#52d6ec" stroke-width="3" fill="none"/>
          <path d="M100 190 L228 62" stroke="#e57c4f" stroke-width="3" marker-end="url(#ah2)" fill="none"/>
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#52d6ec"/></marker>
            <marker id="ah2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#e57c4f"/></marker>
          </defs>
          <text x="174" y="20" fill="#aab1c0" font-size="13" font-family="IBM Plex Mono, monospace">incoming laser</text>
          <text x="196" y="108" fill="#aab1c0" font-size="13" font-family="IBM Plex Mono, monospace">returns parallel</text>
          <text x="50" y="212" fill="#7f889b" font-size="12" font-family="IBM Plex Mono, monospace">mirror faces at 90°</text>
        </svg>
        <p class="small">This flat drawing shows two faces. Each real corner cube has three faces at right angles, so the trick works for light arriving from any direction, which is why the reflector only had to be roughly aimed at Earth.</p>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:20px">
      <div class="callout">
        <h4>What this model simplifies</h4>
        <ul>
          <li>It uses the centre-to-centre distance. Real measurements run from a telescope on Earth's surface to the reflector on the Moon's surface.</li>
          <li>It ignores the tiny slowdown of light in Earth's air, and the motion of Earth and the Moon during the trip.</li>
          <li>Real laser beams spread out on the way, so only a small fraction of the light comes back. Observatories need sensitive detectors and very precise clocks.</li>
          <li>This page does not connect to any real telescope or reflector. It is a calculation.</li>
        </ul>
      </div>
      <div class="card">
        <h3>What the timing tells scientists</h3>
        <p>Observatories measure the distance to within a few millimeters. A change of just 3.8 cm (the amount the Moon drifts away each year) changes the round trip by only about <strong data-tiny></strong>.</p>
        <p class="small muted">Those tiny timing changes revealed the Moon's slow retreat, its fluid core and its monthly flexing, and tested Einstein's theory of gravity.</p>
        ${evidence(data, ['nasa-llr-keeps-giving', 'nssdc-moon-facts', 'nist-c'], 'Sources:')}
      </div>
    </div>`);

  const range = $('#dist-range', root);
  const num = $('#dist-num', root);
  const beam = $('[data-beam]', root);
  const pulse = $('[data-pulse]', root);
  const clock = $('[data-out-clock]', root);

  $('[data-tiny]', root).textContent = `${fmt((2 * 0.038) / C_M_PER_S * 1e9, 2)} nanoseconds (billionths of a second)`;

  function update() {
    const t = roundTripSeconds(km);
    $('[data-out-d]', root).textContent = `${fmt(km)} km`;
    $('[data-dist]', root).textContent = `d = ${fmt(km)} km`;
    $('[data-math]', root).innerHTML = String(html`
      <p>t = 2d ÷ c</p>
      <p>t = 2 × ${fmt(km * 1000)} m ÷ 299,792,458 m/s</p>
      <p>t = ${fmt(2 * km * 1000)} m ÷ 299,792,458 m/s</p>
      <p class="result">t ≈ ${fmt(t, 3)} s</p>`);
  }

  function setKm(v) {
    const n = Math.round(Number(v) / 100) * 100;
    if (!Number.isFinite(n)) return;
    km = Math.min(APOGEE_KM, Math.max(PERIGEE_KM, n));
    range.value = String(km);
    num.value = String(km);
    update();
  }

  function fire() {
    cancelAnimationFrame(raf);
    const t = roundTripSeconds(km);
    const x0 = 142, x1 = 700;
    if (reduced) {
      beam.setAttribute('x2', String(x1));
      pulse.setAttribute('opacity', '0');
      clock.textContent = `${fmt(t, 3)} s`;
      announce(`Round trip: ${fmt(t, 3)} seconds for ${fmt(km)} kilometres.`);
      store.activity(`${activityKey}-fired`, true);
      return;
    }
    const duration = t * 1000 * (slow ? 4 : 1);
    const start = performance.now();
    pulse.setAttribute('opacity', '1');
    const fireBtn = $('[data-fire]', root);
    fireBtn.disabled = true;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const x = p < 0.5 ? x0 + (x1 - x0) * (p * 2) : x1 - (x1 - x0) * ((p - 0.5) * 2);
      pulse.setAttribute('cx', String(x));
      beam.setAttribute('x2', String(p < 0.5 ? x : x1));
      beam.setAttribute('x1', String(p < 0.5 ? x0 : x));
      clock.textContent = `${fmt(p * t, 3)} s`;
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        pulse.setAttribute('opacity', '0');
        beam.setAttribute('x1', String(x0));
        beam.setAttribute('x2', String(x0));
        fireBtn.disabled = false;
        announce(`The pulse is back after ${fmt(t, 3)} seconds.`);
        store.activity(`${activityKey}-fired`, true);
      }
    };
    raf = requestAnimationFrame(step);
  }

  function newChallenge() {
    challengeIdx = (challengeIdx + 1) % CHALLENGES.length;
    const t = CHALLENGES[challengeIdx];
    $('[data-ch-q]', root).innerHTML = String(html`An observatory times a laser pulse: it comes back after <strong>${t.toFixed(2)} seconds</strong>. How far away was the Moon at that moment?`);
    $('[data-ch-fb]', root).innerHTML = '';
    $('#ch-ans', root).value = '';
  }

  function check(e) {
    e.preventDefault();
    const t = CHALLENGES[challengeIdx];
    const ans = Number($('#ch-ans', root).value);
    const truth = distanceKm(t);
    const fb = $('[data-ch-fb]', root);
    const ok = Number.isFinite(ans) && Math.abs(ans - truth) / truth <= 0.01;
    fb.innerHTML = String(html`<div class="feedback ${ok ? 'ok' : 'bad'}" role="status">
      ${ok ? 'Correct!' : 'Not quite.'} d = c × t ÷ 2 = 299,792,458 m/s × ${t.toFixed(2)} s ÷ 2 ≈ ${fmt(truth * 1000)} m ≈ <strong>${fmt(truth)} km</strong>.
      ${ok ? ' You just did what lunar laser ranging stations do, without the millimetre precision.' : ' Check that you divided by 2 (the light goes there and back) and by 1,000 (metres to kilometres).'}
    </div>`);
    if (ok) store.activity(activityKey, true);
  }

  root.addEventListener('input', (e) => {
    if (e.target === range) setKm(range.value);
  });
  root.addEventListener('change', (e) => {
    if (e.target === num) setKm(num.value);
    if (e.target.matches('[data-slow]')) slow = e.target.checked;
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-fire')) fire();
    if (b.dataset.preset) setKm(b.dataset.preset);
    if (b.hasAttribute('data-ch-new')) newChallenge();
  });
  $('[data-ch-form]', root).addEventListener('submit', check);

  challengeIdx = -1;
  newChallenge();
  update();
  if (reduced) $$('[data-slow]', root).forEach((x) => { x.disabled = true; });

  return { destroy() { cancelAnimationFrame(raf); } };
}

function stars() {
  let s = '';
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    s += `<circle cx="${(rnd() * 800).toFixed(1)}" cy="${(rnd() * 300).toFixed(1)}" r="${(rnd() * 1.2 + 0.3).toFixed(2)}"/>`;
  }
  return s;
}
