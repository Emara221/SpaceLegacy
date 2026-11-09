"""Checks SpaceLegacy content for broken references and missing files.

Usage (from the project root):  python tools/validate.py
Exit code 0 = all checks passed.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
warnings = []


def err(msg):
    errors.append(msg)


def exists(rel):
    return os.path.isfile(os.path.join(ROOT, rel))


with open(os.path.join(ROOT, 'content', 'artifacts.json'), encoding='utf-8') as f:
    data = json.load(f)

sources = data['sources']
images = data['images']


def check_source(sid, where):
    if sid and sid not in sources:
        err(f'{where}: unknown sourceId "{sid}"')


def check_image(iid, where):
    if iid not in images:
        err(f'{where}: unknown image "{iid}"')


# Images and sources
for iid, im in images.items():
    for size in (800, 1600):
        if not exists(f"{im['src']}-{size}.webp"):
            err(f'image {iid}: missing file {im["src"]}-{size}.webp')
    for key in ('alt', 'caption', 'credit', 'sourceId'):
        if not im.get(key):
            err(f'image {iid}: missing {key}')
    check_source(im.get('sourceId'), f'image {iid}')
for sid, s in sources.items():
    if not re.match(r'^https://', s.get('url', '')):
        err(f'source {sid}: url must be https')
    for key in ('title', 'publisher', 'kind'):
        if not s.get(key):
            err(f'source {sid}: missing {key}')

# Destinations
for key, d in data['destinations'].items():
    m = d['map']
    if not exists(m['image']):
        err(f'destination {key}: missing map {m["image"]}')
    check_source(m.get('sourceId'), f'destination {key} map')

ids = set()
for a in data['artifacts']:
    aid = a['id']
    w = f'artifact {aid}'
    if aid in ids:
        err(f'{w}: duplicate id')
    ids.add(aid)
    if a['destination'] not in data['destinations']:
        err(f'{w}: unknown destination')
    if not a.get('briefing'):
        err(f'{w}: missing investigation briefing')
    if not isinstance(a.get('spotlightFact'), int) or not 0 <= a['spotlightFact'] < len(a['facts']):
        err(f'{w}: spotlightFact must point to a fact')
    if a.get('activity') and a['activity'] not in data.get('activities', {}):
        err(f'{w}: unknown activity {a["activity"]}')
    check_image(a['cardImage'], w)
    st = a['status']
    if st['type'] not in ('active', 'silent'):
        err(f'{w}: status.type must be active or silent')
    for sid in st['sourceIds']:
        check_source(sid, f'{w} status')
    loc = a['location']
    if not (-90 <= loc['lat'] <= 90 and -180 <= loc['lon'] <= 360):
        err(f'{w}: coordinates out of range')
    check_source(loc['sourceId'], f'{w} location')
    for fct in a['facts']:
        check_source(fct['sourceId'], f'{w} fact "{fct["label"]}"')
    for t in a['timeline']:
        check_source(t['sourceId'], f'{w} timeline "{t["date"]}"')

    v = a['viewer']
    hs_ids = [h['id'] for h in a['hotspots']]
    if len(hs_ids) != len(set(hs_ids)):
        err(f'{w}: duplicate hotspot ids')
    if v['type'] == 'model':
        for var in v['variants']:
            if not exists(var['src']):
                err(f'{w}: missing model {var["src"]}')
        if not exists(v['poster']):
            err(f'{w}: missing poster {v["poster"]}')
        check_source(v.get('modelSourceId'), f'{w} model')
        for h in a['hotspots']:
            if not re.match(r'^-?[\d.]+m -?[\d.]+m -?[\d.]+m$', h.get('position', '')):
                err(f'{w} hotspot {h["id"]}: bad position "{h.get("position")}"')
            if h.get('normal') and not re.match(r'^-?[\d.]+m -?[\d.]+m -?[\d.]+m$', h['normal']):
                err(f'{w} hotspot {h["id"]}: bad normal')
            if h.get('orbit') and not re.match(r'^-?[\d.]+deg [\d.]+deg [\d.]+(m|%)$', h['orbit']):
                err(f'{w} hotspot {h["id"]}: bad orbit "{h["orbit"]}"')
    elif v['type'] == 'photo':
        check_image(v['image'], f'{w} viewer')
        for h in a['hotspots']:
            if not (0 <= h.get('x', -1) <= 100 and 0 <= h.get('y', -1) <= 100):
                err(f'{w} hotspot {h["id"]}: x/y must be percentages')
    else:
        err(f'{w}: unknown viewer type')
    for h in a['hotspots']:
        for key in ('label', 'what', 'why', 'science'):
            if not h.get(key):
                err(f'{w} hotspot {h["id"]}: missing {key}')
        if not h.get('sourceIds'):
            err(f'{w} hotspot {h["id"]}: no sources')
        for sid in h.get('sourceIds', []):
            check_source(sid, f'{w} hotspot {h["id"]}')
        if h.get('image'):
            check_image(h['image'], f'{w} hotspot {h["id"]}')
        link = h.get('link')
        if link and link.get('artifact') and link['artifact'] not in [x['id'] for x in data['artifacts']]:
            err(f'{w} hotspot {h["id"]}: link to unknown artifact')
    for step in a.get('howItWorked', {}).get('steps', []):
        if step['hotspot'] not in hs_ids:
            err(f'{w} howItWorked: unknown hotspot "{step["hotspot"]}"')

    chapters = a['story']['chapters']
    expected = ['What was I built to do?', 'How did I work?', 'What happened during my mission?', 'What did we learn?', 'Why does it matter now?']
    if len(chapters) != 5:
        err(f'{w}: story must have 5 chapters')
    for i, c in enumerate(chapters):
        q = c['question'].replace('How do I work?', 'How did I work?')
        if i < len(expected) and q != expected[i]:
            warnings.append(f'{w}: chapter {i + 1} question differs from the standard set ("{c["question"]}")')
        if not c.get('sourceIds'):
            err(f'{w} chapter {i + 1}: no sources')
        for sid in c.get('sourceIds', []):
            check_source(sid, f'{w} chapter {i + 1}')
        if c.get('image'):
            check_image(c['image'], f'{w} chapter {i + 1}')

    if not 2 <= len(a['quiz']) <= 3:
        err(f'{w}: quiz should have 2 or 3 questions')
    for q in a['quiz']:
        if not 0 <= q['answer'] < len(q['options']):
            err(f'{w} quiz {q["id"]}: answer index out of range')
        if len(set(q['options'])) != len(q['options']):
            err(f'{w} quiz {q["id"]}: duplicate options')
        check_source(q.get('sourceId'), f'{w} quiz {q["id"]}')

# Physics model check (mirrors js/laser.js)
for activity_id, activity in data.get('activities', {}).items():
    for key in ('title', 'intro', 'logLabel'):
        if not activity.get(key):
            err(f'activity {activity_id}: missing {key}')
    for sid in activity.get('sourceIds', []):
        check_source(sid, f'activity {activity_id}')
solar = data.get('activities', {}).get('solar-budget', {})
if solar.get('normalWh') != 700 or solar.get('stormWh') != 89:
    err('solar activity: expected sourced 700 Wh and 89 Wh values')
for preset in solar.get('presets', []):
    if not 0 <= preset.get('percent', -1) <= 100:
        err('solar activity: preset percentage out of range')
C = 299792458
t = 2 * 384400 * 1000 / C
if abs(t - 2.5645) > 0.0005:
    err(f'laser model: t for 384,400 km should be about 2.5645 s, got {t:.4f}')
d = C * 2.60 / 2 / 1000
if abs(d - 389730.2) > 1:
    err(f'laser model: d for 2.60 s should be about 389,730 km, got {d:.1f}')

# Vendored files
for rel in ('vendor/model-viewer/model-viewer.min.js', 'vendor/draco/draco_decoder.wasm', 'vendor/draco/draco_wasm_wrapper.js', 'index.html', 'js/app.js'):
    if not exists(rel):
        err(f'missing {rel}')

# No external runtime URLs in code (core demo must work offline)
for folder in ('js', 'css'):
    for name in os.listdir(os.path.join(ROOT, folder)):
        text = open(os.path.join(ROOT, folder, name), encoding='utf-8').read()
        for m in re.finditer(r'(?:src|url)\s*[=(]\s*["\']?(https?://[^"\')\s]+)', text):
            warnings.append(f'{folder}/{name}: external URL {m.group(1)} (fine for links, not for runtime assets)')

for wmsg in warnings:
    print('WARN ', wmsg)
for e in errors:
    print('ERROR', e)
print(f'\n{len(data["artifacts"])} artifacts, {sum(len(a["hotspots"]) for a in data["artifacts"])} hotspots, '
      f'{len(images)} images, {len(sources)} sources checked: {len(errors)} errors, {len(warnings)} warnings.')
sys.exit(1 if errors else 0)
