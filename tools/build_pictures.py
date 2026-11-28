# Usage: python3 tools/build_pictures.py coloring-data.js   (draw new pictures in tools/pixel_designs.py first)
"""Turn the pixel designs into coloring-data.js: each picture is a grid of numbers (0 = empty).
Each picture also gets a SMOOTH version (traced with potrace) that appears when the child finishes colouring.
Needs: pip install potracer numpy"""
import sys, json; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, potrace

def smooth_layers(grid, ncol, U=2):
    """Trace each colour area into a smooth vector path (in box units). Bigger areas first, small details on top."""
    a = np.array([[int(c) for c in r] for r in grid])
    layers = []
    for k in range(1, ncol + 1):
        m = np.kron((a == k).astype(np.uint8), np.ones((U, U), np.uint8))
        m = np.pad(m, U)                                    # room around the edges
        plist = potrace.Bitmap(~m.astype(bool)).trace(        # potracer traces the False cells, so pass the mask inverted
            turdsize=0, alphamax=1.15, opticurve=True, opttolerance=0.2)
        f = lambda p: f"{(p.x - U) / U:.2f} {(p.y - U) / U:.2f}"
        d = []
        for curve in plist:
            d.append('M' + f(curve.start_point))
            for seg in curve.segments:
                if seg.is_corner: d.append('L' + f(seg.c) + 'L' + f(seg.end_point))
                else: d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
            d.append('Z')
        layers.append({'c': k, 'n': int((a == k).sum()), 'd': ''.join(d)})
    layers.sort(key=lambda L: -L['n'])
    return [{'c': L['c'], 'd': L['d']} for L in layers]

from pixel_designs import D
out = []
for pid, d in D.items():
    rows = d['art'].strip('\n').split('\n')
    keys = list(d['pal'])                                   # palette order = colour numbers 1, 2, 3 …
    ys = [y for y, r in enumerate(rows) if r.strip('.')]
    xs = [x for r in rows for x, c in enumerate(r) if c != '.']
    y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
    grid = [''.join(str(keys.index(c) + 1) if c != '.' else '0' for c in r[x0:x1 + 1].ljust(x1 + 1 - x0, '.')) for r in rows[y0:y1 + 1]]
    used = sorted({int(c) for r in grid for c in r if c != '0'})
    assert used == list(range(1, len(keys) + 1)), (pid, used, keys)
    out.append({'id': pid, 'name': {'en': d['en'], 'tl': d['tl']}, 'w': x1 - x0 + 1, 'h': y1 - y0 + 1,
                'colors': [d['pal'][k] for k in keys], 'cells': grid, 'smooth': smooth_layers(grid, len(keys))})
js = ("'use strict';\n/* FunZone COLORING pictures (made with tools/pixel_designs.py).\n"
      "   cells: one string per row, one digit per box: 0 = empty, 1-9 = colour number (colors[number - 1]). */\n"
      "FZ.pictures = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
open(sys.argv[1], 'w').write(js)
print(len(out), 'pictures:', ', '.join(f"{p['id']} {p['w']}x{p['h']} {len(p['colors'])} colours" for p in out))
