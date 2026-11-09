"""Download every source in sources.csv and save its readable text to snapshots/<id>.txt.

Usage (from the data-and-sources folder):
    python tools/snapshot_sources.py            # fetch all sources
    python tools/snapshot_sources.py nssdc-a11-lm jpl-insight-retired   # only some

Pages that need a browser to render (marked fetch=manual) are skipped; their snapshot is kept as-is.
For NASA Image Library entries, the official images-api JSON record (title, date, description) is saved.
"""
import csv
import datetime as dt
import html
import json
import os
import re
import ssl
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = os.path.join(HERE, 'snapshots')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'


def fetch(url):
    """Fetch over verified HTTPS only."""
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en'})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        return r.status, r.read().decode('utf-8', errors='replace')


def html_to_text(raw):
    t = re.sub(r'<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', raw, flags=re.S | re.I)
    t = re.sub(r'<br\s*/?>|</p>|</li>|</h\d>|</div>|</tr>|</dd>|</dt>|</section>|</article>', '\n', t, flags=re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    lines = []
    seen = set()
    for line in t.split('\n'):
        line = re.sub(r'\s+', ' ', line).strip()
        if len(line) < 3 or line in seen:
            continue
        seen.add(line)
        lines.append(line)
    return '\n'.join(lines)


def images_api_text(raw):
    data = json.loads(raw)
    items = data.get('collection', {}).get('items', [])
    if not items:
        return 'NO RECORD FOUND'
    m = items[0]['data'][0]
    keys = ['nasa_id', 'title', 'date_created', 'center', 'photographer', 'secondary_creator', 'description']
    return '\n'.join(f'{k}: {m.get(k)}' for k in keys if m.get(k))


def main(only):
    os.makedirs(SNAP, exist_ok=True)
    with open(os.path.join(HERE, 'sources.csv'), encoding='utf-8', newline='') as f:
        rows = list(csv.DictReader(f))
    now = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    for row in rows:
        sid = row['source_id']
        if only and sid not in only:
            continue
        fetch_url = row.get('fetch_url') or row['url']
        if fetch_url == 'manual':
            print(f'skip   {sid} (manual snapshot)')
            continue
        try:
            status, raw = fetch(fetch_url)
            text = images_api_text(raw) if 'images-api.nasa.gov' in fetch_url else html_to_text(raw)
        except Exception as e:  # keep going; report at the end
            print(f'FAIL   {sid}: {e}')
            continue
        header = (f'Source ID: {sid}\nTitle: {row["title"]}\nPublisher: {row["publisher"]}\n'
                  f'URL: {row["url"]}\nFetched from: {fetch_url}\nRetrieved: {now} (HTTP {status})\n'
                  f'Note: plain-text extract of the public page, kept as evidence for facts.csv. '
                  f'NASA web content is generally not subject to U.S. copyright; see the original page for images and context.\n'
                  + '-' * 78 + '\n')
        with open(os.path.join(SNAP, f'{sid}.txt'), 'w', encoding='utf-8') as out:
            out.write(header + text + '\n')
        print(f'ok     {sid} ({len(text):,} chars)')


if __name__ == '__main__':
    main(set(sys.argv[1:]))
