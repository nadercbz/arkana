#!/usr/bin/env python3
"""Die graue Stadt als offene Karte, kein Raumraster mehr.

40 x 60 Kacheln. Ein Straßennetz mit Blocks, Park, Wasser,
Hinterhöfen und der alten Ladenzeile mit dem flackernden Laden.
"""
import math
import random
from collections import deque

W, H = 40, 60
rng = random.Random(4711)
SOLID = set('#R~vcTWoxbfMi')

g = [['#' for _ in range(W)] for _ in range(H)]


def rect(x0, y0, x1, y1, ch):
    for y in range(max(0, y0), min(H, y1 + 1)):
        for x in range(max(0, x0), min(W, x1 + 1)):
            g[y][x] = ch


def hroad(y, x0, x1, w=2):
    for yy in range(y, y + w):
        for x in range(x0, x1 + 1):
            if 0 <= yy < H and 0 <= x < W:
                g[yy][x] = '='


def vroad(x, y0, y1, w=2):
    for xx in range(x, x + w):
        for y in range(y0, y1 + 1):
            if 0 <= y < H and 0 <= xx < W:
                g[y][xx] = '='


# --- Blocks als Bebauung, dazwischen Straßen ---
# Straßenraster, bewusst unregelmäßig
hroad(8, 2, 37); hroad(20, 2, 37); hroad(32, 2, 37); hroad(46, 2, 37)
vroad(6, 2, 57); vroad(18, 2, 57); vroad(30, 2, 57)
# Zwei Querverbindungen, versetzt
hroad(14, 6, 31); hroad(39, 6, 31); hroad(52, 6, 31)

# Häuserblöcke füllen die Zwischenräume
BLOCKS = [
    (2, 2, 5, 7), (8, 2, 17, 7), (20, 2, 29, 7), (32, 2, 37, 7),
    (2, 10, 5, 13), (8, 10, 17, 13), (20, 10, 29, 13), (32, 10, 37, 19),
    (2, 16, 5, 19), (8, 16, 17, 19), (20, 16, 29, 19),
    (2, 22, 5, 31), (20, 22, 29, 31), (32, 22, 37, 31),
    (2, 34, 5, 38), (8, 34, 17, 38), (20, 34, 29, 38), (32, 34, 37, 45),
    (2, 41, 5, 45), (8, 41, 17, 45), (20, 41, 29, 45),
    (2, 48, 5, 51), (20, 48, 29, 51), (32, 48, 37, 57),
    (8, 54, 17, 57), (20, 54, 29, 57),
]
for (x0, y0, x1, y1) in BLOCKS:
    rect(x0, y0, x1, y1, '#')
    # Fensterreihen an den Fassaden
    for x in range(x0, x1 + 1):
        if rng.random() < 0.5:
            g[y0][x] = 'W'
        if rng.random() < 0.5:
            g[y1][x] = 'W'
    for y in range(y0, y1 + 1):
        if rng.random() < 0.35:
            g[y][x0] = 'W'
        if rng.random() < 0.35:
            g[y][x1] = 'W'

# --- Park am Wasser, oben links ---
rect(8, 22, 17, 31, '.')
rect(9, 23, 16, 26, '~')
for _ in range(14):
    x, y = rng.randrange(8, 18), rng.randrange(27, 32)
    g[y][x] = rng.choice(['T', 'g', 'g', '.'])
# Uferweg
hroad(28, 8, 17, 1)

# --- Hinterhöfe, kleine offene Flecken ---
for (cx, cy) in [(12, 11), (24, 17), (12, 43), (24, 36), (34, 26), (12, 55)]:
    rect(cx - 2, cy - 1, cx + 2, cy + 1, '.')
    for _ in range(3):
        g[cy + rng.randrange(-1, 2)][cx + rng.randrange(-2, 3)] = rng.choice(['g', '.', 'T'])

# --- Die alte Ladenzeile im Süden, mit dem flackernden Laden ---
rect(20, 48, 29, 51, '#')
rect(21, 49, 28, 50, 'W')
LADEN = (24, 51)
g[51][24] = 'D'
g[51][25] = 'D'
rect(22, 52, 27, 53, '.')

# --- Rand dicht ---
for x in range(W):
    g[0][x] = g[1][x] = '#'
    g[H - 1][x] = g[H - 2][x] = '#'
for y in range(H):
    g[y][0] = g[y][1] = '#'
    g[y][W - 1] = g[y][W - 2] = '#'

# --- Erreichbarkeit mit Spiel-Physik ---
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


START = (7 * TP + 4, 21 * TP + 2)
sx, sy = round(START[0] / 4) * 4 + 2, round(START[1] / 4) * 4 + 2
if not can_stand(sx, sy):
    for r in range(4, 300, 4):
        done = False
        for a in range(24):
            ang = a / 24 * 6.283
            nx = round((sx + math.cos(ang) * r) / 4) * 4 + 2
            ny = round((sy + math.sin(ang) * r) / 4) * 4 + 2
            if can_stand(nx, ny):
                sx, sy = nx, ny; done = True; break
        if done:
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

tiles = {(int((x + 13) // TP), int((y + 32) // TP)) for (x, y) in seen}
print(f"Stadt {W}x{H} = {W*TP}x{H*TP} px, erreichbare Felder {len(tiles)}")

# Ist die Ladentür erreichbar?
def near(tx, ty, d=52):
    for (x, y) in seen:
        if math.hypot((x + 13) - (tx * TP + 20), (y + 32) - (ty * TP + 22)) < d:
            return True
    return False

print("Ladentür erreichbar:", near(*LADEN, d=56))
if not near(*LADEN, d=56):
    raise SystemExit("FEHLER: Der Laden ist nicht erreichbar")

# --- NPCs verteilen ---
cand = sorted(tiles)
rng.shuffle(cand)
npcs = []
for c in cand:
    if len(npcs) >= 7:
        break
    if all(abs(c[0] - p[0]) + abs(c[1] - p[1]) >= 9 for p in npcs):
        # nicht direkt vor dem Laden
        if abs(c[0] - LADEN[0]) + abs(c[1] - LADEN[1]) < 6:
            continue
        npcs.append(c)
print("NPCs:", len(npcs))

out = []
out.append("  const CITY_W = %d, CITY_H = %d;" % (W, H))
out.append("  const tiles = [")
for row in g:
    out.append("    '" + "".join(row) + "',")
out.append("  ];")
out.append("  const npcSpots = [%s];" % ", ".join("[%d,%d]" % (x, y) for x, y in npcs))
out.append("  const LADEN = [%d, %d];" % LADEN)
out.append("  const START = [%d, %d];" % (sx, sy))
open('/tmp/arkana_city.js', 'w').write("\n".join(out))
print("→ /tmp/arkana_city.js")

print("\nVorschau (jede zweite Kachel):")
for y in range(0, H, 2):
    print("  " + "".join(g[y][x] for x in range(0, W, 2)))
