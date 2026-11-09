# Prompt: review and improve SpaceLegacy (NASA Space Apps 2026)

You are a senior frontend engineer, 3D/web graphics specialist and educational UX designer. Review and improve an existing, working website so it has the strongest possible chance in the NASA Space Apps Challenge 2026. Make the changes, test them, and report. Do not stop at a plan or suggestions.

## 1. The project

**SpaceLegacy: "Left behind. Still inspiring."** An interactive 3D museum of NASA equipment left on the Moon and Mars, for school-age learners (designed for ages 10–16), families and classrooms.

- **Challenge:** "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars." Current brief: https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/ (a saved copy is in `data-and-sources/snapshots/challenge-brief.txt`). The brief asks for an engaging, story-driven educational tool about hardware left on the Moon and Mars that explains what it is, why it was sent, and the science it made possible. It stresses narrative, showing how missions operated, accessibility, and accuracy.
- **Hackathon:** 14–15 November 2026. The challenge resources and the Judging & Awards Guide publish on 13 November; check them if they're available. Commonly used judging areas are impact, creativity, validity, relevance and presentation, and there is a "Best Use of Storytelling" award.
- **User journey (keep this intact):** choose Moon or Mars → discover an artifact → inspect it in 3D → follow its story → try a science activity → answer a few questions.

### Current exhibits

| Exhibit | World | Viewer | Status shown |
| --- | --- | --- | --- |
| Eagle's Descent Stage (Apollo 11) | Moon | NASA 3D model, 7 hotspots, "1969 / today" toggle (descent-stage-only model) | Left in place, nothing operating |
| Laser Ranging Retroreflector (Apollo 11) | Moon | Annotated NASA photo, 5 hotspots, plus the laser-ranging activity (t = 2d/c) | Still used by observatories |
| Spirit Rover (MER-A) | Mars | NASA MER model (simplified, labelled Opportunity, its identical twin), 6 hotspots | Silent since 22 Mar 2010; mission ended 25 May 2011 |
| InSight Lander | Mars | NASA model, 7 hotspots using the model's named parts | Silent since 15 Dec 2022 |

Other pages: home, Moon/Mars explorer maps (NASA global mosaics with markers at published coordinates), explorer log (progress saved in localStorage), sources & credits, a 45-minute classroom plan, about/judging page, and a 2-minute guided tour.

## 2. Codebase (read before changing)

- **No build step:** a static site (HTML, CSS, vanilla ES modules). Run it with `python -m http.server 5180` from `D:\SpaceLegacy` and open http://localhost:5180. It must keep working offline with no runtime calls to remote servers, and stay deployable to GitHub Pages or Netlify as plain files.
- `content/artifacts.json`: **all** content (exhibits, facts, hotspots with 3D positions and camera orbits, "How it worked" steps, story chapters, quizzes, images, sources). Keep content separate from code.
- `js/app.js` (router and pages), `js/viewer.js` (3D/photo inspector), `js/laser.js` (activity), `js/quiz.js`, `js/store.js`, `js/tour.js`, `js/util.js`; `css/styles.css` (design tokens at the top).
- `vendor/`: Google `<model-viewer>` 4.3.1, the Draco decoder (loaded locally) and self-hosted fonts. `assets/models/*.glb`: optimized NASA models. `assets/img`, `assets/maps`, `assets/posters`: WebP files.
- `tools/validate.py` checks content integrity; it must report 0 errors. `tools/glbinfo.py` lists model parts and bounds. Add `?pick=1` to an exhibit URL and click the model to read hotspot coordinates. `tools/make-descent-stage.mjs` and `tools/build-assets.mjs` rebuild assets.
- `data-and-sources/`: the evidence pack. `facts.csv` holds every fact with a verbatim quote from its NASA source; `python data-and-sources/tools/verify_evidence.py` must report 0 problems. Catalogues of all NASA Moon and Mars surface hardware are in `catalog_moon_hardware.csv` and `catalog_mars_hardware.csv`; use them if you add exhibits or map markers.
- `_workbench/` holds raw downloads, portable Node (`_workbench/node/...`) and glTF-Transform/sharp (`_workbench/nodetools`). It is git-ignored. Store new downloads and caches on the D: drive, never on C:.
- Docs: `README.md`, `docs/SOURCES.md`, `docs/SUBMISSION.md` (summary, 90-second demo script, verification log).

## 3. Non-negotiable rules

