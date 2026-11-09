# Review — 7 November 2026

Baseline: walked home → Moon map → Eagle inspector and story → reflector experiment → questions → log in the app's Chromium browser, at 1280 × 850 and 375 × 812.

The strongest existing feature is the connection between a real NASA part, its engineering purpose and sourced history. Keep the four exhibits, labelled creative narration, honest status and local assets.

Priority issues:

- The main start action silently chooses the Moon. Give both worlds an equally clear entrance and distinct visual identities.
- Long exhibit pages need a small investigation question and visible next steps. Reading is currently inferred from scrolling past a chapter; give readers an explicit completion control.
- Quiz completion incorrectly says “Exhibit complete!” even when other steps are missing. Use actual progress, award a stamp only when all required steps are done, and link to the next unfinished step.
- Mars has no experiment. Reuse the verified Spirit energy figures (facts.csv SP-18) for a clearly labelled numerical model with a prediction and feedback.
- Map popups are clipped by the map frame, especially on phones. Keep the map accurate and place the selected site's card below it.
- Some buttons are 38–40 px. Enlarge them, preserve keyboard equivalents, and stop optional motion when hidden or reduced motion is requested.
- The skip link changes the hash to an unknown route. Preserve its focus behavior without replacing the current page.

No new exhibits or model conversions are needed for this pass. Those would add scientific and performance validation work without fixing the central learning journey.

## Status (finished 8 November 2026)

All items above are implemented and checked in the browser at 1280 px and 375 px:

- Home page has separate "Explore the Moon" and "Explore Mars" entrances; Moon pages use a cool grey theme and Mars pages a warm rust theme.
- Each exhibit opens with an investigation question; the story has an explicit "I've read the story" button; quizzes no longer claim the exhibit is complete; a completion stamp appears only when every step is done, and the explorer log offers "Resume investigation" links to the next unfinished step.
- Spirit has an energy experiment based on NASA's 700 vs 89 Wh/day figures (facts.csv SP-18), labelled as an educational model.
- The map site card now sits below the map instead of being clipped; all buttons are at least 44 px; auto-rotate stops when the tab is hidden; the skip link no longer changes the route.
- Checks: `tools/validate.py` 0 errors, `verify_evidence.py` 176/176, no console errors, no horizontal overflow on any page at 375 px, guided tour passes all 8 steps.
