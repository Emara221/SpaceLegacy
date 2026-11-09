// SpaceLegacy: hash router and page views. Content lives in content/artifacts.json.
import { html, raw, esc, $, $$, announce, picture, figure, evidence, sourceLink, fmtCoord, icons } from './util.js';
import { store, progressFor } from './store.js';
import { createInspector } from './viewer.js';
import { createLaserActivity } from './laser.js';
import { createSolarActivity } from './solar.js';
import { createQuiz } from './quiz.js';
import { tour } from './tour.js';

const app = document.getElementById('app');
let data = null;
let teardown = [];
let lastPath = null;

init();

async function init() {
  setupNav();
  $('.skip-link').addEventListener('click', (e) => { e.preventDefault(); $('#main').focus(); });
  try {
    const res = await fetch('content/artifacts.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    data.artifacts.sort((a, b) => a.order - b.order);
  } catch (e) {
    app.innerHTML = String(html`<div class="container loading-screen"><h1>Could not load the museum</h1>
      <p>The exhibit content (content/artifacts.json) did not load: ${e.message}.</p>
      <p>If you opened this file directly from your computer, start a local web server instead, for example <code>python -m http.server 8080</code> in the project folder, then visit <code>http://localhost:8080</code>.</p></div>`);
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

function setupNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
  });
}

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { parts, path: parts.slice(0, 2).join('/') };
}

function route() {
  const { parts, path } = parse();
  const samePage = path === lastPath && parts[0] === 'exhibit';
  if (samePage) { scrollToSection(parts[2]); tour.onRender(); return; }
  teardown.forEach((fn) => fn());
  teardown = [];
  lastPath = path;
  const [page, arg] = parts;
  document.body.dataset.world = page === 'explore' ? (arg === 'mars' ? 'mars' : 'moon') : page === 'exhibit' ? (byId(arg)?.destination || '') : '';
  let navKey = '';
  if (!page) renderHome();
  else if (page === 'explore') { navKey = arg === 'mars' ? 'mars' : 'moon'; renderExplore(navKey); }
  else if (page === 'exhibit') {
    const a = data.artifacts.find((x) => x.id === arg);
    if (a) { navKey = a.destination; renderExhibit(a, parts[2]); } else renderNotFound();
  } else if (page === 'sources') { navKey = 'sources'; renderSources(); }
  else if (page === 'classroom') { navKey = 'classroom'; renderClassroom(); }
  else if (page === 'about') { navKey = 'about'; renderAbout(); }
  else if (page === 'log') { navKey = 'log'; renderLog(); }
  else renderNotFound();

  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const h1 = $('h1', app);
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    document.title = page ? `${h1.textContent.trim()} · SpaceLegacy` : 'SpaceLegacy · Left behind. Still inspiring.';
  }
  if (!(page === 'exhibit' && parts[2])) {
    window.scrollTo(0, 0);
    // Move focus to the new page heading on in-app navigation (not on first load).
    if (h1 && !firstRender) h1.focus({ preventScroll: true });
  }
  firstRender = false;
  tour.onRender();
}
let firstRender = true;

function set(markup) { app.innerHTML = String(markup); }
const byId = (id) => data.artifacts.find((a) => a.id === id);
const destOf = (a) => data.destinations[a.destination];

