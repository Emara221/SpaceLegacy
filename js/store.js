// Optional progress saved on this device only (localStorage). Everything works without it.
const KEY = 'spacelegacy.progress.v1';

const empty = () => ({ visited: {}, parts: {}, story: {}, how: {}, activity: {}, quiz: {} });

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const safe = empty();
    for (const key of Object.keys(safe)) {
      if (parsed?.[key] && typeof parsed[key] === 'object' && !Array.isArray(parsed[key])) safe[key] = parsed[key];
    }
    for (const [id, parts] of Object.entries(safe.parts)) if (!Array.isArray(parts)) delete safe.parts[id];
    for (const [id, quiz] of Object.entries(safe.quiz)) if (!quiz || typeof quiz !== 'object' || Array.isArray(quiz)) delete safe.quiz[id];
    return safe;
  } catch {
    return empty();
  }
}

let state = load();
const listeners = new Set();

function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  visit(id) { if (!state.visited[id]) { state.visited[id] = Date.now(); save(); } },
  part(id, partId) {
    const list = state.parts[id] || (state.parts[id] = []);
    if (!list.includes(partId)) { list.push(partId); save(); }
  },
  storyRead(id) { if (!state.story[id]) { state.story[id] = true; save(); } },
  howDone(id) { if (!state.how[id]) { state.how[id] = true; save(); } },
  activity(key, value = true) { state.activity[key] = value; save(); },
  answer(id, qid, correct) {
    const q = state.quiz[id] || (state.quiz[id] = {});
    q[qid] = correct;
    save();
  },
  reset() { state = empty(); save(); },
};

/** Summary numbers for one artifact. */
export function progressFor(artifact) {
  const s = state;
  const parts = (s.parts[artifact.id] || []).filter((p) => artifact.hotspots.some((h) => h.id === p)).length;
  const quiz = s.quiz[artifact.id] || {};
  const answers = artifact.quiz.filter(q => typeof quiz[q.id] === 'boolean');
  const answered = answers.length;
  const correct = answers.filter(q => quiz[q.id]).length;
  const steps = {
    inspect: parts > 0,
    story: !!s.story[artifact.id],
    activity: artifact.activity ? !!s.activity[artifact.activity] : null,
    quiz: answered >= artifact.quiz.length,
  };
  const required = Object.values(steps).filter((v) => v !== null);
  const done = required.filter(Boolean).length;
  return { parts, totalParts: artifact.hotspots.length, answered, correct, totalQ: artifact.quiz.length, steps, done, total: required.length };
}
