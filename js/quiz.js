// Short end-of-exhibit questions with explanatory feedback.
import { html, $, $$, announce, sourceLink } from './util.js';
import { store } from './store.js';

export function createQuiz(root, artifact, data) {
  const saved = store.get().quiz[artifact.id] || {};
  root.innerHTML = String(html`
    <div class="quiz">
      ${artifact.quiz.map((q, i) => html`
        <form class="q-card" data-q="${q.id}">
          <fieldset>
            <legend><span class="qn">Q${i + 1}</span>${q.q}</legend>
            ${shuffleOrder(q, artifact.id).map((oi) => html`
              <label class="option"><input type="radio" name="${artifact.id}-${q.id}" value="${oi}" required> <span>${q.options[oi]}</span></label>`)}
          </fieldset>
          <div class="btn-row"><button type="submit" class="btn btn-sm btn-primary">Check answer</button></div>
          <div data-fb aria-live="polite"></div>
        </form>`)}
      <p class="quiz-summary" data-summary aria-live="polite"></p>
    </div>`);

  function grade(form, q, chosen, quiet = false) {
    const correct = chosen === q.answer;
    $$('.option', form).forEach((lab) => {
      const input = $('input', lab);
      const val = Number(input.value);
      lab.classList.toggle('correct', val === q.answer);
      lab.classList.toggle('wrong', val === chosen && !correct);
      if (val === chosen) input.checked = true;
    });
    $('[data-fb]', form).innerHTML = String(html`<div class="feedback ${correct ? 'ok' : 'bad'}" role="status">
      <strong>${correct ? 'Correct.' : `Not quite. The answer is: ${q.options[q.answer]}.`}</strong> ${q.explain} ${q.sourceId ? sourceLink(data, q.sourceId, 'Evidence') : ''}
    </div>`);
    if (!quiet) {
      store.answer(artifact.id, q.id, correct);
      announce(correct ? 'Correct.' : 'Not quite.');
    }
    summary();
  }

  function summary() {
    const res = store.get().quiz[artifact.id] || {};
    const answered = Object.keys(res).length;
    const right = Object.values(res).filter(Boolean).length;
    $('[data-summary]', root).textContent = answered
      ? `${right} of ${artifact.quiz.length} correct on first try${answered < artifact.quiz.length ? ` · ${artifact.quiz.length - answered} to go` : '. Questions complete! Check your remaining steps below.'}`
      : '';
  }

  artifact.quiz.forEach((q) => {
    const form = $(`[data-q="${q.id}"]`, root);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const picked = $('input:checked', form);
      if (!picked) return;
      const first = !(q.id in (store.get().quiz[artifact.id] || {}));
      const chosen = Number(picked.value);
      // Record only the first attempt, but always show feedback.
      if (first) grade(form, q, chosen);
      else grade(form, q, chosen, true);
    });
    if (q.id in saved) {
      // Show previous result without re-recording.
      const chosen = saved[q.id] ? q.answer : -1;
      if (chosen >= 0) grade(form, q, chosen, true);
      else $('[data-fb]', form).innerHTML = '<p class="small muted">Your first attempt is saved. Try again to review the explanation.</p>';
    }
  });
  summary();
}

// Stable per-question option order so the right answer is not always first.
function shuffleOrder(q, salt) {
  const idx = q.options.map((_, i) => i);
  let h = 0;
  for (const ch of salt + q.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}