1. **Accuracy first.** Every new fact needs an authoritative source, NASA first. Add it to `content/artifacts.json` `sources` and, for the evidence pack, add a row to `data-and-sources/facts.csv` with a verbatim quote, then refresh the snapshot. Never invent quotes, dates, statistics, final messages, user feedback, testimonials or partnerships.
2. **Honest status.** Keep distinguishing mission completion, loss of contact and continuing use. Never imply a whole spacecraft remains when only part does.
3. **Honest 3D.** Use genuine NASA models (https://science.nasa.gov/3d-resources/ and https://github.com/nasa/NASA-3D-Resources). Label any reconstruction or schematic as such. Never present generic primitives as real hardware. Keep the "markers approximate" labels where true.
4. **Creative narration stays labelled** as creative and based on documented history.
5. **NASA media rules:** no NASA insignia or logotype, no implied endorsement, credit NASA, and keep the AI-assistance note.
6. **Accessibility:** keyboard operable, visible focus, text equivalents for every 3D interaction, reduced-motion support, audio optional and off by default, readable contrast, touch targets of about 44 px or more, and no horizontal scroll at 375 px.
7. **Performance:** one 3D canvas per screen, lazy-load heavy assets, keep model files small (Draco/WebP), and keep the home page fast.
8. Don't break the core journey, the guided tour, saved progress or the validators.

## 4. What to improve (use judgement; prioritise what moves the judges most)

Start by running the site and walking the full journey on desktop and at 375 px. Write a short critique (what's confusing, dull, inaccurate or broken), then improve. Ideas to consider:

**Friendlier for 10–16-year-olds**
- Warmer microcopy, a short "mission briefing" intro, clearer next-step prompts, and celebratory but restrained feedback (badges or stamps in the explorer log when an exhibit is completed).
- A "Did you know?" fact per exhibit, glossary tooltips for jargon (seismometer, descent stage, sol, corner cube), and a reading-level pass on all text.
- Make the "How it worked" sequence feel like a short guided animation (camera moves plus captions), while keeping manual controls.

**Distinct Moon and Mars experiences**
- Give each world its own identity: a cool lunar grey/ivory theme versus a warm Martian rust theme (accents, backgrounds, subtle textures), different ambient copy, and fitting map styling.
- Upgrade the destination explorers: zoom or pan the map, "you are here"-style site cards, and optional illustrative extra markers from the hardware catalogues (other Apollo sites, Surveyor, Viking, Pathfinder, Opportunity, Phoenix, Curiosity, Perseverance, Ingenuity), clearly marked "not yet an exhibit". Consider a rotatable 3D globe of the Moon/Mars using the existing NASA maps as textures, only if it stays accurate (planetocentric coordinates; markers placed from the CSV) and performant.

**Better 3D**
- Tune lighting, exposure, environment and shadows per model; set good default framings; add a subtle ground plane or regolith-coloured backdrop per world, labelled as illustrative.
- Hotspot polish: short labels on hover/focus, leader lines or highlighted parts if feasible, and a "show all labels" toggle.
- InSight: optionally show where SEIS, the shield and HP3 ended up on the ground (a schematic overlay, labelled).
- Spirit: replace or supplement the low-poly MER model only with a genuine NASA asset. NASA offers "Mars Exploration Rover – Spirit and Opportunity" as a .blend; convert it to GLB with Blender only if you can do so faithfully and keep it small, and record the change in `docs/SOURCES.md`.
- Consider new exhibits with real NASA models, such as the Viking Lander (NASA GLB available) or the Apollo 15 Lunar Roving Vehicle (photo-based if no NASA model). Use the same schema, verified facts and quiz.

**Science activities**
- Add one small activity for a Mars exhibit, for example InSight "time a marsquake" (wave arrival-time difference → distance, as a clearly labelled educational model) or Spirit "solar power vs. dust" (using the sourced 700 vs. 89 Wh/day figures). State every simplification.

**Presentation for judges**
- A tighter home page story, a polished demo path, an optional "presenter mode" (large text, auto-advancing tour), social and preview metadata, and an updated `docs/SUBMISSION.md` demo script.
- Re-check the about/judging page against the official guide if it's published.

## 5. Verification (required before you finish)

- `python tools/validate.py`: 0 errors. `python data-and-sources/tools/verify_evidence.py`: 0 problems; add evidence rows for any new facts.
- In a real browser: every page, every exhibit, model loading, rotate/zoom/reset, hotspot selection and camera fly-to, the 1969/today toggle, "How it worked", the laser activity maths (2.564 s at 384,400 km), quizzes, the explorer log, the guided tour, and the WebGL/missing-model fallbacks.
- 375 px mobile and keyboard-only passes; check for horizontal overflow; console free of errors.
- Report what you changed, what you verified (with evidence), and what remains untested. Update `docs/SUBMISSION.md` and `README.md`.

Begin by running the site and reading `content/artifacts.json`, `js/viewer.js` and `docs/SUBMISSION.md`. Then critique, implement the highest-impact improvements, and verify.
