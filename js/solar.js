// A numerical energy comparison, not a simulation of Spirit's hardware.
import { html, $, $$, evidence } from './util.js';
import { store } from './store.js';

export const availableEnergy = (reference, percent) => reference * percent / 100;

export function createSolarActivity(root, data) {
  const c = data.activities['solar-budget'];
  const expected = Math.round(c.stormWh / c.normalWh * 100);
  root.innerHTML = String(html`
    <div class="solar-lab grid grid-2">
      <div class="card">
        <p class="eyebrow">Predict → change → explain</p>
        <h3>What happens when energy runs low?</h3>
        <p>${c.prediction}</p>
        <label for="solar-fraction">${c.sliderLabel}</label>
        <input id="solar-fraction" type="range" min="0" max="100" step="any" value="100">
        <div class="presets" role="group" aria-label="Energy presets">
          ${c.presets.map((p,i) => html`<button class="btn btn-sm" type="button" data-energy="${i}" aria-pressed="${i === 0}">${p.label}</button>`)}
        </div>
        <div class="energy-meter" aria-hidden="true"><span data-energy-bar></span></div>
        <output for="solar-fraction" class="energy-result" data-energy-result aria-live="polite"></output>
        <p class="small muted" data-energy-math></p>
      </div>
      <div class="card">
        <h3>Compare with Spirit’s history</h3>
        <p>${c.context}</p>
        ${evidence(data,c.sourceIds)}
        <form data-solar-form>
          <label for="solar-answer">${c.question}</label>
          <div class="num-input">
            <input id="solar-answer" type="number" inputmode="numeric" min="0" max="100" step="1" required aria-describedby="solar-hint">
            <span>%</span><button class="btn btn-primary btn-sm" type="submit">Check prediction</button>
          </div>
          <p id="solar-hint" class="small muted">${c.hint}</p>
          <div data-solar-feedback role="status"></div>
        </form>
      </div>
    </div>
    <div class="callout" style="margin-top:24px"><h3>What this model simplifies</h3><p>${c.modelNote}</p><p>${c.reflection}</p></div>`);
  const range = $('#solar-fraction',root);
  function update(percent) {
    const energy = availableEnergy(c.normalWh,percent);
    range.value = String(percent);
    range.setAttribute('aria-valuetext', `${percent.toFixed(1)} percent, about ${Math.round(energy)} watt-hours`);
    $('[data-energy-result]',root).textContent = `${Math.round(energy)} Wh available`;
    $('[data-energy-math]',root).textContent = `${c.normalWh} Wh × ${(percent/100).toFixed(3)} ≈ ${Math.round(energy)} Wh (${percent.toFixed(1)}% of reference)`;
    $('[data-energy-bar]',root).style.width = `${percent}%`;
    $$('[data-energy]',root).forEach(b => b.setAttribute('aria-pressed',String(Math.abs(c.presets[Number(b.dataset.energy)].percent-percent)<0.01)));
  }
  range.addEventListener('input',()=>update(Number(range.value)));
  $$('[data-energy]',root).forEach(b=>b.addEventListener('click',()=>update(c.presets[Number(b.dataset.energy)].percent)));
  $('[data-solar-form]',root).addEventListener('submit',e=>{
    e.preventDefault();
    const correct = Number($('#solar-answer',root).value) === expected;
    $('[data-solar-feedback]',root).innerHTML = String(html`<p class="feedback ${correct?'ok':'bad'}"><strong>${correct?'You worked it out!':'Try the comparison again.'}</strong> ${c.stormWh} ÷ ${c.normalWh} × 100 ≈ ${expected}%. ${correct?'Energy challenge saved in your explorer log.':'Round to the nearest whole percent, then try again.'}</p>`);
    if(correct) store.activity('solar-budget');
  });
  update(100);
  return {destroy(){}};
}