// ------------------------------------------------------------------ Home
function renderHome() {
  const arts = data.artifacts;
  set(html`
    <section class="hero" data-tour="hero">
      <div class="hero-media">${picture(data, 'a11-easep-deployed', { sizes: '100vw', eager: true, alt: '' })}</div>
      <div class="container">
        <div class="hero-inner">
          <p class="eyebrow"><span class="dot"></span>NASA Space Apps Challenge 2026 · An interactive 3D museum</p>
          <h1>SpaceLegacy</h1>
          <p class="tagline">Left behind. Still inspiring.</p>
          <p class="lede">A launch pad with no crew. A rover with a broken wheel. A reflector still doing science. Meet the machines that stayed behind, and discover what they helped us learn.</p>
          <div class="btn-row" style="margin-top:26px">
            <a class="btn btn-primary" href="#/explore/moon">Explore the Moon →</a>
            <a class="btn" href="#/explore/mars">Explore Mars →</a>
            <button type="button" class="btn" data-start-tour>Take the 2-minute tour</button>
          </div>
          <p class="mission-invite">Your mission: choose a world, investigate a machine, and bring its story back to Earth.</p>
          <ul class="hero-stats">
            <li><strong>4</strong> artifacts</li>
            <li><strong>2</strong> worlds</li>
            <li><strong>3</strong> NASA 3D models</li>
            <li><strong>1</strong> still doing science</li>
          </ul>
        </div>
      </div>
      <p class="hero-credit">Photo: Buzz Aldrin beside the Apollo 11 experiments; Eagle stands at right. NASA (AS11-40-5948), taken by Neil Armstrong.</p>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">The collection</p>
          <h2>Four machines, two worlds</h2>
          <p class="muted">Each exhibit is a real piece of hardware still sitting where its mission ended. Some are silent. One is still used by scientists every year.</p>
        </div>
        <div class="grid grid-4">${arts.map(card)}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">How a visit works</p>
          <h2>One journey, five steps</h2>
        </div>
        <ol class="journey">
          <li><strong>Choose a world</strong><span>Moon or Mars, on a real NASA map.</span></li>
          <li><strong>Discover an artifact</strong><span>Find out what was left there and why.</span></li>
          <li><strong>Inspect it in 3D</strong><span>Rotate, zoom and tap labeled parts.</span></li>
          <li><strong>Follow its story</strong><span>Built for what? What happened? What did we learn?</span></li>
          <li><strong>Try the science</strong><span>Then answer a few questions.</span></li>
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Status check</p>
          <h2>Where are they now?</h2>
          <p class="muted">Not everything left behind is "dead". We separate machines that finished their missions, machines that lost contact, and equipment still in scientific use. Status last checked ${fmtDate(data.lastVerified)}.</p>
        </div>
        <ul class="status-board">
          ${arts.map((a) => html`<li>
            <div class="who"><a href="#/exhibit/${a.id}">${a.name}</a><small>${destOf(a).name} · ${a.location.site.split(/[,.(]/)[0]}</small></div>
            <div><span class="pill status-${a.status.type}">${a.status.label}</span></div>
          </li>`)}
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container grid grid-2" style="align-items:center">
        <div>
          <p class="eyebrow">For teachers</p>
          <h2>A ready-made 45-minute lesson</h2>
          <p>Students investigate one machine in pairs, compute the Earth–Moon distance from a laser's travel time, and present how engineering led to discovery. Includes a printable worksheet.</p>
          <a class="btn" href="#/classroom">Open the classroom plan →</a>
        </div>
        ${figure(data, 'insight-final-selfie', { sizes: '(min-width: 720px) 50vw, 100vw' })}
      </div>
    </section>`);
  $('[data-start-tour]', app).addEventListener('click', () => tour.start());
}

function card(a) {
  const p = progressFor(a);
  return html`<a class="artifact-card" href="#/exhibit/${a.id}">
    <div class="thumb">${picture(data, a.cardImage, { sizes: '(min-width: 1000px) 25vw, (min-width: 720px) 50vw, 100vw', alt: '' })}</div>
    <div class="body">
      <div class="meta"><span class="pill dest-${a.destination}">${destOf(a).name}</span>${a.viewer.type === 'model' ? html`<span class="tag">3D</span>` : html`<span class="tag">Photo</span>`}</div>
      <h3>${a.name}</h3>
      <p class="mission">${a.mission}</p>
      <p class="teaser">${a.teaser}</p>
      <p class="card-progress">${p.done ? `${p.done}/${p.total} steps done` : 'Not visited yet'}</p>
    </div>
  </a>`;
}

// ------------------------------------------------------------------ Explore
function renderExplore(key) {
  const d = data.destinations[key];
  const arts = data.artifacts.filter((a) => a.destination === key);
  const groups = [];
  arts.forEach((a) => {
    const g = groups.find((x) => Math.abs(x.lat - a.location.lat) < 0.5 && Math.abs(x.lon - a.location.lon) < 0.5);
    if (g) g.items.push(a); else groups.push({ lat: a.location.lat, lon: a.location.lon, items: [a] });
  });
  const pos = (g) => {
    const x = ((((g.lon - d.map.lonMin) % 360) + 360) % 360) / 360 * 100;
    const y = (90 - g.lat) / 180 * 100;
    return { x, y };
  };
  set(html`
    <div class="container page-head">
      <p class="eyebrow"><span class="dot"></span>Choose a world</p>
      <h1>${d.name}</h1>
      <p class="world-tagline">${d.tagline}</p>
      <p class="lede">${d.intro}</p>
      <p class="small muted">Choose a marker to open its site card, or pick an exhibit below.</p>
      <nav class="tabs" aria-label="Destinations">
        <a href="#/explore/moon" ${raw(key === 'moon' ? 'aria-current="page"' : '')}>The Moon</a>
        <a href="#/explore/mars" ${raw(key === 'mars' ? 'aria-current="page"' : '')}>Mars</a>
      </nav>
    </div>
    <div class="container explore-layout">
      <figure class="map-figure" data-tour="map">
        <div class="map-frame" data-map>
          <img src="${d.map.image}" width="${d.map.width}" height="${d.map.height}" alt="${d.map.alt}">
          ${groups.map((g, i) => {
            const { x, y } = pos(g);
            const site = g.items[0].location.site.split(/[,.(]/)[0].trim();
            const approx = g.items.some((a) => a.location.approximate);
            return html`
              <button type="button" class="map-marker ${approx ? 'approx' : ''}" style="left:${x}%;top:${y}%" aria-expanded="false" aria-controls="pop-${i}" data-marker="${i}" aria-label="${site}: ${g.items.length} exhibit${g.items.length > 1 ? 's' : ''}">
                ${g.items.length > 1 ? html`<span class="count" aria-hidden="true">${g.items.length}</span>` : ''}
              </button>
              <span class="map-label ${x > 70 ? 'left' : ''}" style="left:${x}%;top:${y}%" aria-hidden="true">${site}</span>
              <div class="map-popover" id="pop-${i}" hidden style="left:${Math.min(x, 62)}%;top:calc(${y}% + 26px)">
                <h2>${site}</h2>
                <p class="small muted" style="margin:0 0 8px">${fmtCoord(g.lat, g.lon)}${approx ? ' (approximate)' : ''}</p>
                <ul>${g.items.map((a) => html`<li><a href="#/exhibit/${a.id}">${a.name} →</a></li>`)}</ul>
              </div>`;
          })}
        </div>
        <figcaption class="map-caption">
          ${d.map.note} Map: ${d.map.credit}. ${sourceLink(data, d.map.sourceId, 'Source')}
          <span class="map-legend"><span><i class="legend-dot"></i> Published coordinates</span><span><i class="legend-dot approx"></i> Approximate or landing-site position (see exhibit)</span></span>
        </figcaption>
      </figure>
      <div>
        <h2 class="visually-hidden">Exhibits on ${d.name}</h2>
        <div class="explore-list">${arts.map(card)}</div>
        <p class="small muted" style="margin-top:16px">${key === 'moon' ? 'Next: Mars, where robots explored without astronauts.' : 'Next: the Moon, where astronauts set up the experiments themselves.'} <a href="#/explore/${key === 'moon' ? 'mars' : 'moon'}">Go to ${key === 'moon' ? 'Mars' : 'the Moon'} →</a></p>
      </div>
    </div>`);

  const frame = $('[data-map]', app);
  const map = frame.closest('figure');
  const sites = document.createElement('div');
  sites.className = 'map-sites';
  frame.after(sites);
  $$('.map-popover', frame).forEach(pop => { pop.removeAttribute('style'); sites.appendChild(pop); });
  const closeAll = (except) => $$('[data-marker]', map).forEach((m) => {
    if (m === except) return;
    m.setAttribute('aria-expanded', 'false');
    $(`#${m.getAttribute('aria-controls')}`, map).hidden = true;
  });
  const onClick = (e) => {
    const m = e.target.closest('[data-marker]');
    if (m) {
      const open = m.getAttribute('aria-expanded') !== 'true';
      closeAll(m);
      m.setAttribute('aria-expanded', String(open));
      const pop = $(`#${m.getAttribute('aria-controls')}`, map);
      pop.hidden = !open;
      if (open) $('a', pop).focus();
    } else if (!e.target.closest('.map-popover')) closeAll();
  };
  const onKey = (e) => {
    if (e.key !== 'Escape') return;
    const active = $('[data-marker][aria-expanded="true"]', map);
    closeAll();
    if (active) active.focus();
  };
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  teardown.push(() => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); });
}

