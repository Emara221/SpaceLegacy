# SpaceLegacy

**Left behind. Still inspiring.**

An interactive 3D museum of NASA equipment left on the Moon and Mars, built for the
NASA Space Apps Challenge 2026 challenge *"Abandoned but not Forgotten: Storytelling about
NASA's Discarded Equipment on the Moon and Mars"*. Designed for learners aged 10–16,
families and classrooms.

Visitors **choose a world → discover an artifact → inspect it in 3D → follow its story →
try a science activity → answer a few questions**.

| Exhibit | World | Viewer | Status (checked 7 Nov 2026) |
| --- | --- | --- | --- |
| Eagle's Descent Stage (Apollo 11) | Moon | NASA 3D model, "1969 vs. today" toggle | Left in place, nothing operating |
| Laser Ranging Retroreflector (Apollo 11) | Moon | Photo inspector + laser-ranging activity | Still used by observatories |
| Spirit Rover (MER-A) | Mars | NASA 3D model (simplified) + energy activity | Silent since 22 Mar 2010; mission ended 25 May 2011 |
| InSight Lander | Mars | NASA 3D model | Silent since 15 Dec 2022 |

## Run it locally

It is a static site with no build step and no runtime network access. Any static web
server works; it cannot be opened as a `file://` page because the browser blocks loading
the content file and 3D models that way.

```bash
cd SpaceLegacy
python -m http.server 5180
```

Then open <http://localhost:5180>. (Node users: `npx serve -l 5180` works too.)

To publish, upload the folder (without `_workbench/`) to any static host such as GitHub
Pages, Netlify or Cloudflare Pages.

## Check it

```bash
python tools/validate.py
python data-and-sources/tools/verify_evidence.py
```

Checks every content reference (images, sources, hotspots, "How it worked" steps, quiz
answers), that all model, image and vendor files exist, the physics constants in the laser
activity, and that the code loads no remote runtime assets.

## Project layout

```
index.html              page shell (header, footer, live region)
content/artifacts.json  ALL exhibit content: facts, stories, hotspots, quizzes, images, sources
js/app.js               hash router and pages (home, explore, exhibit, log, sources, classroom, about)
js/viewer.js            3D / photo inspector: hotspots, camera controls, "How it worked", fallbacks
js/laser.js             lunar laser ranging activity (t = 2d / c)
js/solar.js             Spirit energy comparison and challenge
js/quiz.js, store.js    questions with feedback; progress saved in localStorage (optional)
js/tour.js              2-minute guided tour of one full journey
css/                    styles and self-hosted fonts
assets/                 optimized NASA models (GLB), photos and maps (WebP)
vendor/                 <model-viewer> 4.3.1, Draco decoder, fonts (with licenses)
tools/                  validate.py, build-assets.mjs, make-descent-stage.mjs, glbinfo.py
docs/                   SOURCES.md (asset register), SUBMISSION.md (summary + demo script)
_workbench/             raw downloads and build tools (git-ignored, not needed to run the site)
```

### Adding an exhibit

Add an object to `artifacts` in `content/artifacts.json` (copy an existing one), add its
images to `images` and its sources to `sources`, then run `python tools/validate.py`.
For 3D models, put the GLB in `assets/models/`; open any exhibit with `?pick=1` in the URL
(for example `http://localhost:5180/?pick=1#/exhibit/insight-lander`) and click the model to
read out hotspot positions. `tools/glbinfo.py <model.glb>` lists named parts and their
bounding boxes.

### Rebuilding assets

`tools/build-assets.mjs` re-downloads NASA originals and regenerates the WebP images,
maps and posters; `tools/make-descent-stage.mjs` regenerates the descent-stage-only Lunar
Module. Both need Node 18+ with `sharp` and `@gltf-transform/cli` installed in
`_workbench/nodetools/`.

## Accessibility

Keyboard operable throughout (model rotation with arrow keys, numbered parts reachable
with Tab), visible focus, a text list of every 3D part, optional part labels, a "Describe this view in words"
panel, screen-reader announcements, reduced-motion support (no auto-play or animation),
no audio, and a NASA-render fallback when WebGL or a model is unavailable.

## Credits and terms

Photos, 3D models and maps are NASA's, credited where they appear and in
[docs/SOURCES.md](docs/SOURCES.md), and used under the
[NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
SpaceLegacy is an independent student project and is not endorsed by NASA. Text was
drafted with AI assistance and checked against the cited sources.

## Visit progress

The visitor can explicitly mark a story as read, solve the exhibit activity, and answer the questions. The explorer log offers a resume link and awards a completion stamp only after all applicable steps. Existing saved progress is retained. The Spirit activity compares NASA’s reported 700 and 89 Wh per Martian day as a simplified energy model; it does not estimate actual dust coverage.
