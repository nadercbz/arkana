#!/usr/bin/env python3
"""ARKANA: eine einzige große Karte statt Einzelbildschirme.

72 x 108 Kacheln zu je 40px, also 2880 x 4320 Pixel. Die Kamera
folgt dem Spieler. Biome sind organische Regionen mit weichen
Grenzen, dazwischen laufen begehbare Wege. Landmarken werden an
festen Stellen eingesetzt, der Rest wächst prozedural.
"""
import math
import random
from collections import deque

W, H = 72, 108
rng = random.Random(20260728)

SOLID = set('#R~vcTWoxbfMi')

# ------------------------------------------------------------
# 1. Biom-Regionen über gestörte Voronoi-Zellen
# ------------------------------------------------------------
# (name, x, y, gewicht) Gewicht steuert die Ausdehnung
CENTERS = [
    ('asche',      36,  54, 1.00),   # Zentrum, die Aschenstadt
    ('asche',      36,  72, 0.80),   # Markt, südlich
    ('bibliothek', 16,  44, 0.85),
    ('mond',       14,  20, 0.90),
    ('sternen',    38,  14, 0.95),
    ('kristall',   58,  26, 1.00),
    ('wueste',     60,  60, 1.05),
    ('unterwelt',  56,  92, 1.00),
    ('hain',       18,  76, 0.95),
    ('sumpf',       8,  62, 0.95),
    ('mond',       10,  98, 0.75),   # Stille Bucht, ganz unten
]

# Rauschen für organische Grenzen
def fbm(x, y, seed=0):
    v, amp, f = 0.0, 1.0, 0.055
    for o in range(4):
        n = math.sin((x * f + seed * 13.7) * 1.7) * math.cos((y * f + seed * 7.3) * 1.9)
        n += math.sin((x * f * 2.3 - y * f * 1.1 + seed) * 2.1) * 0.6
        v += n * amp
        amp *= 0.5
        f *= 2.0
    return v

biome = [[None] * W for _ in range(H)]
for y in range(H):
    for x in range(W):
        best, bestd = None, 1e9
        wob = fbm(x, y, 3) * 5.5
        for (nm, cx, cy, wt) in CENTERS:
            d = math.hypot((x - cx) * 1.0, (y - cy) * 0.72) / wt + wob
            if d < bestd:
                bestd, best = d, nm
        biome[y][x] = best

# ------------------------------------------------------------
# 2. Grundgelände je Biom
# ------------------------------------------------------------
FLOOR = {'asche': '.', 'bibliothek': '.', 'mond': '.', 'sternen': '.',
         'kristall': '.', 'wueste': 's', 'unterwelt': '.', 'hain': '.', 'sumpf': '.'}
WALL = {'asche': '#', 'bibliothek': '#', 'mond': '#', 'sternen': '#',
        'kristall': 'R', 'wueste': '#', 'unterwelt': 'R', 'hain': '#', 'sumpf': '~'}

g = [[FLOOR[biome[y][x]] for x in range(W)] for y in range(H)]

# Massive Struktur je Biom über Rauschschwellen
for y in range(H):
    for x in range(W):
        b = biome[y][x]
        n = fbm(x, y, 1)
        m = fbm(x * 1.6, y * 1.6, 5)
        if b == 'kristall':
            if n > 0.55: g[y][x] = 'R'
            elif m > 1.15: g[y][x] = 'c'
        elif b == 'unterwelt':
            if n > 0.62: g[y][x] = 'R'
            elif m > 1.3: g[y][x] = 'v'
            elif m < -1.35: g[y][x] = 'f'
        elif b == 'sumpf':
            if n > 0.15: g[y][x] = '~'
            elif n > -0.05: g[y][x] = 'w'
            elif m > 1.0: g[y][x] = 'g'
        elif b == 'hain':
            if m > 0.85: g[y][x] = 'T'
            elif m > 0.35: g[y][x] = 'r'
            elif m < -1.1: g[y][x] = 'p'
            elif n > 0.6: g[y][x] = 'g'
        elif b == 'wueste':
            if n > 0.95: g[y][x] = '#'
            elif m > 1.45: g[y][x] = 'M'
        elif b == 'mond':
            if n > 0.7: g[y][x] = '#'
            elif m > 1.2: g[y][x] = 'i'
            elif m < -1.3: g[y][x] = 'p'
        elif b == 'sternen':
            if n > 0.8: g[y][x] = '#'
            elif m > 1.5: g[y][x] = 'o'
        elif b == 'bibliothek':
            if n > 0.5: g[y][x] = '#'
            elif m > 1.05: g[y][x] = 'b'
        elif b == 'asche':
            if n > 0.85: g[y][x] = '#'
            elif m > 1.4: g[y][x] = 'o'

