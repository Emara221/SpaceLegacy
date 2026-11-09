# SpaceLegacy data and sources pack

Every fact used by the SpaceLegacy website, plus extra catalogues of NASA hardware on the Moon
and Mars, each tied to an authoritative source **and a word-for-word quote from that source**.
Checked on **7 November 2026**.

## What's inside

| File | Contents |
| --- | --- |
| `facts.csv` | 134 facts (the 4 exhibits, the laser activity constants, usage terms). Columns: `fact_id, artifact, topic, claim, value, source_id, evidence, used_on_website`. `evidence` is copied verbatim from the source. |
| `catalog_moon_hardware.csv` | **Extra:** all 5 successful Surveyor landers and all 6 Apollo landing sites: hardware left, landing time (UTC), region, coordinates, end/status, each with source + quote. |
| `catalog_mars_hardware.csv` | **Extra:** every NASA Mars lander, rover and helicopter (Viking 1 & 2, Pathfinder/Sojourner, Spirit, Opportunity, Phoenix, Curiosity, InSight, Perseverance, Ingenuity): landing, site, coordinates, status (ended or active), each with source + quote. |
| `lunar_laser_ranging_derived.csv` | Values computed for the laser activity (t = 2d/c), with the facts they come from. |
| `media.csv` | Every photo, 3D model and map used on the site, with credit and source. |
| `sources.csv` | All 63 sources: title, publisher, URL, authority type, and whether the website uses it. |
| `snapshots/` | Plain-text copy of each source page as retrieved on 7 Nov 2026, so the quotes can be checked even if a page changes or goes offline. |
| `data.json` | Everything above in one JSON file for apps and scripts. |
| `tools/verify_evidence.py` | Proves each fact: checks that every `evidence` quote appears in its source snapshot. |
| `tools/snapshot_sources.py` | Re-downloads all sources (verified HTTPS only) to refresh the snapshots. |

## Prove it yourself

```bash
python tools/verify_evidence.py
```

Result on 7 Nov 2026: **176 evidence quotes verified against 63 source snapshots; 0 problems.**
To re-check against the live pages: `python tools/verify_evidence.py --live` (needs internet).

## Source quality

Sources are NASA primary records wherever possible:

- **NSSDCA** (NASA Space Science Data Coordinated Archive, Goddard): mission records with landing times and coordinates measured from Lunar Reconnaissance Orbiter images.
- **NASA Science mission pages** and **NASA/JPL news releases**: mission dates, status and results.
- **NASA Image and Video Library** records (official captions) for every photo.
- **NASA 3D Resources** and **NASA's Scientific Visualization Studio** for models and maps.
- One non-NASA source: **NIST** (U.S. government standards body) for the exact speed of light.

## Things to know

- **Coordinates** are planetocentric latitude and east longitude (0–360°). Where a source gives west longitude, the `coordinate_note` column says so and `lon_east` is converted (east = 360 − west).
- **Sources that disagree** are recorded, not hidden: Viking 1's end date (11 Nov 1982 on NASA's page vs 13 Nov 1982 in NSSDCA), Viking 2's end date (12 vs 11 April 1980) and Phoenix's touchdown time (23:38:38 UT vs 23:53:44 UT). See the `note` column.
- **The Apollo 11 plaque:** NSSDCA transcribes it as "on the Moon"; the engraving itself (photo AS11-40-5899) reads "upon the Moon", which is what the website quotes (fact A11-09).
- **InSight's coordinates** are NASA's rounded landing-site centre; **Spirit's** are its landing site (it ended about 3 km away, in the Columbia Hills).
- **Status** is as of 7 Nov 2026: Curiosity and Perseverance were active; the Apollo 11, 14 and 15 retroreflectors are still used for laser ranging.
- **The challenge brief** page needs a browser to display, so its snapshot was copied from the rendered page.
- **Snapshots** hold text from public NASA/U.S. government pages (generally not subject to U.S. copyright) and are kept only as evidence. Use the original pages for images and full context.
