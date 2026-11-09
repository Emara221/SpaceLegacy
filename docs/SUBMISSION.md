# SpaceLegacy: submission notes

Challenge: **Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars**
(NASA Space Apps Challenge 2026). Brief: <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>
(the URL in our original planning prompt now redirects to a "Page Not Found"; this is the current official page).

## 150-word project summary

SpaceLegacy is an interactive 3D museum that turns NASA equipment left on the Moon and Mars
into stories for students aged 10–16. Visitors choose a world on a NASA map, then meet four
artifacts: Apollo 11's Eagle descent stage, its laser retroreflector,
the Spirit rover and the InSight lander. Genuine NASA 3D models can be rotated, zoomed and
explored through numbered parts that explain what each component did, why it was designed
that way and what it helped us learn. A "How it worked" sequence walks through each mission
step by step, and a toggle shows that only Eagle's descent stage remains. Each machine
narrates its history in clearly labelled creative chapters backed by linked NASA sources,
with an honest status: silent, ended or still in use. Students can time a laser pulse to
the Moon using t = 2d/c or compare Spirit’s energy output, then answer short questions. A classroom plan is included.

## 90-second demonstration script (one complete learning journey)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:10 | Home page hero, then scroll to "Where are they now?" | "Machines we sent to the Moon and Mars are still out there. SpaceLegacy is a museum of them, and it's honest about which are silent and which still do science." |
| 0:10–0:20 | Click **Explore the Moon →** → Moon map; open the Tranquility Base marker | "Choose a world. Markers sit at published landing coordinates on NASA's own map. Tranquility Base holds two exhibits." |
| 0:20–0:45 | **Eagle's Descent Stage**: drag to rotate, tap **4 Commemorative plaque** (photo appears), click **July 1969 (complete)** then **What remains today**, press **Start** in "How it worked" twice | "This is NASA's 3D model. Every number is a real part: what it is, why it was designed that way, what it helped us learn. Toggle 1969 and today: only the descent stage stayed, because it was the launch pad home. 'How it worked' replays the landing part by part." |
| 0:45–0:55 | Click **Story** in the step bar; point to the "Creative narration" note, an evidence link and the status card | "Each machine tells its story through five questions. The voice is creative and labelled that way; every fact links to its NASA source." |
| 0:55–1:15 | Open **Laser Ranging Retroreflector** (bay hotspot link or Moon page) → tap **1 Laser reflector** → **Experiment**: click **Closest**, **Fire laser** (2.42 s), type the challenge answer, **Check** | "This reflector still works: no power, just 100 glass corner cubes. Fire a laser: t equals 2d over c. Now reverse it like an observatory: 2.42 seconds means the Moon was about 362,749 km away." |
| 1:15–1:25 | **Questions**: answer one, show the explanation; open **My log** | "Three questions with explanations, and progress saved on this device." |
| 1:25–1:30 | Mars map with Spirit and InSight | "Next: Mars, where Spirit's broken wheel found ancient hot springs. Left behind. Still inspiring." |

Shortcut for a live demo: **Take the 2-minute tour** on the home page walks the same path automatically.

## How SpaceLegacy relates to existing NASA learning experiences

3D space exploration on the web is not new; SpaceLegacy builds on NASA's work rather than replacing it.