# Kartenrand dicht
for x in range(W):
    g[0][x] = g[1][x] = '#'
    g[H - 1][x] = g[H - 2][x] = '#'
for y in range(H):
    g[y][0] = g[y][1] = '#'
    g[y][W - 1] = g[y][W - 2] = '#'

# ------------------------------------------------------------
# 3. Landmarken einsetzen
# ------------------------------------------------------------
def stamp(x0, y0, block, transparent=' '):
    rows = [r for r in block.strip('\n').split('\n')]
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == transparent:
                continue
            x, y = x0 + dx, y0 + dy
            if 2 <= x < W - 2 and 2 <= y < H - 2:
                g[y][x] = ch

# Die Ruine des Großen Archivs, Herz der Karte
stamp(29, 47, """
  #########
 ###.....###
##..bbbbb..##
#..b,,,,,b..#
#.b,,,,,,,b.#
#.b,,ooo,,b.#
#.b,,o.o,,b.#
#..,,o.o,,..#
#.b,,ooo,,b.#
#.b,,,,,,,b.#
#..b,,,,,b..#
##..bbbbb..##
 ###.....###
  #########
""")
# Zugänge in die Ruine
for dx in (-1, 0, 1):
    g[47 + 13][29 + 6 + dx] = '.'
    g[47][29 + 6 + dx] = '.'
for dy in (-1, 0, 1):
    g[47 + 7 + dy][29] = '.'
    g[47 + 7 + dy][29 + 12] = '.'

# Sternenwarte im Norden
stamp(33, 8, """
 ##vvv##
###...###
##..M..##
#...o...#
#.o...o.#
##.....##
###...###
 ##...##
""")

# Die stumme Pyramide im Osten
stamp(56, 55, """
###########
#sssssssss#
#s#######s#
#s#,,,,,#s#
#s#,,x,,#s#
#s#,,,,,#s#
#s#,,,,,#s#
#s#######s#
#sssssssss#
###########
""")
for dy in (-1, 0, 1):
    g[55 + 4 + dy][56] = 's'
    g[55 + 4 + dy][56 + 1] = 's'
    g[55 + 4 + dy][56 + 2] = ','

# Spiegelhof, Säulenring nördlich des Zentrums
stamp(31, 34, """
 ooooooo
o.......o
o..ooo..o
o.o...o.o
o.o.x.o.o
o.o...o.o
o..ooo..o
o.......o
 ooooooo
""")
for dy in range(3, 6):
    g[34 + dy][31] = '.'
    g[34 + dy][31 + 8] = '.'

# Brückenschlucht in der Unterwelt
for y in range(84, 96):
    for x in range(46, 66):
        if 86 <= y <= 93 and 48 <= x <= 64:
            g[y][x] = 'v'
for bx in (52, 60):
    for y in range(86, 94):
        g[y][bx] = 'B'
for by in (89,):
    for x in range(48, 65):
        g[by][x] = 'B'

# Steg über den Sumpf
for x in range(5, 20):
    g[62][x] = 'B'
for y in range(56, 70):
    g[y][12] = 'B'

# ------------------------------------------------------------
# 4. Wege zwischen den Regionen carven
# ------------------------------------------------------------
HUBS = {
    'zentrum': (36, 54), 'markt': (36, 74), 'spiegelhof': (35, 38),
    'sternwarte': (37, 12), 'kristall': (58, 26), 'bibliothek': (16, 44),
    'mondgarten': (14, 22), 'wueste': (60, 58), 'pyramide': (61, 59),
    'unterwelt': (56, 88), 'hain': (18, 76), 'sumpf': (10, 62),
    'bucht': (10, 98), 'tiefe': (40, 100), 'duenen': (64, 40),
}
ROADS = [
    ('zentrum', 'spiegelhof'), ('spiegelhof', 'sternwarte'),
    ('spiegelhof', 'kristall'), ('spiegelhof', 'bibliothek'),
    ('bibliothek', 'mondgarten'), ('kristall', 'duenen'),
    ('zentrum', 'markt'), ('zentrum', 'wueste'), ('zentrum', 'hain'),
    ('wueste', 'pyramide'), ('duenen', 'wueste'),
    ('markt', 'unterwelt'), ('markt', 'tiefe'), ('markt', 'hain'),
    ('hain', 'sumpf'), ('sumpf', 'bucht'), ('unterwelt', 'tiefe'),
]

