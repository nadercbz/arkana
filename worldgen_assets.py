#!/usr/bin/env python3
"""Streut Objekt-Assets in eine Karte. Lokaler Engpass-Test beim Setzen,
danach ein globaler Flood-Fill und Reparatur, falls doch etwas abgeschnitten wurde."""
import re, math, random, sys
from collections import deque

SOLID = set('#RTWD~vcoxbfMi*') | set('1234678900ACEFHJKLNPQSU')
FREE_OLD = set('.,=g')
TP = 40

def load_rows(s, name):
    m = re.search(r"const %s = \[\n((?:    '[^\n]*\n)+)  \];" % name, s)
    rows = [l.strip().rstrip(',').strip("'") for l in m.group(1).rstrip().split('\n')]
    return m, rows

def can_stand(g, nx, ny, w, h):
    for px, py in ((nx+7, ny+30), (nx+19, ny+30), (nx+7, ny+39), (nx+19, ny+39)):
        tx, ty = px//TP, py//TP
        if tx < 0 or ty < 0 or tx >= w or ty >= h: return False
        if g[ty][tx] in SOLID: return False
    return True

def reach_px(g, start, w, h):
    sx, sy = round(start[0]/4)*4+2, round(start[1]/4)*4+2
    if not can_stand(g, sx, sy, w, h):
        for r in range(4, 400, 4):
            hit = False
            for a in range(32):
                ang = a/32*6.283
                nx, ny = round((sx+math.cos(ang)*r)/4)*4+2, round((sy+math.sin(ang)*r)/4)*4+2
                if can_stand(g, nx, ny, w, h): sx, sy, hit = nx, ny, True; break
            if hit: break
    seen, q = {(sx, sy)}, deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((4,0),(-4,0),(0,4),(0,-4)):
            n = (x+dx, y+dy)
            if n in seen: continue
            if not (0 <= n[0] <= w*TP-26 and 0 <= n[1] <= h*TP-42): continue
            if not can_stand(g, *n, w, h): continue
            seen.add(n); q.append(n)
    return seen

def eng(g, x, y, w, h):
    """Pixelgenauer Engpass-Test im Fenster um (x,y), gleiche Physik wie im Spiel.
    True heisst: dieses Objekt wuerde begehbaren Raum zerschneiden."""
    x0, y0 = max(0, x-4)*TP, max(0, y-4)*TP
    x1, y1 = min(w-1, x+5)*TP, min(h-1, y+5)*TP
    free = []
    for py in range(y0, y1, 4):
        for px in range(x0, x1, 4):
            if can_stand(g, px, py, w, h): free.append((px, py))
    if len(free) < 2: return False
    fs = set(free)
    st = free[0]; seen = {st}; q = deque([st])
    while q:
        cx, cy = q.popleft()
        for dx, dy in ((4,0),(-4,0),(0,4),(0,-4)):
            n = (cx+dx, cy+dy)
            if n in fs and n not in seen: seen.add(n); q.append(n)
    return len(seen) != len(fs)

