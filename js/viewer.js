// Exhibit inspector: 3D model (model-viewer) or annotated photo, with numbered parts,
// a "How it worked" sequence, accessible controls and graceful fallbacks.
import { html, raw, $, $$, announce, prefersReducedMotion, hasWebGL, picture, figure, evidence, icons } from './util.js';
import { store } from './store.js';

let mvPromise = null;

export function loadModelViewer() {
  if (window.customElements.get('model-viewer')) return Promise.resolve();
  if (!mvPromise) {
    const draco = new URL('vendor/draco/', document.baseURI).href;
    window.ModelViewerElement = { ...(window.ModelViewerElement || {}), dracoDecoderLocation: draco };
    mvPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'vendor/model-viewer/model-viewer.min.js';
      s.onload = () => window.customElements.whenDefined('model-viewer').then(() => {
        try { window.customElements.get('model-viewer').dracoDecoderLocation = draco; } catch { /* older API */ }
        resolve();
      });
      s.onerror = () => { mvPromise = null; reject(new Error('The 3D viewer script could not be loaded.')); };
      document.head.appendChild(s);
    });
  }
  return mvPromise;
}

export function createInspector(root, artifact, data, { onSelectLink } = {}) {
  const v = artifact.viewer;
  const isModel = v.type === 'model';
  const reduced = prefersReducedMotion();
  const hotspots = artifact.hotspots;
  const anyApprox = hotspots.some((h) => h.approximate) || v.type === 'photo';
  let mv = null;
  let disposed = false;
  let fallbackShown = false;
  let current = null;
  let variant = isModel ? v.variants[0] : null;
  let howIdx = -1;
  let howTimer = null;
  const cleanups = [];

  root.innerHTML = String(html`
    <div class="inspector">
      <div class="stage-wrap">
        <div class="stage ${isModel ? '' : 'photo-stage'}" data-stage data-tour="stage">
          ${isModel ? html`<div class="progress" data-progress role="progressbar" aria-label="Loading 3D model" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>` : ''}
          <div class="stage-badge">
            <span class="tag">${v.label}</span>
            ${anyApprox ? html`<span class="tag warn">Markers approximate</span>` : ''}
          </div>
          ${isModel ? '' : photoStage()}
          ${isModel ? html`<div class="stage-hint" data-hint>Drag to rotate · scroll or pinch to zoom · tap a number</div>` : ''}
        </div>
        ${isModel ? controls() : photoControls()}
        <button type="button" class="btn btn-sm label-toggle" data-labels aria-pressed="false">Show part labels</button>
        <p class="small muted">Illustrative backdrop; not a photograph of the landing site.</p>
        ${isModel && v.variants.length > 1 ? html`<p class="variant-note" data-variant-note>${variant.note}</p>` : isModel ? html`<p class="variant-note">${variant.note}</p>` : ''}
        <p class="model-note">${v.modelNote}</p>
        ${isModel ? html`<p class="kbd-help">Keyboard: focus the model, then use <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to rotate. Press <kbd>Tab</kbd> to move through the numbered parts.</p>` : ''}
        <details class="describe"><summary>Describe this view in words</summary><p>${v.description}</p></details>
      </div>
      <div class="parts-panel">
        ${artifact.howItWorked ? howPanel() : ''}
        <div>
          <h3 id="parts-h-${artifact.id}">Parts to explore <span class="muted small">(${hotspots.length})</span></h3>
          <ol class="parts-list" aria-labelledby="parts-h-${artifact.id}">
            ${hotspots.map((h, i) => html`<li><button type="button" class="part-btn" data-part="${h.id}" aria-current="false"><span class="n" aria-hidden="true">${i + 1}</span><span>${h.label}</span><span class="seen" data-seen="${h.id}" hidden>seen</span></button></li>`)}
          </ol>
        </div>
        <div class="part-detail" data-detail tabindex="-1">
          <p class="part-empty">Choose a numbered part on the ${isModel ? 'model' : 'photo'} or in the list to learn what it did and why it was designed that way.</p>
        </div>
      </div>
    </div>`);

  const stage = $('[data-stage]', root);
  const detail = $('[data-detail]', root);
  refreshSeen();

  function photoStage() {
    return html`<div class="photo-zoom" data-zoom style="--zoom:1">
      ${picture(data, v.image, { sizes: '(min-width: 1000px) 60vw, 100vw', alt: data.images[v.image].alt, eager: true })}
      ${hotspots.map((h, i) => html`<button type="button" class="hotspot" data-hotspot="${h.id}" style="left:${h.x}%;top:${h.y}%" aria-pressed="false" aria-label="${i + 1}. ${h.label}" title="${h.label}">${i + 1}<span class="hotspot-label" aria-hidden="true">${h.label}</span></button>`)}
    </div>`;
  }

  function controls() {
    return html`<div class="controls" role="toolbar" aria-label="3D view controls">
      <button type="button" class="icon-btn" data-act="left" aria-label="Rotate left">${raw(icons.left)}</button>
      <button type="button" class="icon-btn" data-act="right" aria-label="Rotate right">${raw(icons.right)}</button>
      <button type="button" class="icon-btn" data-act="up" aria-label="Tilt up">${raw(icons.up)}</button>
      <button type="button" class="icon-btn" data-act="down" aria-label="Tilt down">${raw(icons.down)}</button>
      <span class="sep" aria-hidden="true"></span>
      <button type="button" class="icon-btn" data-act="zin" aria-label="Zoom in">${raw(icons.zoomIn)}</button>
      <button type="button" class="icon-btn" data-act="zout" aria-label="Zoom out">${raw(icons.zoomOut)}</button>
      <button type="button" class="icon-btn" data-act="reset" aria-label="Reset view">${raw(icons.reset)}</button>
      <button type="button" class="icon-btn" data-act="spin" aria-pressed="false" aria-label="Auto-rotate">${raw(icons.rotate)}</button>
      ${v.variants.length > 1 ? html`<span class="sep" aria-hidden="true"></span>
      <div class="variant-toggle" role="group" aria-label="Choose model version" data-tour="variant">
        ${v.variants.map((x, i) => html`<button type="button" data-variant="${x.id}" aria-pressed="${i === 0 ? 'true' : 'false'}">${x.label}</button>`)}
      </div>` : ''}
    </div>`;
  }

  function photoControls() {
    return html`<div class="controls" role="toolbar" aria-label="Photo controls">
      <button type="button" class="btn btn-sm" data-act="reset">${raw(icons.reset)} Show whole photo</button>
      <span class="muted small">Selecting a part zooms the photo to it.</span>
    </div>`;
  }

  function howPanel() {
    const steps = artifact.howItWorked.steps;
    return html`<section class="how-panel" aria-labelledby="how-h-${artifact.id}" data-tour="how">
      <h3 id="how-h-${artifact.id}">How it worked: ${artifact.howItWorked.title}</h3>
      <p class="how-step" data-how-step>${steps.length} steps · follow the parts in order</p>
      <div class="how-dots" aria-hidden="true">${steps.map(() => html`<span></span>`)}</div>
      <p class="how-text" data-how-text aria-live="polite">Walk through the sequence step by step. Each step highlights a part.</p>
      <div class="btn-row">
        <button type="button" class="btn btn-sm" data-how="prev" aria-label="Previous step" disabled>${raw(icons.left)}</button>
        <button type="button" class="btn btn-sm btn-primary" data-how="next">Start</button>
        <button type="button" class="btn btn-sm" data-how="play" aria-pressed="false">${raw(icons.play)} <span>Auto-play</span></button>
      </div>
    </section>`;
  }

  // ---------- 3D model ----------
  async function mountModel() {
    if (!hasWebGL()) return showFallback('Your browser or device does not support WebGL, so the 3D model cannot be shown. Here is NASA\'s render of the same model; the numbered parts list still works.');
    try {
      await loadModelViewer();
    } catch (e) {
      return showFallback(`${e.message} The parts list and NASA's render below still work.`);
    }
    if (disposed || !root.isConnected) return;
    mv = document.createElement('model-viewer');
    const attrs = {
      src: variant.src,
      poster: v.poster,
      alt: `${v.description} Use the numbered parts list to explore it in words.`,
      'camera-controls': '',
      'touch-action': 'pan-y',
      'camera-orbit': v.cameraOrbit,
      'interaction-prompt': reduced ? 'none' : 'auto',
      'shadow-intensity': '0.9',
      'shadow-softness': '0.8',
      exposure: '1.05',
      'environment-image': 'neutral',
      'interpolation-decay': reduced ? '1' : '140',
      'min-camera-orbit': 'auto 5deg auto',
      'max-camera-orbit': 'auto 175deg auto',
      'auto-rotate-delay': '0',
      'rotation-per-second': '18deg',
      loading: 'eager',
    };
    Object.entries(attrs).forEach(([k, val]) => mv.setAttribute(k, val));
    hotspots.forEach((h, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hotspot';
      b.slot = `hotspot-${h.id}`;
      b.dataset.hotspot = h.id;
      b.dataset.position = h.position;
      // With a surface normal, model-viewer toggles the "visible" attribute as the part turns away.
      if (h.normal) { b.dataset.normal = h.normal; b.dataset.visibilityAttribute = 'visible'; b.setAttribute('visible', ''); }
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${i + 1}. ${h.label}`);
      b.title = h.label;
      b.innerHTML = String(html`${i + 1}<span class="hotspot-label" aria-hidden="true">${h.label}</span>`);
      mv.appendChild(b);
    });
    stage.prepend(mv);

    const bar = $('[data-progress]', root);
    const onProgress = (e) => {
      const p = Math.round((e.detail.totalProgress || 0) * 100);
      if (disposed || !bar?.isConnected) return;
      bar.firstElementChild.style.width = `${p}%`;
      bar.setAttribute('aria-valuenow', String(p));
      bar.classList.toggle('hide', p >= 100);
    };
    const onLoad = () => { if (disposed) return; announce(`${artifact.name} 3D model loaded. ${hotspots.length} numbered parts to explore.`); };
    const onError = () => showFallback('The 3D model file could not be loaded. Here is NASA\'s render instead; the parts list still works.');
    const onStart = () => { const hint = $('[data-hint]', root); if (hint) hint.remove(); };
    mv.addEventListener('progress', onProgress);
    mv.addEventListener('load', onLoad);
    mv.addEventListener('error', onError);
    mv.addEventListener('camera-change', function once(e) {
      if (e.detail && e.detail.source === 'user-interaction') { onStart(); mv.removeEventListener('camera-change', once); }
    });
    if (new URLSearchParams(location.search).has('pick')) enablePicker();
  }

  function showFallback(msg) {
    if (disposed || fallbackShown) return;
    fallbackShown = true;
    if (mv) { mv.remove(); mv = null; }
    $('[data-labels]', root).disabled = true;
    $$('[data-act]', root).forEach((b) => { b.disabled = true; });
    $$('[data-variant]', root).forEach((b) => { b.disabled = true; });
    const bar = $('[data-progress]', root);
    if (bar) bar.remove();
    const hint = $('[data-hint]', root);
    if (hint) hint.remove();
    const fb = document.createElement('div');
    fb.className = 'stage-fallback';
    fb.innerHTML = String(html`<img src="${v.poster}" alt="${v.posterAlt}"><p class="msg" role="status">${msg}</p>`);
    stage.appendChild(fb);
    announce(msg);
  }

  function enablePicker() {
    const out = document.createElement('pre');
    out.style.cssText = 'position:absolute;right:8px;top:8px;z-index:9;background:#000c;color:#0ff;padding:6px 8px;font-size:12px;border-radius:6px;max-width:60%;white-space:pre-wrap';
    stage.appendChild(out);
    mv.addEventListener('click', (e) => {
      const hit = mv.positionAndNormalFromPoint(e.clientX, e.clientY);
      if (!hit) return;
      const f = (p) => `${p.x.toFixed(3)}m ${p.y.toFixed(3)}m ${p.z.toFixed(3)}m`;
      const o = mv.getCameraOrbit();
      out.textContent = `position: ${f(hit.position)}\nnormal: ${f(hit.normal)}\norbit: ${(o.theta * 180 / Math.PI).toFixed(0)}deg ${(o.phi * 180 / Math.PI).toFixed(0)}deg ${o.radius.toFixed(2)}m`;
      console.log(out.textContent);
    });
  }

  function camOrbit() { return mv && mv.getCameraOrbit ? mv.getCameraOrbit() : null; }

  function act(name) {
    if (name === 'reset') return resetView();
    if (!isModel || !mv) return;
    const o = camOrbit();
    if (!o) return;
    const deg = Math.PI / 180;
    let { theta, phi, radius } = o;
    if (name === 'left') theta -= 30 * deg;
    if (name === 'right') theta += 30 * deg;
    if (name === 'up') phi = Math.max(10 * deg, phi - 15 * deg);
    if (name === 'down') phi = Math.min(170 * deg, phi + 15 * deg);
    if (name === 'zin') radius *= 0.78;
    if (name === 'zout') radius *= 1.28;
    if (name === 'spin') {
      if (reduced) return;
      const on = !mv.autoRotate;
      mv.autoRotate = on;
      $('[data-act="spin"]', root).setAttribute('aria-pressed', String(on));
      announce(on ? 'Auto-rotate on' : 'Auto-rotate off');
      return;
    }
    mv.cameraOrbit = `${theta}rad ${phi}rad ${radius}m`;
  }

  function resetView() {
    if (isModel) {
      if (!mv) return;
      mv.autoRotate = false;
      mv.resetTurntableRotation?.();
      $('[data-act="spin"]', root).setAttribute('aria-pressed', 'false');
      mv.cameraTarget = 'auto auto auto';
      mv.cameraOrbit = v.cameraOrbit;
      mv.fieldOfView = 'auto';
      announce('View reset');
    } else {
      const z = $('[data-zoom]', root);
      z.style.setProperty('--zoom', '1');
      z.style.transform = '';
      announce('Showing the whole photo');
    }
  }

  function flyTo(h) {
    if (isModel && mv) {
      if (h.orbit) {
        mv.cameraTarget = h.position;
        mv.cameraOrbit = h.orbit;
      }
    } else if (!isModel) {
      const z = $('[data-zoom]', root);
      const s = 1.9;
      z.style.setProperty('--zoom', String(s));
      z.style.transformOrigin = `${h.x}% ${h.y}%`;
      z.style.transform = `scale(${s})`;
    }
  }

  function select(id, { fromHow = false, focusDetail = false } = {}) {
    const h = hotspots.find((x) => x.id === id);
    if (!h) return;
    current = id;
    const n = hotspots.indexOf(h) + 1;
    $$('.hotspot', root).forEach((b) => {
      const on = b.dataset.hotspot === id;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('pulse', on && fromHow);
    });
    $$('[data-part]', root).forEach((b) => b.setAttribute('aria-current', String(b.dataset.part === id)));
    detail.innerHTML = String(html`
      <h3><span class="tag">Part ${n} of ${hotspots.length}</span> ${h.label} ${h.approximate ? html`<span class="tag warn">Location approximate</span>` : ''}</h3>
      <dl>
        <div><dt>What it is</dt><dd>${h.what}</dd></div>
        <div><dt>Why it was designed this way</dt><dd>${h.why}</dd></div>
        <div><dt>What it helped us learn</dt><dd>${h.science}</dd></div>
      </dl>
      ${h.image ? figure(data, h.image, { sizes: '(min-width: 1000px) 30vw, 100vw' }) : ''}
      ${h.link ? html`<p style="margin-top:14px"><a class="btn btn-sm" href="${h.link.artifact ? `#/exhibit/${h.link.artifact}` : `#/exhibit/${artifact.id}/${h.link.anchor}`}">${h.link.label} →</a></p>` : ''}
      ${evidence(data, h.sourceIds)}`);
    flyTo(h);
    store.part(artifact.id, id);
    refreshSeen();
    if (!fromHow) announce(`${h.label}. ${h.what}`);
    if (focusDetail) detail.focus({ preventScroll: true });
  }

  function refreshSeen() {
    const seen = store.get().parts[artifact.id] || [];
    $$('[data-seen]', root).forEach((s) => { s.hidden = !seen.includes(s.dataset.seen); });
  }

  // ---------- How it worked ----------
  function howGo(i) {
    const steps = artifact.howItWorked.steps;
    howIdx = Math.max(0, Math.min(steps.length - 1, i));
    const step = steps[howIdx];
    $('[data-how-step]', root).textContent = `Step ${howIdx + 1} of ${steps.length}`;
    $('[data-how-text]', root).textContent = step.text;
    $$('.how-dots span', root).forEach((d, k) => d.classList.toggle('on', k <= howIdx));
    $('[data-how="prev"]', root).disabled = howIdx === 0;
    const next = $('[data-how="next"]', root);
    next.textContent = howIdx === steps.length - 1 ? 'Start again' : 'Next step';
    select(step.hotspot, { fromHow: true });
    if (howIdx === steps.length - 1) {
      store.howDone(artifact.id);
      if (howTimer) stopPlay();
    }
  }
  function startPlay() {
    if (reduced) return;
    const btn = $('[data-how="play"]', root);
    btn.setAttribute('aria-pressed', 'true');
    btn.innerHTML = `${icons.pause} <span>Pause</span>`;
    if (howIdx < 0 || howIdx === artifact.howItWorked.steps.length - 1) howGo(0); else howGo(howIdx + 1);
    howTimer = window.setInterval(() => {
      if (howIdx >= artifact.howItWorked.steps.length - 1) return stopPlay();
      howGo(howIdx + 1);
    }, 5500);
  }
  function stopPlay() {
    window.clearInterval(howTimer);
    howTimer = null;
    const btn = $('[data-how="play"]', root);
    if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.innerHTML = `${icons.play} <span>Auto-play</span>`; }
  }

  // ---------- Events ----------
  const onClick = (e) => {
    const t = e.target.closest('button');
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-labels')) {
      const on = t.getAttribute('aria-pressed') !== 'true';
      t.setAttribute('aria-pressed', String(on));
      t.textContent = on ? 'Hide part labels' : 'Show part labels';
      stage.classList.toggle('show-labels', on);
    } else if (t.dataset.hotspot) { if (howTimer) stopPlay(); select(t.dataset.hotspot); }
    else if (t.dataset.part) { if (howTimer) stopPlay(); select(t.dataset.part, { focusDetail: false }); }
    else if (t.dataset.act) act(t.dataset.act);
    else if (t.dataset.variant) switchVariant(t.dataset.variant);
    else if (t.dataset.how === 'next') {
      const last = artifact.howItWorked.steps.length - 1;
      if (howTimer) stopPlay();
      howGo(howIdx >= last ? 0 : howIdx + 1);
    } else if (t.dataset.how === 'prev') { if (howTimer) stopPlay(); howGo(howIdx - 1); }
    else if (t.dataset.how === 'play') { if (howTimer) stopPlay(); else startPlay(); }
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  function switchVariant(id) {
    const next = v.variants.find((x) => x.id === id);
    if (!next || next === variant) return;
    variant = next;
    $$('[data-variant]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === id)));
    const note = $('[data-variant-note]', root);
    if (note) note.textContent = next.note;
    if (mv) {
      const bar = $('[data-progress]', root);
      if (bar) { bar.classList.remove('hide'); bar.firstElementChild.style.width = '0%'; }
      mv.src = next.src;
    }
    announce(`Showing: ${next.label}. ${next.note}`);
  }

  if (reduced) {
    $$('[data-how="play"], [data-act="spin"]', root).forEach(b => { b.disabled = true; b.title = 'Reduced motion is on. Use the manual controls.'; });
  }
  const onVisibility = () => {
    if (!document.hidden) return;
    stopPlay();
    if (mv) { mv.autoRotate = false; $('[data-act="spin"]', root).setAttribute('aria-pressed', 'false'); }
  };
  document.addEventListener('visibilitychange', onVisibility);
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));
  if (isModel) mountModel();

  return {
    select,
    destroy() {
      disposed = true;
      stopPlay();
      if (mv) { mv.autoRotate = false; mv.remove(); mv = null; }
      cleanups.forEach((fn) => fn());
    },
  };
}