def carve_path(a, b, width=2):
    """Gewundener Weg, räumt Festes weg und legt Untiefen über Wasser."""
    (ax, ay), (bx, by) = a, b
    x, y = ax, ay
    guard = 0
    while (x, y) != (bx, by) and guard < 4000:
        guard += 1
        for dy in range(-width, width + 1):
            for dx in range(-width, width + 1):
                if abs(dx) + abs(dy) > width:
                    continue
                nx, ny = x + dx, y + dy
                if not (2 <= nx < W - 2 and 2 <= ny < H - 2):
                    continue
                b_ = biome[ny][nx]
                cur = g[ny][nx]
                if cur in SOLID:
                    g[ny][nx] = 'w' if b_ == 'sumpf' else ('B' if cur == 'v' else FLOOR[b_])
        # Bewegung mit leichtem Zufall, damit die Wege nicht schnurgerade sind
        dx = 1 if bx > x else (-1 if bx < x else 0)
        dy = 1 if by > y else (-1 if by < y else 0)
        if dx and dy:
            if rng.random() < 0.5: dy = 0
            else: dx = 0
        if rng.random() < 0.22:
            if dx: dy = rng.choice([-1, 0, 1])
            elif dy: dx = rng.choice([-1, 0, 1])
        x = max(2, min(W - 3, x + dx))
        y = max(2, min(H - 3, y + dy))

for a, b in ROADS:
    carve_path(HUBS[a], HUBS[b], width=2)