def scatter(src, biome_assets, dichte, biome_of, seed, label, block_name=None):
    s = open(src, encoding='utf-8').read()
    if block_name == 'CITY':
        # zweiter tiles-Block in der Datei
        alle = list(re.finditer(r"const tiles = \[\n((?:    '[^\n]*\n)+)  \];", s))
        mt = alle[-1]
        rows = [l.strip().rstrip(',').strip("'") for l in mt.group(1).rstrip().split('\n')]
        s_such = s[mt.start():]
    else:
        mt, rows = load_rows(s, 'tiles')
        s_such = s
    W, H = len(rows[0]), len(rows)
    g = [list(r) for r in rows]

    def spots(name):
        m = re.search(r'const %s = \[(.*?)\];' % name, s_such, re.S)
        if not m: return []
        return [(int(a), int(b)) for a, b in re.findall(r'\[(\d+),\s*(\d+)\]', m.group(1))]
    TABU = set()
    for nm in ('fragSpots','inschriftSpots','npcSpots','shrineSpots','LADEN'):
        for (x, y) in spots(nm):
            for dy in range(-2,3):
                for dx in range(-2,3): TABU.add((x+dx, y+dy))
    ms = re.search(r'const START = \[(\d+), (\d+)\];', s_such)
    S0 = (int(ms.group(1)), int(ms.group(2)))
    for dy in range(-3,4):
        for dx in range(-3,4): TABU.add((S0[0]//TP+dx, S0[1]//TP+dy))

    before = reach_px(g, S0, W, H)
    rng = random.Random(seed)
    cand = {}
    for y in range(2, H-2):
        for x in range(2, W-2):
            if g[y][x] not in FREE_OLD or (x, y) in TABU: continue
            cand.setdefault(biome_of(x, y), []).append((x, y))

    neu_obj, skip = {}, 0
    for bk, cl in cand.items():
        pal = biome_assets.get(bk)
        if not pal: continue
        rng.shuffle(cl)
        pool = [c for c, wgt in pal for _ in range(wgt)]
        ziel = int(len(cl) * dichte.get(bk, 0.07))
        for (x, y) in cl:
            if ziel <= 0: break
            if sum(1 for dy in (-1,0,1) for dx in (-1,0,1) if g[y+dy][x+dx] in SOLID) > 4: continue
            ch = rng.choice(pool)
            if ch in SOLID and eng(g, x, y, W, H): skip += 1; continue
            neu_obj[(x, y)] = g[y][x]; g[y][x] = ch; ziel -= 1

    # Globale Reparatur. Verloren ist eine Position, die weiterhin begehbar
    # waere, aber nicht mehr vom Start aus erreicht wird. Das ist echte Trennung,
    # nicht die legitime Belegung durch ein Objekt.
    for runde in range(200):
        after = reach_px(g, S0, W, H)
        lost = {q for q in before if q not in after and can_stand(g, q[0], q[1], W, H)}
        if not lost: break
        lt = {(q[0]//TP, q[1]//TP) for q in lost}
        at = {(q[0]//TP, q[1]//TP) for q in after}
        ziel_k = None
        for k in list(neu_obj.keys()):
            kx, ky = k
            umf = [(kx+dx, ky+dy) for dx in (-1,0,1) for dy in (-1,0,1)]
            if any(u in lt for u in umf) and any(u in at for u in umf): ziel_k = k; break
        if ziel_k is None:
            for k in list(neu_obj.keys()):
                if any((k[0]+dx, k[1]+dy) in lt for dx in (-2,-1,0,1,2) for dy in (-2,-1,0,1,2)):
                    ziel_k = k; break
        if ziel_k is None: break
        g[ziel_k[1]][ziel_k[0]] = neu_obj.pop(ziel_k)
    after = reach_px(g, S0, W, H)
    lost = {q for q in before if q not in after and can_stand(g, q[0], q[1], W, H)}
    assert not lost, "Karte trennt %d Positionen ab" % len(lost)
    print(f"{label}: {len(neu_obj)} Objekte gesetzt, {skip} Engpaesse vermieden, "
          f"begehbare Positionen {len(before)} -> {len(after)}")
    nt = "  const tiles = [\n" + "".join("    '" + "".join(r) + "',\n" for r in g) + "  ];"
    open(src, 'w', encoding='utf-8').write(s[:mt.start()] + nt + s[mt.end():])

# ---------- Arkana ----------
import os
s0 = open('07_bigmap.js', encoding='utf-8').read()
mb, brows = load_rows(s0, 'biomeMap')
BK = ['asche','bibliothek','hain','kristall','mond','sternen','sumpf','unterwelt','wueste']
ARK = {
  'asche':      [('3',5),('4',4),('5',6),('8',3),('7',2),('9',3),('H',2),('S',1),('L',2),('C',2)],
  'bibliothek': [('J',6),('8',3),('4',3),('L',3),('S',2),('H',2),('3',2),('O',2)],
  'hain':       [('2',9),('1',5),('6',7),('4',3),('5',3),('9',2),('N',1),('0',1)],
  'kristall':   [('K',9),('4',6),('5',5),('P',3),('L',2),('F',1)],
  'mond':       [('6',6),('2',5),('N',2),('0',2),('Q',3),('5',3),('P',3),('O',1)],
  'sternen':    [('F',4),('4',4),('5',4),('L',3),('S',2),('E',1),('N',1)],
  'sumpf':      [('Q',8),('3',6),('U',3),('5',3),('6',3),('P',2),('L',1)],
  'unterwelt':  [('4',6),('5',6),('K',4),('H',3),('F',2),('U',2),('L',2),('3',3)],
  'wueste':     [('4',5),('5',5),('3',3),('A',3),('C',2),('F',2),('U',1),('H',1),('E',1)],
}
D = {'hain':.22,'mond':.20,'sumpf':.20,'kristall':.18,'bibliothek':.16,
     'asche':.15,'sternen':.15,'unterwelt':.17,'wueste':.14}
for lauf, seed in enumerate([20260728, 8811, 40404]):
    scatter('07_bigmap.js', ARK, D, lambda x, y: BK[int(brows[y][x])], seed, 'Arkana Lauf %d' % (lauf+1))

# ---------- Die graue Stadt ----------
STADT = {
  'stadt': [('8',6),('7',5),('9',5),('C',4),('L',6),('5',4),('4',3),('3',4),('2',3),('6',4),('H',1),('O',2),('J',2)],
}
scatter('07_bigmap.js', STADT, {'stadt': .16}, lambda x, y: 'stadt', 5150, 'Stadt', block_name='CITY')
