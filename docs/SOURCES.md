# SpaceLegacy: source and asset register

Facts last checked against these sources on **2026-11-07**. Every exhibit page links each fact, photo and model to its source; this file collects them in one place.

## Usage terms in brief

- **NASA photos, 3D models and maps**: "generally not subject to copyright in the United States" and usable for educational and informational purposes, including web pages. NASA must be acknowledged as the source, use must not imply NASA endorsement, and the NASA insignia/logotype is not used. Source: [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
- The guidelines also ask that information incorporated through AI tools is not attributed directly to NASA as an endorsement, and encourage marking AI-assisted products. SpaceLegacy states on every page that its text was drafted with AI assistance and checked against the linked sources.
- **JPL images** are credited NASA/JPL-Caltech (plus Cornell where the NASA library lists it).
- **NASA SVS map**: credit "NASA's Scientific Visualization Studio".
- **Software and fonts**: see the asset register below; license files are in `vendor/`.

## Asset register

| Asset (file) | Creator / source | Terms | Modifications |
| --- | --- | --- | --- |
| `assets/models/apollo-lm-full.glb` | NASA 3D Resources, "Apollo Lunar Module" ([GitHub](https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Apollo%20Lunar%20Module)) | NASA media guidelines | Re-compressed with glTF-Transform 4.5.1 (Draco geometry, WebP textures ≤1024 px). Shape unchanged. |
| `assets/models/apollo-lm-descent-stage.glb` | Derived from the NASA model above | NASA media guidelines | Removed the 85 parts whose bounding-box centre is above 2.5 m (the ascent stage) and the static animation tracks, using `tools/make-descent-stage.mjs`. Nothing added or reshaped. |
| `assets/models/mer-rover.glb` | NASA 3D Resources, "Mars Exploration Rover – Opportunity (MER-B)" ([page](https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/)) | NASA media guidelines | Re-compressed only. Used for Spirit because Spirit and Opportunity were identical twins (stated on the exhibit). Low-detail model. |
| `assets/models/insight-lander.glb` | NASA 3D Resources, "InSight Cruise Lander (arm deployed)" ([page](https://science.nasa.gov/3d-resources/insight-cruise-lander/)) | NASA media guidelines | Re-compressed; textures resized to 1024 px WebP. Shows instruments on the deck (cruise configuration), as noted on the exhibit. |
| `assets/posters/*.webp` | NASA's own preview renders of the three models (NASA 3D Resources GitHub) | NASA media guidelines | Resized to 1280 px WebP. Used while loading and as the no-WebGL fallback. |
| `assets/maps/moon-lroc-color.webp` | NASA's Scientific Visualization Studio, CGI Moon Kit, `lroc_color_2k.jpg` ([SVS 4720](https://svs.gsfc.nasa.gov/4720/)); LRO WAC color mosaic | Credit NASA SVS | Converted to WebP. Projection verified by overlaying Copernicus, Tycho and Mare Crisium coordinates. |
| `assets/maps/mars-viking-0-360.webp` | NASA 3D Resources "Mars" texture: NASA/JPL-Caltech, Viking images processed at USGS ([page](https://science.nasa.gov/3d-resources/mars/)) | NASA media guidelines | Shifted 180° in longitude (now 0–360° E) so both Mars sites sit mid-map; converted to WebP. Projection verified with Olympus Mons and Hellas. |
| `assets/img/*.webp` | NASA Image and Video Library (IDs listed below) | NASA media guidelines | Resized (800 px and up to 1600 px) and converted to WebP. No other edits. |
| `vendor/model-viewer/` | Google `<model-viewer>` 4.3.1 (npm `@google/model-viewer`) | Apache License 2.0 (`vendor/model-viewer/LICENSE`) | None. |
| `vendor/draco/` | Google Draco decoder 1.5.6 (gstatic versioned decoders) | Apache License 2.0 | None. |
| `vendor/fonts/` | Space Grotesk; IBM Plex Sans; IBM Plex Mono (via Fontsource 5.3.0) | SIL Open Font License 1.1 (license files included) | Latin subsets only. |

## Photos

| File | NASA ID / credit | Caption used |
| --- | --- | --- |
| `assets/img/a11-eagle-on-moon-*.webp` | [NASA (AS11-40-5927)](https://images.nasa.gov/details/as11-40-5927) | Eagle at Tranquility Base. Aldrin prepares to unload the experiments package from the descent stage's equipment bay. Photo by Neil Armstrong. |
| `assets/img/a11-plaque-*.webp` | [NASA (AS11-40-5899)](https://images.nasa.gov/details/as11-40-5899) | The plaque on the ladder leg of Eagle's descent stage. |
| `assets/img/a11-easep-deployed-*.webp` | [NASA (AS11-40-5948)](https://images.nasa.gov/details/as11-40-5948) | Just after setup: the seismometer in front, the laser reflector beyond it, the flag in the middle and Eagle at far right. Photo by Neil Armstrong. |
| `assets/img/a11-aldrin-carries-easep-*.webp` | [NASA](https://images.nasa.gov/details/6900957) | Aldrin carries the seismometer (left hand) and the laser reflector (right hand) to their setup site. |
| `assets/img/a14-lrrr-closeup-*.webp` | [NASA (AS14-67-9386)](https://images.nasa.gov/details/as14-67-09386) | Close-up of the sister array left by Apollo 14 in February 1971. Like Apollo 11's, it holds 100 corner cubes. |
| `assets/img/mer-artist-concept-*.webp` | [NASA/JPL/Cornell University (PIA04413), artist's concept](https://images.nasa.gov/details/PIA04413) | Artist's concept of a Mars Exploration Rover. Spirit and Opportunity were identical twins. |
| `assets/img/spirit-silica-soil-*.webp` | [NASA/JPL/Cornell (PIA09491)](https://photojournal.jpl.nasa.gov/catalog/PIA09491) | The bright soil Spirit's dragging wheel uncovered in 2007, nicknamed Gertrude Weise. It is about 90% silica. The track is about 20 cm wide. |
| `assets/img/spirit-troy-panorama-*.webp` | [NASA/JPL-Caltech/Cornell University (PIA12203)](https://images.nasa.gov/details/PIA12203) | Spirit's view from Troy, where it became embedded in soft soil in spring 2009. |
| `assets/img/insight-final-selfie-*.webp` | [NASA/JPL-Caltech (PIA25287)](https://images.nasa.gov/details/PIA25287) | InSight's final selfie, 24 April 2022 (sol 1,211). Compare the dust with its first selfie in 2018. |
| `assets/img/insight-seis-shield-*.webp` | [NASA/JPL-Caltech (PIA23177)](https://images.nasa.gov/details/PIA23177) | The wind and thermal shield covering InSight's seismometer on Mars, sol 110 (April 2019). |
| `assets/img/insight-deck-*.webp` | [NASA/JPL-Caltech (PIA22871)](https://images.nasa.gov/details/PIA22871) | InSight's deck on sol 8 (December 2018): the seismometer (copper cover), its gray shield and the black heat probe, before the arm moved them to the ground. |

## All sources

### Facts and mission history

- **Apollo 11 Lunar Module / EASEP** — NASA Space Science Data Coordinated Archive (NSSDCA). <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C> (`nssdc-a11-lm`)
- **Apollo 11 Laser Ranging Retroreflector (experiment 1969-059C-04)** — NASA NSSDCA. <https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04> (`nssdc-a11-lrrr`)
- **The Apollo Experiment That Keeps on Giving** — NASA (2019). <https://www.nasa.gov/missions/apollo/apollo-11/the-apollo-experiment-that-keeps-on-giving/> (`nasa-llr-keeps-giving`)
- **Retroreflectors: From Apollo to Mars** — NASA. <https://www.nasa.gov/image-article/retroreflectors-from-apollo-mars/> (`nasa-retroreflectors-apollo-mars`)
- **At Tranquility Base** — NASA. <https://www.nasa.gov/image-article/tranquility-base/> (`nasa-tranquility-base`)
- **Moon Fact Sheet (perigee, apogee, semimajor axis)** — NASA NSSDCA. <https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html> (`nssdc-moon-facts`)
- **Speed of light in vacuum (exact value, 299,792,458 m/s)** — NIST CODATA. <https://physics.nist.gov/cgi-bin/cuu/Value?c> (`nist-c`)
- **Spirit (MER-A) mission page** — NASA Science. <https://science.nasa.gov/mission/mer-spirit/> (`nasa-mer-spirit`)
- **Mars Exploration Rovers: Spirit and Opportunity** — NASA Science. <https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/> (`nasa-mer-twins`)
- **InSight mission page** — NASA Science. <https://science.nasa.gov/mission/insight/> (`nasa-insight`)
- **InSight science instruments** — NASA Science. <https://science.nasa.gov/mission/insight/science-instruments/> (`nasa-insight-instruments`)
- **InSight science (Instrument Deployment Camera selfies)** — NASA Science. <https://science.nasa.gov/mission/insight/science/> (`nasa-insight-science`)
- **NASA Retires InSight Mars Lander Mission After Years of Science (21 Dec 2022)** — NASA Jet Propulsion Laboratory. <https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/> (`jpl-insight-retired`)
- **NASA's InSight Reveals the Deep Interior of Mars** — NASA Jet Propulsion Laboratory. <https://www.jpl.nasa.gov/news/nasas-insight-reveals-the-deep-interior-of-mars/> (`jpl-insight-interior`)
- **NASA's InSight Places First Instrument on Mars (19 Dec 2018)** — NASA Jet Propulsion Laboratory. <https://www.jpl.nasa.gov/news/nasas-insight-places-first-instrument-on-mars/> (`jpl-insight-first-instrument`)

### Image pages

- **PIA09491: Silica-Rich Soil Found by Spirit** — NASA/JPL Photojournal. <https://photojournal.jpl.nasa.gov/catalog/PIA09491> (`pj-pia09491`)
- **PIA12203: Calypso Panorama of Spirit's View from Troy** — NASA Image and Video Library. <https://images.nasa.gov/details/PIA12203> (`pj-pia12203`)
- **AS11-40-5927: View of Apollo 11 Lunar Module as it rested on lunar surface** — NASA Image and Video Library. <https://images.nasa.gov/details/as11-40-5927> (`img-as11-40-5927`)
- **AS11-40-5899: View of plaque Apollo 11 astronauts left on moon** — NASA Image and Video Library. <https://images.nasa.gov/details/as11-40-5899> (`img-as11-40-5899`)
- **S69-39334: Plaque which Apollo 11 astronauts will leave on the moon (size and mounting)** — NASA Image and Video Library. <https://images.nasa.gov/details/S69-39334> (`img-s69-39334`)
- **AS11-40-5948: Aldrin after deployment of EASEP on surface of moon** — NASA Image and Video Library. <https://images.nasa.gov/details/as11-40-5948> (`img-as11-40-5948`)
- **AS11-40-5951: Aldrin deploys the Passive Seismic Experiment Package** — NASA Image and Video Library. <https://images.nasa.gov/details/as11-40-5951> (`img-as11-40-5951`)
- **6900957: Aldrin carrying the Early Apollo Scientific Experiment Package** — NASA Image and Video Library (Marshall Space Flight Center). <https://images.nasa.gov/details/6900957> (`msfc-6900957`)
- **AS14-67-9386: Laser Ranging Retro Reflector deployed by Apollo 14** — NASA Image and Video Library. <https://images.nasa.gov/details/as14-67-09386> (`img-as14-67-9386`)
- **PIA04413: Artist Concept of Rover on Mars** — NASA Image and Video Library. <https://images.nasa.gov/details/PIA04413> (`img-pia04413`)
- **PIA25287: InSight's Final Selfie** — NASA Image and Video Library. <https://images.nasa.gov/details/PIA25287> (`img-pia25287`)
- **PIA23177: InSight's Seismometer on the Martian Surface** — NASA Image and Video Library. <https://images.nasa.gov/details/PIA23177> (`img-pia23177`)
- **PIA22871: Full View of InSight's Deck and Two Science Instruments** — NASA Image and Video Library. <https://images.nasa.gov/details/PIA22871> (`img-pia22871`)
- **Mars (global texture map)** — NASA 3D Resources (NASA/JPL-Caltech; Viking images processed at USGS). <https://science.nasa.gov/3d-resources/mars/> (`nasa3d-mars-texture`)
- **CGI Moon Kit (lroc_color_2k.jpg)** — NASA's Scientific Visualization Studio. <https://svs.gsfc.nasa.gov/4720/> (`svs-cgi-moon-kit`)

### 3D model pages

- **Apollo Lunar Module (3D model, GLB)** — NASA 3D Resources. <https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Apollo%20Lunar%20Module> (`nasa3d-lm`)
- **Mars Exploration Rover – Opportunity (MER-B) (3D model, GLB)** — NASA 3D Resources. <https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/> (`nasa3d-mer-b`)
- **InSight Cruise Lander, arm deployed (3D model, GLB)** — NASA 3D Resources. <https://science.nasa.gov/3d-resources/insight-cruise-lander/> (`nasa3d-insight`)

### Challenge

- **Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars (challenge brief)** — NASA Space Apps Challenge 2026. <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/> (`challenge-brief`)

### Terms

- **NASA Images and Media Usage Guidelines** — NASA. <https://www.nasa.gov/nasa-brand-center/images-and-media/> (`nasa-media-guidelines`)

## Coordinates and conventions

- **Eagle's Descent Stage**: Tranquility Base, Mare Tranquillitatis (Sea of Tranquility). 0.67416° N, 23.47314° E. Measured from Lunar Reconnaissance Orbiter images (mean Earth/polar axis frame). Source: `nssdc-a11-lm`.
- **Laser Ranging Retroreflector**: Tranquility Base, about 5 m north-northwest of the Apollo 11 seismometer. 0.6735° N, 23.473° E (approximate). Coordinates are for the experiments package site (about 17 m south of the lunar module); the reflector stood about 5 m away from it. Source: `nssdc-a11-lm`.
- **Spirit Rover**: Gusev Crater. Landing site: Columbia Memorial Station. Final spot: Troy, beside Home Plate in the Columbia Hills. 14.5692° S, 175.4729° E (approximate). Marker shows the published landing coordinates (planetocentric, east-positive). Spirit's final spot, Troy, is in the Columbia Hills, which lie about 3 km from the landing site.. Source: `nasa-mer-spirit`.
- **InSight Lander**: Western Elysium Planitia, near Mars' equator. 4.5° N, 135.9° E (approximate). NASA gives the landing site as centered at about 4.5° N, 135.9° E (planetocentric, east-positive). The marker is placed there.. Source: `nasa-insight`.

## Unresolved limitations

- The Lunar Module model is NASA's generic Apollo LM, not a scan of Eagle (LM-5). Hotspots on it were placed by us from model geometry; the scientific equipment bay position follows NASA's caption ("left rear quadrant") and is marked approximate.
- The MER model is low-detail and labelled Opportunity; we use it for its identical twin Spirit. Not every instrument is modeled.
- The InSight model shows the cruise/deck configuration; on Mars, SEIS, its shield and HP3 were on the ground.
- Spirit's map marker uses its landing coordinates; its final position at Troy is in the Columbia Hills, about 3 km away. InSight's marker uses NASA's rounded landing-site centre (4.5° N, 135.9° E).
- No suitable NASA 3D model of the Apollo 11 retroreflector was found, so that exhibit uses an annotated photo.
- The 2026 Space Apps challenge resources and Judging & Awards Guide are scheduled for 13 November 2026; the brief and criteria should be re-checked then.
- No user testing has been done; learning outcomes are intended, not measured.
