"""Inspect a GLB: list nodes with world-space bounding boxes (pure Python)."""
import json, struct, sys, math

def read_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    magic, version, length = struct.unpack_from('<4sII', data, 0)
    assert magic == b'glTF', 'not a GLB'
    off = 12
    js = None
    while off < length:
        clen, ctype = struct.unpack_from('<I4s', data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == b'JSON':
            js = json.loads(chunk.decode('utf-8'))
        off += 8 + clen
    return js

def mat_mul(a, b):  # column-major 4x4
    r = [0.0] * 16
    for c in range(4):
        for rr in range(4):
            r[c * 4 + rr] = sum(a[k * 4 + rr] * b[c * 4 + k] for k in range(4))
    return r

def trs(node):
    if 'matrix' in node:
        return node['matrix']
    t = node.get('translation', [0, 0, 0])
    q = node.get('rotation', [0, 0, 0, 1])
    s = node.get('scale', [1, 1, 1])
    x, y, z, w = q
    m = [
        (1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0,
        (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0,
        (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0,
        t[0], t[1], t[2], 1,
    ]
    return m

def apply(m, p):
    return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
            m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
            m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]

def main(path, maxdepth=99, filt=None):
    js = read_glb(path)
    nodes = js.get('nodes', [])
    meshes = js.get('meshes', [])
    acc = js.get('accessors', [])
    mats = js.get('materials', [])
    print('asset:', js.get('asset'))
    print('extensionsUsed:', js.get('extensionsUsed'))
    print('counts: nodes', len(nodes), 'meshes', len(meshes), 'materials', len(mats), 'images', len(js.get('images', [])), 'anims', len(js.get('animations', [])))
    for i, im in enumerate(js.get('images', [])):
        bv = js['bufferViews'][im['bufferView']] if 'bufferView' in im else None
        print('  image', i, im.get('name'), im.get('mimeType'), bv['byteLength'] if bv else im.get('uri'))
    print('materials:', [m.get('name') for m in mats])
    scene = js['scenes'][js.get('scene', 0)]
    gmin = [math.inf] * 3
    gmax = [-math.inf] * 3
    rows = []

    def bounds_of(nidx, world):
        n = nodes[nidx]
        bmin = [math.inf] * 3
        bmax = [-math.inf] * 3
        if 'mesh' in n:
            for prim in meshes[n['mesh']]['primitives']:
                a = acc[prim['attributes']['POSITION']]
                mn, mx = a['min'], a['max']
                for cx in (mn[0], mx[0]):
                    for cy in (mn[1], mx[1]):
                        for cz in (mn[2], mx[2]):
                            p = apply(world, [cx, cy, cz])
                            for k in range(3):
                                bmin[k] = min(bmin[k], p[k]); bmax[k] = max(bmax[k], p[k])
        return bmin, bmax

    def visit(nidx, parent, depth):
        n = nodes[nidx]
        world = mat_mul(parent, trs(n))
        bmin, bmax = bounds_of(nidx, world)
        # aggregate children
        for c in n.get('children', []):
            cmin, cmax = visit(c, world, depth + 1)
            for k in range(3):
                bmin[k] = min(bmin[k], cmin[k]); bmax[k] = max(bmax[k], cmax[k])
        rows.append((depth, nidx, n.get('name', ''), bmin, bmax, 'mesh' in n,
                     [meshes[n['mesh']]['primitives'][0].get('material')] if 'mesh' in n else []))
        return bmin, bmax

    ident = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    for r in scene['nodes']:
        cmin, cmax = visit(r, ident, 0)
        for k in range(3):
            gmin[k] = min(gmin[k], cmin[k]); gmax[k] = max(gmax[k], cmax[k])
    print('SCENE BOUNDS min', [round(v, 3) for v in gmin], 'max', [round(v, 3) for v in gmax])
    rows.sort(key=lambda r: r[1])
    for depth, idx, name, bmin, bmax, hasmesh, mat in rows:
        if depth > maxdepth:
            continue
        if filt and filt.lower() not in name.lower():
            continue
        if bmin[0] == math.inf:
            continue
        c = [round((bmin[k] + bmax[k]) / 2, 3) for k in range(3)]
        sz = [round(bmax[k] - bmin[k], 3) for k in range(3)]
        print(f"{'  ' * depth}[{idx}] {name!r} center={c} size={sz} max={[round(v,3) for v in bmax]} mesh={hasmesh} mat={mat}")

if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 99, sys.argv[3] if len(sys.argv) > 3 else None)
