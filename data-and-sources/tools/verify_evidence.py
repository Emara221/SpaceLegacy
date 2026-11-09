"""Proves every fact: checks that each row's evidence text appears word-for-word in the saved
snapshot of its source (snapshots/<source_id>.txt).

Usage (from the data-and-sources folder):
    python tools/verify_evidence.py          # offline check against saved snapshots
    python tools/verify_evidence.py --live   # re-download sources first (needs internet)
"""
import csv
import os
import re
import subprocess
import sys
import unicodedata

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['facts.csv', 'catalog_moon_hardware.csv', 'catalog_mars_hardware.csv']
PAIRS = [('source_id', 'evidence'), ('status_source_id', 'status_evidence')]


def norm(s):
    s = unicodedata.normalize('NFKC', s)
    s = s.translate(str.maketrans({'’': "'", '‘': "'", '“': '"', '”': '"',
                                   '–': '-', '—': '-', ' ': ' ', '�': ' '}))
    return re.sub(r'\s+', ' ', s).strip().lower()


def main():
    if '--live' in sys.argv:
        subprocess.run([sys.executable, os.path.join(HERE, 'tools', 'snapshot_sources.py')], check=False)
    sources = {r['source_id']: r for r in csv.DictReader(open(os.path.join(HERE, 'sources.csv'), encoding='utf-8'))}
    cache, ok, bad = {}, 0, []
    for sid in sources:
        if not os.path.isfile(os.path.join(HERE, 'snapshots', f'{sid}.txt')):
            bad.append(f'sources.csv: no snapshot for {sid}')
    for name in FILES:
        for i, row in enumerate(csv.DictReader(open(os.path.join(HERE, name), encoding='utf-8')), start=2):
            for scol, ecol in PAIRS:
                sid, ev = row.get(scol, ''), row.get(ecol, '')
                if not sid and not ev:
                    continue
                label = f'{name} line {i} ({row.get("fact_id") or row.get("mission")})'
                if sid not in sources:
                    bad.append(f'{label}: unknown source "{sid}"')
                    continue
                if sid not in cache:
                    path = os.path.join(HERE, 'snapshots', f'{sid}.txt')
                    cache[sid] = norm(open(path, encoding='utf-8').read()) if os.path.isfile(path) else ''
                if norm(ev) in cache[sid]:
                    ok += 1
                else:
                    bad.append(f'{label}: evidence not found in {sid}: "{ev[:90]}"')
    for b in bad:
        print('FAIL', b)
    print(f'\n{ok} evidence quotes verified against {len(sources)} source snapshots; {len(bad)} problems.')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