# ------------------------------------------------------------
# 5. Erreichbarkeit mit exakter Spiel-Physik prüfen
# ------------------------------------------------------------
TP = 40
def can_stand(nx, ny):
    for px, py in ((nx + 7, ny + 30), (nx + 19, ny + 30),
                   (nx + 7, ny + 39), (nx + 19, ny + 39)):
        tx, ty = int(px // TP), int(py // TP)
        if tx < 0 or ty < 0 or tx >= W or ty >= H:
            return False
        if g[ty][tx] in SOLID:
            return False
    return True

START = (36 * TP + 4, 54 * TP + 2)

def pixel_flood(start):
    sx, sy = round(start[0] / 4) * 4 + 2, round(start[1] / 4) * 4 + 2
    if not can_stand(sx, sy):
        for r in range(4, 200, 4):
            found = False
            for a in range(24):
                ang = a / 24 * 6.283
                nx, ny = sx + math.cos(ang) * r, sy + math.sin(ang) * r
                nx, ny = round(nx / 4) * 4 + 2, round(ny / 4) * 4 + 2
                if can_stand(nx, ny):
                    sx, sy = nx, ny; found = True; break
            if found:
                break
    seen, q = {(sx, sy)}, deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((4, 0), (-4, 0), (0, 4), (0, -4)):
            n = (x + dx, y + dy)
            if n in seen:
                continue
            if not (0 <= n[0] <= W * TP - 26 and 0 <= n[1] <= H * TP - 42):
                continue
            if not can_stand(*n):
                continue
            seen.add(n); q.append(n)
    return seen, (sx, sy)

pix, start_px = pixel_flood(START)
reach_tiles = {(int((x + 13) // TP), int((y + 32) // TP)) for (x, y) in pix}
print(f"Karte {W}x{H} Kacheln = {W*TP}x{H*TP} px")
print(f"Erreichbare Kachelfelder vom Start: {len(reach_tiles)}")

# Biome-Abdeckung prüfen: jedes Biom muss erreichbar sein
per_biome = {}
for (x, y) in reach_tiles:
    if 0 <= x < W and 0 <= y < H:
        per_biome[biome[y][x]] = per_biome.get(biome[y][x], 0) + 1
print("Erreichbar je Biom:", {k: v for k, v in sorted(per_biome.items())})
fehlend = [nm for nm in set(b for b, *_ in CENTERS) if per_biome.get(nm, 0) < 20]
if fehlend:
    print("  ⚠ kaum erreichbar:", fehlend)

# ------------------------------------------------------------
# 6. Objekte platzieren, nur auf erreichbaren Feldern
# ------------------------------------------------------------
# Regionen für Story und HUD: (name, x, y, radius)
REGIONS = [
    ('Aschenstadt',            36, 54, 13), ('Markt der Mustersucher', 36, 74, 11),
    ('Spiegelhof',             35, 38, 9),  ('Sternenwarte',           37, 12, 12),
    ('Kristallkaverne',        58, 26, 14), ('Verbrannte Bibliothek',  16, 44, 12),
    ('Mondgarten',             14, 22, 13), ('Sandtor',                60, 58, 10),
    ('Die stumme Pyramide',    61, 59, 7),  ('Wandernde Dünen',        64, 40, 12),
    ('Glutschlund',            56, 88, 13), ('Wurzelhain',             18, 76, 13),
    ('Nebelsumpf',             10, 62, 12), ('Stille Bucht',           10, 98, 11),
    ('Die Tiefe',              40, 100, 11),
]

def region_of(x, y):
    best, bd = None, 1e9
    for (nm, cx, cy, r) in REGIONS:
        d = math.hypot(x - cx, (y - cy) * 0.8)
        if d < bd:
            bd, best = d, nm
    return best

cand = sorted(reach_tiles)
rng.shuffle(cand)

def pick(n, taken, mind=5, filt=None):
    out = []
    for c in cand:
        if len(out) >= n:
            break
        if filt and not filt(c):
            continue
        if all(abs(c[0] - t[0]) + abs(c[1] - t[1]) >= mind for t in taken + out):
            out.append(c)
    return out

# Wichtigste Objekte zuerst, damit sie die besten Plaetze bekommen.
# Schreine sollen weit auseinander und in verschiedenen Regionen liegen.
taken = []
shrine_spots = []
used_reg = set()
for c in cand:
    if len(shrine_spots) >= 4:
        break
    reg = region_of(*c)
    if reg in used_reg:
        continue
    if all(abs(c[0] - t[0]) + abs(c[1] - t[1]) >= 22 for t in shrine_spots):
        shrine_spots.append(c); used_reg.add(reg)
taken += shrine_spots

npc_spots = []
npc_reg = set()
for c in cand:
    if len(npc_spots) >= 15:
        break
    reg = region_of(*c)
    if reg in npc_reg:
        continue
    if all(abs(c[0] - t[0]) + abs(c[1] - t[1]) >= 9 for t in taken + npc_spots):
        npc_spots.append(c); npc_reg.add(reg)
taken += npc_spots

insch_spots = pick(45, taken, mind=6); taken += insch_spots
frag_spots = pick(95, taken, mind=5); taken += frag_spots

print(f"Fragmente {len(frag_spots)}, Inschriften {len(insch_spots)}, "
      f"NPCs {len(npc_spots)}, Schreine {len(shrine_spots)}")

# ------------------------------------------------------------
# 7. Ausgabe
# ------------------------------------------------------------
out = []
out.append("  const MAP_W = %d, MAP_H = %d;" % (W, H))
out.append("  const tiles = [")
for row in g:
    out.append("    '" + "".join(row) + "',")
out.append("  ];")

# Biom-Karte als kompakte Zeichenkette
bkeys = sorted(set(b for b, *_ in CENTERS))
bidx = {b: str(i) for i, b in enumerate(bkeys)}
out.append("  const BIOME_KEYS = [%s];" % ", ".join("'%s'" % b for b in bkeys))
out.append("  const biomeMap = [")
for y in range(H):
    out.append("    '" + "".join(bidx[biome[y][x]] for x in range(W)) + "',")
out.append("  ];")

def dumplist(name, pts):
    out.append("  const %s = [%s];" % (name, ", ".join("[%d,%d]" % (x, y) for x, y in pts)))

out.append("  const npcRegions = [%s];" % ", ".join("'%s'" % region_of(*c) for c in npc_spots))
out.append("  const inschRegions = [%s];" % ", ".join("'%s'" % region_of(*c) for c in insch_spots))
dumplist('fragSpots', frag_spots)
dumplist('inschriftSpots', insch_spots)
dumplist('npcSpots', npc_spots)
dumplist('shrineSpots', shrine_spots)
out.append("  const START = [%d, %d];" % start_px)
out.append("  const REGIONS = [")
for (nm, x, y, r) in REGIONS:
    out.append("    { name: '%s', x: %d, y: %d, r: %d }," % (nm, x, y, r))
out.append("  ];")

open('/tmp/arkana_bigmap.js', 'w').write("\n".join(out))
print("→ /tmp/arkana_bigmap.js")

# Kleine ASCII-Vorschau, jede 3. Kachel
print("\nVorschau (jede dritte Kachel):")
for y in range(0, H, 3):
    print("  " + "".join(g[y][x] for x in range(0, W, 3)))