// ------------------------------------------------------------------ Exhibit
function renderExhibit(a, section) {
  const d = destOf(a);
  const idx = data.artifacts.indexOf(a);
  const next = data.artifacts[(idx + 1) % data.artifacts.length];
  const steps = [
    ['inspect', 'Inspect'],
    ['story', 'Story'],
    ...(a.activity ? [['activity', 'Experiment']] : []),
    ['quiz', 'Questions'],
  ];
  store.visit(a.id);
  set(html`
    <header class="container exhibit-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/explore/${a.destination}">${d.name}</a> › ${a.location.site.split(/[,.(]/)[0]}</nav>
      <p class="eyebrow"><span class="pill dest-${a.destination}">${d.name}</span> ${a.mission}</p>
      <h1>${a.name}</h1>
      <p class="kind">${a.kind}</p>
      <div class="row"><span class="pill status-${a.status.type}">${a.status.label}</span><span class="small muted">Status checked ${fmtDate(a.status.verified)}</span></div>
    </header>
    <nav class="stepper" aria-label="Exhibit sections">
      <ol>${steps.map(([id, label], i) => html`<li><a href="#/exhibit/${a.id}/${id}" data-step="${id}"><span class="num">${i + 1}</span>${label}</a></li>`)}</ol>
    </nav>

    <section class="ex-section" id="inspect" aria-labelledby="h-inspect">
      <div class="container">
        <h2 id="h-inspect"><span class="step-label">Step 1</span> Inspect the ${a.viewer.type === 'model' ? 'machine in 3D' : 'scene'}</h2>
        <div class="mission-brief"><p class="eyebrow">Your investigation</p><p>${a.briefing}</p><span class="small muted">Choose a part, follow the sequence, then use the story to explain your answer.</span></div>
        <div data-inspector></div>
        <div class="section-next"><a class="btn" href="#/exhibit/${a.id}/story">Next: follow the story →</a></div>
      </div>
    </section>

    <section class="ex-section" id="story" aria-labelledby="h-story">
      <div class="container">
        <h2 id="h-story"><span class="step-label">Step 2</span> Follow the story</h2>
        <div class="story-layout">
          <div>
            <p class="narration-note">${raw(icons.pen)}<span><strong>Creative narration.</strong> These chapters are written in the voice of ${a.story.narrator}, based on the documented history in the sources listed under each chapter. The machine never said these words; the facts come from the evidence.</span></p>
            <aside class="fact-spotlight"><p class="eyebrow">Did you know?</p><p><strong>${a.facts[a.spotlightFact].label}:</strong> ${a.facts[a.spotlightFact].value}</p>${evidence(data,[a.facts[a.spotlightFact].sourceId])}</aside>
            <div class="chapters">
              ${a.story.chapters.map((c, i) => html`<article class="chapter" ${raw(i === a.story.chapters.length - 1 ? 'data-last-chapter' : '')}>
                <h3>${c.question}</h3>
                ${c.body.map((p) => html`<p class="voice">${p}</p>`)}
                ${c.link ? html`<p><a class="btn btn-sm" href="#/exhibit/${c.link.artifact}">${c.link.label} →</a></p>` : ''}
                ${c.image ? figure(data, c.image, { cls: data.images[c.image].w / data.images[c.image].h > 2.5 ? 'wide' : '', sizes: '(min-width: 1000px) 55vw, 100vw' }) : ''}
                ${evidence(data, c.sourceIds)}
              </article>`)}
            </div>
          </div>
          ${missionFile(a)}
        </div>
        <div class="section-next">
          <button class="btn" type="button" data-story-done aria-pressed="${!!store.get().story[a.id]}">${store.get().story[a.id] ? 'Story saved ✓' : 'I’ve read the story'}</button>
          <a class="btn btn-primary" href="#/exhibit/${a.id}/${a.activity ? 'activity' : 'quiz'}">Next: ${a.activity ? 'try the experiment' : 'check what you learned'} →</a>
        </div>
      </div>
    </section>

    ${a.activity ? html`<section class="ex-section" id="activity" aria-labelledby="h-activity">
      <div class="container">
        <h2 id="h-activity"><span class="step-label">Step 3</span> Experiment: ${data.activities[a.activity].title}</h2>
        <p class="lede">${data.activities[a.activity].intro}</p>
        <div data-activity></div>
        <div class="section-next"><a class="btn" href="#/exhibit/${a.id}/quiz">Next: check what you learned →</a></div>
      </div>
    </section>` : ''}

    <section class="ex-section" id="quiz" aria-labelledby="h-quiz">
      <div class="container">
        <h2 id="h-quiz"><span class="step-label">Step ${steps.length}</span> Check what you learned</h2>
        <p class="muted">Questions about what you just explored. Your first answer is saved in <a href="#/log">your explorer log</a> on this device.</p>
        <div data-quiz></div>
        <div class="completion-card" data-completion aria-live="polite"></div>
        <div class="next-up">
          <div><p class="eyebrow" style="margin:0">Next exhibit</p><strong class="badge-big" style="font-size:1.2rem">${next.name}</strong> <span class="muted">· ${destOf(next).name}</span></div>
          <a class="btn btn-primary" href="#/exhibit/${next.id}">Continue →</a>
        </div>
      </div>
    </section>`);

  const insp = createInspector($('[data-inspector]', app), a, data);
  teardown.push(() => insp.destroy());
  if (a.activity === 'laser-ranging') {
    const act = createLaserActivity($('[data-activity]', app), data);
    teardown.push(() => act.destroy());
  }
  if (a.activity === 'solar-budget') {
    const act = createSolarActivity($('[data-activity]', app), data);
    teardown.push(() => act.destroy());
  }
  $('[data-story-done]', app).addEventListener('click', e => {
    store.storyRead(a.id);
    e.currentTarget.textContent = 'Story saved ✓';
    e.currentTarget.setAttribute('aria-pressed', 'true');
    announce('Story saved. Ready for your next step.');
  });
  createQuiz($('[data-quiz]', app), a, data);
  const updateCompletion = () => {
    const p = progressFor(a);
    const remaining = Object.entries(p.steps).find(([,done])=>done === false)?.[0];
    const names = {inspect:'inspect a part',story:'read and save the story',activity:'solve the experiment',quiz:'answer the questions'};
    $('[data-completion]', app).innerHTML = String(p.done === p.total
      ? html`<span class="stamp">${d.name} · exhibit complete ✓</span><p>You investigated ${a.name}. Your stamp is saved in <a href="#/log">your explorer log</a>.</p>`
      : html`<strong>${p.done} of ${p.total} steps complete</strong><p>Keep your investigation going.</p><a class="btn btn-sm" href="#/exhibit/${a.id}/${remaining}">Next: ${names[remaining]} →</a>`);
  };
  updateCompletion();
  teardown.push(store.onChange(updateCompletion));
  watchSections(a);
  if (section) setTimeout(() => scrollToSection(section, true), 60);
}