| Experience | Strength | SpaceLegacy's specific contribution |
| --- | --- | --- |
| [NASA's Eyes on the Solar System](https://eyes.nasa.gov/apps/solar-system/) | Real-time 3D views of planets and spacecraft across the solar system | A narrow focus on hardware left behind, with part-level explanations and one story per machine |
| [NASA 3D Resources](https://science.nasa.gov/3d-resources/) | Large free library of NASA models and textures | Turns three of those models into guided exhibits with labelled parts, history and current status |
| [NASA Space Place](https://spaceplace.nasa.gov/) | Kid-friendly articles, games and activities across many topics | An end-to-end journey about specific artifacts, ending in a quantitative activity and quiz |

## Judging criteria (provisional)

The 2026 Judging and Awards Guide is scheduled for publication on 13 November 2026 (per the
Space Apps participant FAQ). Until then we map to the commonly used areas; the global awards
page lists award categories such as Best Use of Science and Best Use of Storytelling.

- **Impact**: ages 10–16 and classrooms; a 45-minute lesson with worksheet and answer key. Benefits are *intended outcomes*; nothing has been measured or tested with users yet.
- **Creativity**: part-level 3D exploration + labelled first-person narration + hands-on physics in one journey; the "1969 vs. today" toggle.
- **Validity**: 35 cited sources (all links checked, HTTP 200, on 7 Nov 2026); asset register with creators, terms and modifications; statuses distinguish completion, loss of contact and continuing use; the physics model lists its simplifications.
- **Relevance**: entirely about NASA hardware left on the Moon and Mars and the science it enabled.
- **Presentation**: fast static site that works offline, guided tour, 90-second script above.

## What is implemented

- Moon and Mars explorers on NASA global maps (projections verified against known features), markers at published coordinates, approximate positions flagged.
- Four exhibits from one content schema (`content/artifacts.json`): Eagle's descent stage (NASA 3D model, 7 parts, then/now toggle), Apollo 11 retroreflector (annotated NASA photo, 5 parts), Spirit (NASA MER model, 6 parts), InSight (NASA model, 7 parts).
- 3D viewer: drag/touch rotate, zoom, reset, optional auto-rotate, rotate/zoom buttons, keyboard rotation, numbered hotspot buttons with camera fly-to, "How it worked" step sequences with optional auto-play, loading progress, poster, error and no-WebGL fallbacks, "describe this view" text equivalent. Lazy-loaded, one canvas per page.
- Story: five standard questions per exhibit in labelled creative narration, evidence links per chapter, mission file (status with check date, location and coordinate convention, sourced facts, timeline).
- Lunar laser ranging activity (t = 2d/c) with real-time or slow-motion pulse, presets, live worked math, reverse "measure like a scientist" challenge, corner-cube diagram, simplifications box.
- Spirit energy activity compares NASA-reported 700 and 89 Wh per Martian day, with a labelled simplified model and percentage challenge.
- Quizzes (3 per exhibit) with explanatory feedback; explorer log in localStorage; guided tour; classroom plan; sources page and asset register; about page.
- Accessibility: skip link, landmarks, visible focus, labelled controls, live announcements, reduced-motion support, no audio.

## What was verified (7 November 2026)

- `python tools/validate.py`: 0 errors (all content references, files, vendor libraries, physics constants; no remote runtime assets).
- All 35 source URLs return HTTP 200.
- In Chrome (app browser pane and headless Chrome screenshots): home, Moon and Mars explorers, all four exhibits, log, sources, classroom and about pages render; all three GLB models load with Draco decoding from local files; hotspots sit on the intended parts (checked visually for Eagle, Spirit, InSight and the photo); selecting a part flies the camera and fills the detail panel; then/now toggle swaps models; "How it worked" runs all steps and records completion; the deep link to a section scrolls and focuses its heading.
- Laser activity: 2.424 s at 363,300 km, 2.564 s at 384,400 km, 2.705 s at 405,500 km; out-of-range input clamps; wrong and right challenge answers give the worked solution; completion is saved.
- Quiz feedback for correct and incorrect answers; first-try results saved; summary updates.
- Missing-model fallback and simulated no-WebGL fallback both show NASA's render plus a message while the parts list keeps working.
- Mobile emulation at 375×812: no horizontal overflow on any page (after fixing the worksheet), 3D stage usable, controls at least 40 px tall, hamburger navigation.
- Automated checks on every page: all images have alt text, all buttons/links have names, no duplicate IDs, one h1 and no skipped heading levels, all inputs labelled.
- Guided tour: all 8 steps navigate to the right page and highlight the right element.

## Not verified / remaining

- Not tested on real phones or tablets, in Safari or Firefox, or with a screen reader (only automated checks and keyboard-focus logic).
- Reduced-motion mode was reviewed in code, not emulated in a browser.
- The laser pulse animation and auto-rotate were not watched end to end in a visible browser window (the pane was hidden during testing); their logic and results were checked.
- No user testing; learning outcomes are intended, not measured.
- Re-check the brief, challenge resources and judging guide when they publish on 13 November 2026.
- Possible next exhibits: Apollo 15 Lunar Roving Vehicle (no NASA 3D model found; would be photo-based), Viking landers (NASA model available), Opportunity.

## Review update (9 November 2026)

The home page now offers both world choices. Each exhibit has an investigation question, a sourced fact highlight, clearer next-step links and explicit story completion. The explorer log offers resume links and stamps for complete exhibits. The Mars and Moon themes differ, map site cards open below the map, and part labels are available on demand. Spirit has a solar-energy comparison and percentage challenge.

Current verification: `python tools/validate.py` reports 0 errors and `python data-and-sources/tools/verify_evidence.py` verifies 176 quotes against 63 snapshots with 0 problems. In the in-app Chromium browser, the Moon site card, Eagle part selection, 1969/today toggle, how-it-worked start, story confirmation, Spirit energy presets (350 Wh and 89 Wh) and challenge feedback, Spirit rotate/zoom/reset, a completed Eagle quiz and its saved log stamp were exercised. At a nominal 375 px viewport the browser reported a 360 px layout width with no horizontal document overflow across home, both maps, four exhibits, log, classroom, sources and about. The original desktop and mobile laser exercise showed 2.564 s at 384,400 km. No console errors were observed during these checks.

All eight guided-tour cards were reached in order and the tour closed normally; visual highlight timing was not independently checked. The missing-model and no-WebGL fallbacks, reduced-motion emulation, full keyboard-only pass, real phone, screen reader, other browsers and actual classroom use remain unverified for this revision. Re-check the official challenge resources and judging guide when they are released; this document does not assert that the 2026 guide is already published.