function missionFile(a) {
  const loc = a.location;
  return html`<aside class="mission-file" aria-label="Mission file">
    <div>
      <h3>Status</h3>
      <div class="status-card ${a.status.type === 'active' ? 'active' : ''}">
        <strong>${a.status.label}</strong>
        <p>${a.status.detail}</p>
        ${evidence(data, a.status.sourceIds, 'Evidence:')}
      </div>
    </div>
    <div class="location-box">
      <h3>Location</h3>
      <p style="margin:0 0 4px">${loc.site}</p>
      <p class="coords" style="margin:0 0 4px">${loc.approximate ? '≈ ' : ''}${fmtCoord(loc.lat, loc.lon)}</p>
      <p class="small muted" style="margin:0">${loc.convention}. ${sourceLink(data, loc.sourceId, 'Source')}</p>
    </div>
    <div>
      <h3>Key facts</h3>
      <dl class="facts">${a.facts.map((f) => html`<div><dt>${f.label}</dt><dd>${f.value} <span class="evidence">${sourceLink(data, f.sourceId, '[src]')}</span></dd></div>`)}</dl>
    </div>
    <div>
      <h3>Timeline</h3>
      <ol class="timeline">${a.timeline.map((t) => html`<li><time>${t.date}</time>${t.text}</li>`)}</ol>
      ${evidence(data, a.timeline.map((t) => t.sourceId), 'Timeline sources:')}
    </div>
  </aside>`;
}

function watchSections(a) {
  const links = $$('[data-step]', app);
  const p = progressFor(a);
  links.forEach((l) => l.classList.toggle('done', !!p.steps[l.dataset.step]));
  const off = store.onChange(() => {
    const q = progressFor(a);
    links.forEach((l) => l.classList.toggle('done', !!q.steps[l.dataset.step]));
  });
  teardown.push(off);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.dataset.step === en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('.ex-section', app).forEach((s) => io.observe(s));
  teardown.push(() => io.disconnect());
}

function scrollToSection(id, instant = false) {
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = !instant && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  const h = $('h2', el);
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

// ------------------------------------------------------------------ Explorer log
function renderLog() {
  const arts = data.artifacts;
  const prog = arts.map((a) => [a, progressFor(a)]);
  const complete = prog.filter(([, p]) => p.done === p.total).length;
  set(html`
    <div class="container page-head">
      <p class="eyebrow"><span class="dot"></span>Saved on this device only</p>
      <h1>My explorer log</h1>
      <p class="lede">${complete === arts.length ? 'Every exhibit complete. You are an official SpaceLegacy curator!' : `${complete} of ${arts.length} exhibits complete. Keep exploring to fill your log.`}</p>
    </div>
    <div class="container" style="padding-bottom:64px">
      <div class="log-grid">
        ${prog.map(([a, p]) => html`<article class="card">
          <p class="eyebrow"><span class="pill dest-${a.destination}">${destOf(a).name}</span></p>
          <h2 style="font-size:1.35rem"><a href="#/exhibit/${a.id}">${a.name}</a></h2>
          <div class="meter" role="img" aria-label="${p.done} of ${p.total} steps done"><span style="width:${(p.done / p.total) * 100}%"></span></div>
          <p class="small muted">${p.done} of ${p.total} steps done</p>
          ${p.done === p.total ? html`<p class="stamp">${destOf(a).name} · exhibit complete ✓</p>` : html`<p><a class="btn btn-sm" href="#/exhibit/${a.id}/${Object.entries(p.steps).find(([,done])=>done === false)[0]}">Resume investigation →</a></p>`}
          <ul class="checklist">
            <li class="${p.steps.inspect ? 'done' : ''}">Inspected parts: ${p.parts} of ${p.totalParts}</li>
            <li class="${p.steps.story ? 'done' : ''}">Read the story</li>
            ${p.steps.activity !== null ? html`<li class="${p.steps.activity ? 'done' : ''}">${data.activities[a.activity].logLabel}</li>` : ''}
            <li class="${p.steps.quiz ? 'done' : ''}">Questions: ${p.correct} of ${p.totalQ} right on first try${p.answered < p.totalQ ? ` (${p.totalQ - p.answered} unanswered)` : ''}</li>
          </ul>
        </article>`)}
      </div>
      <p style="margin-top:24px"><button type="button" class="btn btn-ghost btn-sm" data-reset>Clear my progress</button></p>
    </div>`);
  $('[data-reset]', app).addEventListener('click', () => {
    if (window.confirm('Clear all saved progress on this device?')) { store.reset(); renderLog(); announce('Progress cleared'); }
  });
}

// ------------------------------------------------------------------ Sources
function renderSources() {
  const used = {};
  const note = (id, where) => { if (!id) return; (used[id] ||= new Set()).add(where); };
  data.artifacts.forEach((a) => {
    const w = a.name;
    a.status.sourceIds.forEach((id) => note(id, w));
    note(a.location.sourceId, w);
    a.facts.forEach((f) => note(f.sourceId, w));
    a.timeline.forEach((t) => note(t.sourceId, w));
    a.hotspots.forEach((h) => (h.sourceIds || []).forEach((id) => note(id, w)));
    a.story.chapters.forEach((c) => (c.sourceIds || []).forEach((id) => note(id, w)));
    a.quiz.forEach((q) => note(q.sourceId, w));
    if (a.viewer.modelSourceId) note(a.viewer.modelSourceId, `${w} (3D model)`);
  });
  Object.values(data.images).forEach((im) => note(im.sourceId, 'Photo'));
  Object.values(data.destinations).forEach((d) => note(d.map.sourceId, `${d.name} map`));
  note('nssdc-moon-facts', 'Laser activity'); note('nist-c', 'Laser activity'); note('nasa-llr-keeps-giving', 'Laser activity');
  note('challenge-brief', 'Project scope'); note('nasa-media-guidelines', 'Image and model use');

  const groups = [
    ['fact', 'Facts and mission history'],
    ['image', 'Photos and maps'],
    ['model', '3D models'],
    ['brief', 'Challenge'],
    ['terms', 'Usage terms'],
  ];
  set(html`
    <div class="container page-head">
      <p class="eyebrow"><span class="dot"></span>Validity</p>
      <h1>Sources &amp; credits</h1>
      <p class="lede">Every fact, photo and model in SpaceLegacy is traceable. Facts were last checked against these pages on ${fmtDate(data.lastVerified)}.</p>
      <p>Download the evidence: <a href="data-and-sources/facts.csv">facts.csv</a> (every fact with a word-for-word quote from its NASA source) · <a href="data-and-sources/catalog_moon_hardware.csv">Moon hardware catalogue</a> · <a href="data-and-sources/catalog_mars_hardware.csv">Mars hardware catalogue</a> · <a href="data-and-sources/data.json">data.json</a> · <a href="data-and-sources/README.md">about the data pack</a></p>
    </div>
    <div class="container prose" style="padding-bottom:64px">
      <h2>Asset register</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Asset</th><th>Creator / source</th><th>Terms</th><th>What we changed</th></tr></thead>
        <tbody>
          <tr><td>Apollo Lunar Module (assets/models/apollo-lm-full.glb)</td><td>NASA 3D Resources ${sourceLink(data, 'nasa3d-lm', 'link')}</td><td>NASA media guidelines: generally not subject to U.S. copyright; credit NASA; no endorsement</td><td>Re-compressed (Draco geometry, WebP textures). No shape changes.</td></tr>
          <tr><td>Descent stage only (assets/models/apollo-lm-descent-stage.glb)</td><td>Derived from the NASA model above</td><td>As above</td><td>Deleted the 85 parts whose centres sit above the descent stage (the ascent stage) and the model's static animation tracks. Nothing added.</td></tr>
          <tr><td>Mars Exploration Rover (assets/models/mer-rover.glb)</td><td>NASA 3D Resources, labelled Opportunity (MER-B) ${sourceLink(data, 'nasa3d-mer-b', 'link')}</td><td>As above</td><td>Re-compressed only. Used for Spirit because the rovers were identical twins.</td></tr>
          <tr><td>InSight lander (assets/models/insight-lander.glb)</td><td>NASA 3D Resources, "InSight Cruise Lander (arm deployed)" ${sourceLink(data, 'nasa3d-insight', 'link')}</td><td>As above</td><td>Re-compressed; textures resized to 1024 px WebP.</td></tr>
          <tr><td>Photos (assets/img/*.webp)</td><td>NASA Image and Video Library; credits shown with each photo</td><td>As above; JPL images credited NASA/JPL-Caltech (and Cornell where listed)</td><td>Resized and converted to WebP. No other edits.</td></tr>
          <tr><td>Moon map (assets/maps/moon-lroc-color.webp)</td><td>NASA's Scientific Visualization Studio, CGI Moon Kit ${sourceLink(data, 'svs-cgi-moon-kit', 'link')}</td><td>NASA SVS: credit NASA's Scientific Visualization Studio</td><td>Converted to WebP.</td></tr>
          <tr><td>Mars map (assets/maps/mars-viking-0-360.webp)</td><td>NASA 3D Resources "Mars" texture (NASA/JPL-Caltech; Viking images processed at USGS) ${sourceLink(data, 'nasa3d-mars-texture', 'link')}</td><td>As above</td><td>Shifted by 180° of longitude so both Mars sites sit mid-map; converted to WebP.</td></tr>
          <tr><td>3D viewer (vendor/model-viewer)</td><td>Google &lt;model-viewer&gt; 4.3.1</td><td>Apache License 2.0 (included)</td><td>None.</td></tr>
          <tr><td>Draco decoder (vendor/draco)</td><td>Google Draco 1.5.6</td><td>Apache License 2.0</td><td>None.</td></tr>
          <tr><td>Fonts (vendor/fonts)</td><td>Space Grotesk; IBM Plex Sans and Mono (via Fontsource)</td><td>SIL Open Font License 1.1 (included)</td><td>Latin subsets only.</td></tr>
        </tbody>
      </table></div>
      <p class="small muted">SpaceLegacy does not use the NASA insignia or logotype and is not endorsed by NASA. ${sourceLink(data, 'nasa-media-guidelines', 'NASA media usage guidelines')}</p>

      ${groups.map(([kind, title]) => html`
        <h2>${title}</h2>
        <ul class="source-list">
          ${Object.entries(data.sources).filter(([, s]) => s.kind === kind).map(([id, s]) => html`<li id="src-${id}">
            <a href="${s.url}" target="_blank" rel="noopener">${s.title}<span class="visually-hidden"> (opens in a new tab)</span> ↗</a>
            <div class="pub">${s.publisher}</div>
            ${used[id] ? html`<div class="used">Used in: ${[...used[id]].join(', ')}</div>` : ''}
          </li>`)}
        </ul>`)}

      <h2>Known limitations</h2>
      <ul>
        <li>The Lunar Module model is NASA's generic Apollo LM, not a scan of Eagle itself. Part markers on it are our placements and approximate.</li>
        <li>The rover model is simplified and low-detail; not every instrument is modeled.</li>
        <li>The InSight model shows its instruments on the deck, as during cruise. On Mars they were moved to the ground.</li>
        <li>Spirit's map marker shows its landing site; its final position at Troy is a few kilometres away in the Columbia Hills. InSight's marker uses NASA's rounded landing-site coordinates.</li>
        <li>Text was drafted with AI assistance and checked by hand against the sources above. Please report anything that does not match a source.</li>
      </ul>
    </div>`);
}

// ------------------------------------------------------------------ Classroom
function renderClassroom() {
  set(html`
    <div class="container page-head">
      <p class="eyebrow"><span class="dot"></span>Ages 10–16 · 45 minutes · pairs</p>
      <h1>Classroom mission: Left behind, still useful</h1>
      <p class="lede">Students investigate one machine left on the Moon or Mars, connect its engineering to a discovery, and use a real formula to measure the Earth–Moon distance.</p>
      <p class="btn-row no-print"><button type="button" class="btn btn-sm" data-print>Print this plan and worksheet</button></p>
    </div>
    <div class="container prose" style="padding-bottom:64px">
      <h2>Learning goals</h2>
      <p>By the end, students can:</p>
      <ol>
        <li>Explain what one piece of hardware was built to do, how one of its parts worked, and what scientists learned from it.</li>
        <li>Use <span class="mono">t = 2d ÷ c</span> (and its rearrangement <span class="mono">d = c × t ÷ 2</span>) with correct units.</li>
        <li>Tell the difference between equipment that is still used (the Apollo 11 reflector), equipment that finished its job, and equipment that lost contact.</li>
      </ol>
      <p class="small muted">Possible curriculum links, for teachers to confirm against their own standards: scale and properties of objects in the solar system; how light reflects; how scientists use indirect evidence (quake waves, light travel time) to study places no one can reach.</p>

      <h2>Lesson flow</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Time</th><th>Activity</th><th>What students do</th></tr></thead>
        <tbody>
          <tr><td>5 min</td><td>Hook</td><td>Show the home page "Where are they now?" board. Ask: why would anyone leave expensive equipment behind? Is it trash, a monument or a tool?</td></tr>
          <tr><td>15 min</td><td>Investigate</td><td>Each pair picks one exhibit. They inspect at least three parts and run "How it worked". They fill in rows 1–3 of the worksheet.</td></tr>
          <tr><td>10 min</td><td>Experiment</td><td>Everyone opens the laser activity on the Apollo 11 reflector exhibit, fires the laser at closest and farthest distance, and solves one "measure like a scientist" challenge.</td></tr>
          <tr><td>10 min</td><td>Share</td><td>Pairs give a 60-second talk: "Our machine was built to…, this part worked by…, so we learned…".</td></tr>
          <tr><td>5 min</td><td>Exit check</td><td>Students answer their exhibit's three questions. The explorer log shows their first-try score.</td></tr>
        </tbody>
      </table></div>

      <h2>Worksheet</h2>
      <div class="card worksheet">
        <ol>
          <li>Our exhibit: ____________________ &nbsp; World: Moon / Mars &nbsp; Status today: ____________________</li>
          <li>One part we inspected: ____________________. What it did: ________________________________________</li>
          <li>Why it was designed that way: ________________________________________</li>
          <li>One discovery it made possible: ________________________________________</li>
          <li>Laser ranging: at the average distance of 384,400 km, the round trip takes ______ s. Show your working: t = 2 × ______ m ÷ 299,792,458 m/s</li>
          <li>A pulse returns after 2.60 s. The Moon was ______ km away. (Hint: d = c × t ÷ 2, then ÷ 1,000.)</li>
          <li>Why do we divide by 2? ________________________________________</li>
          <li>Which exhibit is still used by scientists today, and why does it not need power? ________________________________________</li>
        </ol>
      </div>
      <details class="no-print"><summary>Answer key</summary>
        <ul>
          <li>Q5: t = 2 × 384,400,000 m ÷ 299,792,458 m/s ≈ 2.564 s.</li>
          <li>Q6: d = 299,792,458 × 2.60 ÷ 2 ≈ 389,730,195 m ≈ 389,730 km.</li>
          <li>Q7: The light travels to the Moon and back, so the measured time covers twice the distance.</li>
          <li>Q8: The Apollo 11 laser retroreflector. It is made of glass corner cubes that only reflect light, so it has no electronics to fail.</li>
        </ul>
      </details>

      <h2>Discussion questions</h2>
      <ul>
        <li>Spirit's broken wheel led to a discovery. Can you think of a time a mistake helped you learn something?</li>
        <li>InSight never moved, yet it measured the core of Mars. How can you study something you cannot see or touch?</li>
        <li>Should we protect old landing sites like Tranquility Base? Who should decide?</li>
      </ul>
      <p class="small muted">Intended outcomes only: this plan has not yet been tested in a classroom, and we have not measured learning gains.</p>
    </div>`);
  $('[data-print]', app).addEventListener('click', () => window.print());
}

// ------------------------------------------------------------------ About
function renderAbout() {
  set(html`
    <div class="container page-head">
      <p class="eyebrow"><span class="dot"></span>NASA Space Apps Challenge 2026</p>
      <h1>About SpaceLegacy</h1>
      <p class="lede">Our answer to "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars".</p>
    </div>
    <div class="container prose" style="padding-bottom:64px">
      <h2>The idea</h2>
      <p>SpaceLegacy is an interactive 3D museum for school-age space fans. Visitors choose the Moon or Mars, discover a real machine left there, turn it around in 3D, tap its parts to learn what each one did, follow its story through five questions, try a science activity and check what they learned. Its central idea: equipment can stay far from Earth while the knowledge it made possible keeps inspiring new explorers.</p>
      <p>${sourceLink(data, 'challenge-brief', 'Read the official challenge brief')}</p>

      <h2>How it answers the brief</h2>
      <ul>
        <li><strong>Story-driven, for school-age learners:</strong> each machine narrates its own history in clearly labelled creative chapters, written in plain English for ages 10–16.</li>
        <li><strong>Shows how missions operated, not just facts:</strong> labelled hotspots and "How it worked" sequences link each part's engineering to a scientific result.</li>
        <li><strong>Current level of functionality:</strong> every exhibit separates finished, silent and still-working hardware, with the date we last checked.</li>
        <li><strong>Accuracy:</strong> facts are tied to NASA pages; 3D models and photos are NASA's own, credited, with our changes documented.</li>
        <li><strong>Accessible format:</strong> works on phones, tablets and desktops; every 3D interaction has a button, keyboard or text equivalent; respects reduced-motion settings.</li>
      </ul>

      <h2>Judging criteria (provisional)</h2>
      <p class="small muted">The 2026 Judging and Awards Guide is scheduled for 13 November 2026. Until then we map our work to the areas Space Apps has commonly used. We will re-check this section when the guide is published.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Area</th><th>Evidence in SpaceLegacy</th></tr></thead>
        <tbody>
          <tr><td>Impact</td><td>Designed for ages 10–16 and classrooms. Learners explain one machine's engineering-to-science link and compute the Earth–Moon distance. Includes a 45-minute lesson with worksheet. (Intended outcomes; not yet measured.)</td></tr>
          <tr><td>Creativity</td><td>Combines component-level 3D exploration, first-person storytelling and a hands-on calculation in one journey; a "then vs. now" toggle shows exactly what remains of Eagle.</td></tr>
          <tr><td>Validity</td><td>Every fact links to its source; a full asset register lists creators, terms and changes. Status labels distinguish completion, loss of contact and continuing use. The physics model states its simplifications.</td></tr>
          <tr><td>Relevance</td><td>Focuses entirely on NASA hardware left on the Moon and Mars and the science it enabled.</td></tr>
          <tr><td>Presentation</td><td>Fast, offline-capable static site with a guided tour that demonstrates one complete learning journey in about two minutes.</td></tr>
        </tbody>
      </table></div>

      <h2>How it compares with existing NASA experiences</h2>
      <p>3D space exploration on the web is not new. We built on NASA's work and focused on a gap.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Experience</th><th>What it does well</th><th>What SpaceLegacy adds</th></tr></thead>
        <tbody>
          <tr><td><a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener">NASA's Eyes on the Solar System ↗</a></td><td>Real-time 3D views of planets and spacecraft across the solar system.</td><td>A narrow focus on hardware left behind, part-by-part explanations and a story for each machine.</td></tr>
          <tr><td><a href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noopener">NASA 3D Resources ↗</a></td><td>A large library of free 3D models and textures.</td><td>Turns three of those models into guided exhibits with labelled parts, history and current status.</td></tr>
          <tr><td><a href="https://spaceplace.nasa.gov/" target="_blank" rel="noopener">NASA Space Place ↗</a></td><td>Kid-friendly articles, games and activities on many space topics.</td><td>An end-to-end journey about specific left-behind artifacts, ending with a quantitative activity and quiz.</td></tr>
        </tbody>
      </table></div>

      <h2>What is built, and what is next</h2>
      <ul>
        <li>Built: four exhibits (three with NASA 3D models, one photo inspector), Moon and Mars explorers on NASA maps, story chapters, laser-ranging and Spirit energy activities, quizzes, explorer log, guided tour, classroom plan, source register.</li>
        <li>Next: more exhibits (for example the Apollo 15 Lunar Roving Vehicle, Viking landers and Opportunity), an InSight science activity, translations, and testing with real classrooms.</li>
      </ul>

      <h2>Honesty notes</h2>
      <ul>
        <li>No user feedback, testimonials, partnerships or usage statistics are claimed. Benefits described are intended outcomes.</li>
        <li>Text was drafted with AI assistance and checked against the linked sources. Information is attributed to its source pages, not to NASA as an endorsement.</li>
        <li>The laser activity is a calculation. The site does not communicate with any real telescope or spacecraft.</li>
      </ul>
    </div>`);
}

function renderNotFound() {
  set(html`<div class="container page-head" style="padding-bottom:80px"><h1>Lost in space</h1><p>We could not find that page. <a href="#/">Return to the museum entrance</a>.</p></div>`);
}

function fmtDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
