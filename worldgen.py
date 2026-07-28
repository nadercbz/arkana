#!/usr/bin/env python3
"""ARKANA Weltgenerator.

Räume sind 9 breit, 14 hoch. Jeder Raum entsteht aus einem
Archetyp mit eigenem Seed. Das erzeugt asymmetrische, sehr
unterschiedliche Layouts statt gespiegelter Muster.
"""
import random

RW, RH = 9, 14
MX, MY = 4, 7

# Legende:
#  . Boden   , Innenboden  # Mauer    R Fels    W Fenster
#  ~ tiefes Wasser  w flach  T Baum   = Pflaster D Tür
#  * Leylinie  c Kristall  s Sand  g Gras  p Blume
#  o Säule  b Regal  x Statue  f Fackel  v Abgrund
#  B Brücke  i Eis  M Monolith  ^ Treppe  r Wurzeln

SOLID = set('#R~vcTWoxbfMi')


def blank(fill='.'):
    return [[fill for _ in range(RW)] for _ in range(RH)]


def border(g, wall):
    for x in range(RW):
        g[0][x] = wall
        g[RH - 1][x] = wall
    for y in range(RH):
        g[y][0] = wall
        g[y][RW - 1] = wall


def neighbours(g, x, y, ch):
    n = 0
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < RW and 0 <= ny < RH:
                if g[ny][nx] == ch:
                    n += 1
            else:
                n += 1
    return n


# ============================================================
# ARCHETYPEN. Jeder liefert ein Gitter. rng steuert die Varianz.
# ============================================================

def arch_cave(rng, wall='R', floor='.'):
    """Organische Höhle über zellulären Automaten. Immer asymmetrisch."""
    g = blank(floor)
    for y in range(RH):
        for x in range(RW):
            g[y][x] = wall if rng.random() < 0.42 else floor
    for _ in range(4):
        ng = [row[:] for row in g]
        for y in range(RH):
            for x in range(RW):
                n = neighbours(g, x, y, wall)
                ng[y][x] = wall if n >= 5 else floor
        g = ng
    border(g, wall)
    return g


def arch_hall(rng, wall='#', floor='.', pillar='o'):
    """Halle mit Säulenreihen, versetzt statt gespiegelt."""
    g = blank(floor)
    border(g, wall)
    off = rng.choice([0, 1])
    for row in range(2, RH - 2, 3):
        for col in range(1 + (row // 3 + off) % 2, RW - 1, 3):
            if rng.random() < 0.78:
                g[row][col] = pillar
    # Ein Seitengang, nur auf einer Seite
    if rng.random() < 0.6:
        sx = rng.choice([1, RW - 2])
        for y in range(3, RH - 3):
            g[y][sx] = floor
    return g


def arch_maze(rng, wall='#', floor='.'):
    """Verwinkelte Gänge, ausgehend von einem Zufallsbaum."""
    g = blank(wall)
    x, y = rng.randrange(2, RW - 2), rng.randrange(2, RH - 2)
    g[y][x] = floor
    for _ in range(150):
        d = rng.choice([(1, 0), (-1, 0), (0, 1), (0, -1)])
        nx, ny = x + d[0] * rng.choice([1, 2]), y + d[1] * rng.choice([1, 2])
        if 1 <= nx < RW - 1 and 1 <= ny < RH - 1:
            for step in range(1, 3):
                mx_, my_ = x + d[0] * min(step, 2), y + d[1] * min(step, 2)
                if 1 <= mx_ < RW - 1 and 1 <= my_ < RH - 1:
                    g[my_][mx_] = floor
            x, y = nx, ny
    border(g, wall)
    return g


def arch_open(rng, wall='#', floor='.', deco=None):
    """Weites Feld, wenige Objekte, viel Luft."""
    g = blank(floor)
    border(g, wall)
    if deco:
        for _ in range(rng.randrange(3, 7)):
            x, y = rng.randrange(1, RW - 1), rng.randrange(1, RH - 1)
            g[y][x] = rng.choice(deco)
    return g


def arch_islands(rng, water='~', floor='.', shallow='w', deco=None):
    """Inseln im Wasser, unregelmäßig verteilt."""
    g = blank(water)
    centres = [(rng.randrange(2, RW - 2), rng.randrange(2, RH - 2))
               for _ in range(rng.randrange(3, 6))]
    for (cx, cy) in centres:
        r = rng.choice([1, 1, 2])
        for y in range(RH):
            for x in range(RW):
                if abs(x - cx) + abs(y - cy) <= r:
                    g[y][x] = floor
    # Untiefen als Verbindungen
    for i in range(len(centres) - 1):
        (ax, ay), (bx, by) = centres[i], centres[i + 1]
        cx, cy = ax, ay
        while (cx, cy) != (bx, by):
            if g[cy][cx] == water:
                g[cy][cx] = shallow
            if cx != bx:
                cx += 1 if bx > cx else -1
            elif cy != by:
                cy += 1 if by > cy else -1
    if deco:
        for _ in range(rng.randrange(2, 5)):
            x, y = rng.randrange(1, RW - 1), rng.randrange(1, RH - 1)
            if g[y][x] == floor:
                g[y][x] = rng.choice(deco)
    return g


def arch_ruin(rng, wall='#', floor='.'):
    """Zerfallene Struktur: Mauerreste, keine geschlossene Form."""
    g = blank(floor)
    border(g, wall)
    for _ in range(rng.randrange(3, 6)):
        w = rng.randrange(2, 5)
        h = rng.randrange(2, 5)
        x = rng.randrange(1, RW - w - 1)
        y = rng.randrange(1, RH - h - 1)
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                # Nur der Rand des Rechtecks, und dort mit Lücken
                edge = (yy in (y, y + h - 1)) or (xx in (x, x + w - 1))
                if edge and rng.random() < 0.72:
                    g[yy][xx] = wall
    return g


def arch_canyon(rng, wall='R', floor='.'):
    """Schlucht: ein gewundener Pfad zwischen Felswänden."""
    g = blank(wall)
    x = rng.randrange(3, RW - 3)
    for y in range(RH):
        width = rng.choice([1, 1, 2])
        for dx in range(-width, width + 1):
            nx = x + dx
            if 1 <= nx < RW - 1:
                g[y][nx] = floor
        x += rng.choice([-1, 0, 0, 1])
        x = max(2, min(RW - 3, x))
    # Eine Seitenkammer
    if rng.random() < 0.7:
        cy = rng.randrange(3, RH - 4)
        cx = rng.choice([1, RW - 3])
        for yy in range(cy, cy + 3):
            for xx in range(cx, cx + 2):
                if 1 <= xx < RW - 1 and 1 <= yy < RH - 1:
                    g[yy][xx] = floor
    border(g, wall)
    return g


def arch_terrace(rng, wall='#', floor='.', step='i'):
    """Stufen und Ebenen, versetzt."""
    g = blank(floor)
    border(g, wall)
    y = 2
    while y < RH - 2:
        w = rng.randrange(3, 7)
        x = rng.randrange(1, RW - w)
        for xx in range(x, x + w):
            g[y][xx] = step
        y += rng.randrange(2, 4)
    return g


def arch_grove(rng, wall='#', floor='.', flora=('T', 'g', 'p', 'r')):
    """Verstreute Vegetation, Lichtungen."""
    g = blank(floor)
    border(g, wall)
    for _ in range(rng.randrange(10, 18)):
        x, y = rng.randrange(1, RW - 1), rng.randrange(1, RH - 1)
        g[y][x] = rng.choice(flora)
    # Eine Lichtung freiräumen
    cx, cy = rng.randrange(2, RW - 2), rng.randrange(3, RH - 3)
    for yy in range(cy - 1, cy + 2):
        for xx in range(cx - 1, cx + 2):
            if 1 <= xx < RW - 1 and 1 <= yy < RH - 1:
                g[yy][xx] = floor
    return g


def arch_chasm(rng, wall='#', floor='.', void='v', bridge='B'):
    """Abgrund mit Übergängen, asymmetrisch."""
    g = blank(floor)
    border(g, wall)
    top = rng.randrange(3, 5)
    bot = rng.randrange(RH - 5, RH - 3)
    for y in range(top, bot):
        left = rng.randrange(1, 3)
        right = rng.randrange(RW - 3, RW - 1)
        for x in range(left, right):
            g[y][x] = void
    # Ein bis zwei Brücken auf verschiedenen Höhen
    for by in rng.sample(range(top, bot), rng.choice([1, 2])):
        for x in range(1, RW - 1):
            if g[by][x] == void:
                g[by][x] = bridge
    return g


def arch_chamber(rng, wall='#', floor=',', furn=('b', 'x', 'o')):
    """Innenraum mit Einrichtung an den Wänden."""
    g = blank(floor)
    border(g, wall)
    for y in range(1, RH - 1):
        for x in (1, RW - 2):
            if rng.random() < 0.55:
                g[y][x] = rng.choice(furn)
    for x in range(1, RW - 1):
        for y in (1, RH - 2):
            if rng.random() < 0.45:
                g[y][x] = rng.choice(furn)
    # Ein Objekt in der Mitte, aber nicht zentriert
    g[rng.randrange(4, RH - 4)][rng.randrange(3, RW - 3)] = rng.choice(furn)
    return g


# ============================================================
# RAUMDEFINITIONEN
# ============================================================
# (biome, name, archetyp, streu-deko)
ROOMS = {
    '2,2': ('asche', 'Aschenstadt', 'ruin', ['f', 'o', '*']),
    '2,1': ('asche', 'Spiegelhof', 'hall', ['x', 'f']),
    '2,3': ('asche', 'Markt der Mustersucher', 'open', ['=', '=', 'f', 'o']),
    '2,0': ('sternen', 'Sternenwarte', 'chamber', ['b', 'o', 'M']),
    '1,1': ('bibliothek', 'Verbrannte Bibliothek', 'maze', ['b', 'b', 'f']),
    '1,0': ('mond', 'Halle der stillen Spiegel', 'terrace', ['x', 'i']),
    '3,1': ('kristall', 'Kristallkaverne', 'cave', ['c', 'c', 'M']),
    '3,0': ('kristall', 'Echokammer', 'maze', ['c', 'M']),
    '0,2': ('sumpf', 'Nebelsumpf', 'islands', ['g', 'p', 'r']),
    '0,1': ('sumpf', 'Ufer der Vergessenen', 'islands', ['g', 'x', 'r']),
    '0,3': ('mond', 'Stille Bucht', 'islands', ['i', 'p']),
    '1,2': ('hain', 'Wurzelhain', 'grove', ['T', 'r', 'p', 'g']),
    '1,3': ('mond', 'Mondgarten', 'grove', ['p', 'i', 'g', 'w']),
    '3,2': ('wueste', 'Sandtor', 'open', ['M', 'M', 's', 'x']),
    '4,1': ('wueste', 'Wandernde Dünen', 'open', ['s', 's', 's', 'M']),
    '4,2': ('wueste', 'Die stumme Pyramide', 'chamber', ['x', 'o', 'M']),
    '4,3': ('unterwelt', 'Obsidianfeld', 'canyon', ['f', 'M']),
    '3,3': ('unterwelt', 'Glutschlund', 'chasm', ['f', 'f']),
    '3,4': ('unterwelt', 'Adern des Glutschlunds', 'cave', ['f', 'M']),
    '2,4': ('unterwelt', 'Die Tiefe', 'chamber', ['M', 'M', 'x', 'f']),
}

LINKS = [
    ('2,2', '2,1'), ('2,2', '2,3'), ('2,2', '1,2'), ('2,2', '3,2'),
    ('2,1', '2,0'), ('2,1', '1,1'), ('2,1', '3,1'),
    ('1,1', '1,0'),
    ('3,1', '3,0'),
    ('1,2', '0,2'), ('1,2', '1,3'),
    ('0,2', '0,1'), ('0,2', '0,3'),
    ('3,2', '4,2'),
    ('4,2', '4,1'), ('4,2', '4,3'),
    ('2,3', '1,3'), ('2,3', '3,3'), ('2,3', '2,4'),
    ('3,3', '3,4'),
]

BIOME_WALL = {'kristall': 'R', 'unterwelt': 'R', 'sumpf': '~', 'hain': '#',
              'mond': '#', 'wueste': '#', 'sternen': '#', 'bibliothek': '#', 'asche': '#'}
BIOME_FLOOR = {'wueste': 's', 'sumpf': '.', 'hain': '.', 'mond': '.',
               'kristall': '.', 'unterwelt': '.', 'sternen': '.',
               'bibliothek': '.', 'asche': '.'}

ARCHES = {
    'cave': arch_cave, 'hall': arch_hall, 'maze': arch_maze, 'open': arch_open,
    'islands': arch_islands, 'ruin': arch_ruin, 'canyon': arch_canyon,
    'terrace': arch_terrace, 'grove': arch_grove, 'chasm': arch_chasm,
    'chamber': arch_chamber,
}


def build(key, biome, arch, deco, seed):
    rng = random.Random(seed)
    wall = BIOME_WALL[biome]
    floor = BIOME_FLOOR[biome]
    fn = ARCHES[arch]
    if arch == 'cave':
        g = fn(rng, wall=wall, floor=floor)
    elif arch == 'islands':
        g = fn(rng, water=wall if wall == '~' else '~', floor=floor, deco=deco)
    elif arch == 'canyon':
        g = fn(rng, wall=wall, floor=floor)
    elif arch == 'chasm':
        g = fn(rng, wall=wall, floor=floor)
    elif arch == 'terrace':
        g = fn(rng, wall=wall, floor=floor)
    elif arch == 'grove':
        g = fn(rng, wall=wall, floor=floor, flora=tuple(deco))
    elif arch == 'chamber':
        g = fn(rng, wall=wall, floor=',', furn=tuple(deco))
    elif arch in ('hall', 'maze', 'ruin'):
        g = fn(rng, wall=wall, floor=floor)
    else:
        g = fn(rng, wall=wall, floor=floor, deco=deco)

    # Streu-Deko zusätzlich, damit auch gleiche Archetypen anders aussehen
    if deco and arch not in ('grove', 'chamber', 'islands'):
        for _ in range(rng.randrange(2, 6)):
            x, y = rng.randrange(1, RW - 1), rng.randrange(1, RH - 1)
            if g[y][x] == floor:
                g[y][x] = rng.choice(deco)
    return g


def open_edge(g, side, floor):
    """Durchgang drei breit und drei tief. Die Figur ist 42px hoch,
    ihre Fussbox ueberspannt zwei Kachelreihen. Zwei Reihen reichen
    deshalb nicht, sonst steht sie beim Betreten in der Wand."""
    if side == 'n':
        for x in (MX - 1, MX, MX + 1):
            for y in (0, 1, 2): g[y][x] = floor
    elif side == 's':
        for x in (MX - 1, MX, MX + 1):
            for y in (RH - 1, RH - 2, RH - 3): g[y][x] = floor
    elif side == 'w':
        for y in (MY - 1, MY, MY + 1):
            for x in (0, 1, 2): g[y][x] = floor
    else:
        for y in (MY - 1, MY, MY + 1):
            for x in (RW - 1, RW - 2, RW - 3): g[y][x] = floor


def carve(g, a, b, floor):
    """Verbindet zwei Punkte begehbar, damit nichts abgeschnitten bleibt."""
    (ax, ay), (bx, by) = a, b
    x, y = ax, ay
    while (x, y) != (bx, by):
        g[y][x] = floor if g[y][x] in SOLID else g[y][x]
        if x != bx:
            x += 1 if bx > x else -1
        elif y != by:
            y += 1 if by > y else -1
    g[by][bx] = floor if g[by][bx] in SOLID else g[by][bx]


def reachable(g, starts):
    """Kachel-Erreichbarkeit, nur fuer grobe Checks."""
    def free(x, y):
        return 0 <= x < RW and 0 <= y < RH and g[y][x] not in SOLID
    seen, q = set(), []
    for s in starts:
        if free(*s):
            seen.add(s); q.append(s)
    while q:
        x, y = q.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n in seen or not free(*n):
                continue
            seen.add(n); q.append(n)
    return seen


# ---- Pixel-genaue Simulation, identisch zur Spiel-Logik ----
TP = 40                       # Kachelgroesse in Pixeln
FW, FH = 360, RH * TP         # Spielfeld
def can_stand(g, nx, ny):
    """Vier Fusspunkte wie in canStand() im Spiel."""
    for px, py in ((nx + 7, ny + 30), (nx + 19, ny + 30),
                   (nx + 7, ny + 39), (nx + 19, ny + 39)):
        tx, ty = int(px // TP), int(py // TP)
        if 0 <= tx < RW and 0 <= ty < RH and g[ty][tx] in SOLID:
            return False
    return True


def pixel_reachable(g, entry_tiles):
    """Flutet in 4px-Schritten von den Eintrittspositionen aus."""
    starts = []
    for (tx, ty) in entry_tiles:
        starts.append((tx * TP + 4, ty * TP + 2))
    seen, q = set(), []
    for (sx, sy) in starts:
        gx, gy = round(sx / 4) * 4 + 2, round(sy / 4) * 4 + 2
        if can_stand(g, gx, gy):
            seen.add((gx, gy)); q.append((gx, gy))
    while q:
        x, y = q.pop()
        for dx, dy in ((4, 0), (-4, 0), (0, 4), (0, -4)):
            nx, ny = x + dx, y + dy
            if nx < 0 or ny < 0 or nx > FW - 26 or ny > FH - 42:
                continue
            if (nx, ny) in seen or not can_stand(g, nx, ny):
                continue
            seen.add((nx, ny)); q.append((nx, ny))
    return seen


def tiles_from_pixels(pix):
    """Welche Kachel-Felder sind von der Figur wirklich erreichbar?"""
    out = set()
    for (x, y) in pix:
        out.add((int((x + 13) // TP), int((y + 32) // TP)))
    return out


# --- Bauen ---
grids = {}
for i, (k, (biome, name, arch, deco)) in enumerate(sorted(ROOMS.items())):
    grids[k] = build(k, biome, arch, deco, seed=1000 + i * 37)

# Ränder dicht, dann Durchgänge öffnen
for k, (biome, name, arch, deco) in ROOMS.items():
    g = grids[k]
    wall = BIOME_WALL[biome]
    for x in (MX - 1, MX, MX + 1):
        g[0][x] = wall; g[RH - 1][x] = wall
    for y in (MY - 1, MY, MY + 1):
        g[y][0] = wall; g[y][RW - 1] = wall

DIRS = {(0, -1): ('n', 's'), (0, 1): ('s', 'n'), (-1, 0): ('w', 'o'), (1, 0): ('o', 'w')}
entries = {k: set() for k in ROOMS}
for a, b in LINKS:
    ax, ay = map(int, a.split(',')); bx, by = map(int, b.split(','))
    d = (bx - ax, by - ay)
    assert d in DIRS, f"{a}<->{b} nicht benachbart"
    sa, sb = DIRS[d]
    open_edge(grids[a], sa, BIOME_FLOOR[ROOMS[a][0]])
    open_edge(grids[b], sb, BIOME_FLOOR[ROOMS[b][0]])
    if d == (0, -1): entries[a].add((MX, 1)); entries[b].add((MX, RH - 2))
    elif d == (0, 1): entries[a].add((MX, RH - 2)); entries[b].add((MX, 1))
    elif d == (-1, 0): entries[a].add((1, MY)); entries[b].add((RW - 2, MY))
    else: entries[a].add((RW - 2, MY)); entries[b].add((1, MY))
entries['2,2'].add((MX, MY))

# Alle Eingänge eines Raums müssen untereinander verbunden sein
for k, g in grids.items():
    floor = BIOME_FLOOR[ROOMS[k][0]]
    pts = sorted(entries[k])
    for i in range(len(pts) - 1):
        reach = reachable(g, [pts[i]])
        if pts[i + 1] not in reach:
            carve(g, pts[i], pts[i + 1], floor)
    # Sicherstellen, dass genug Fläche erreichbar ist
    reach = tiles_from_pixels(pixel_reachable(g, pts))
    if len(reach) < 22:
        cx, cy = MX, MY
        for yy in range(cy - 3, cy + 4):
            for xx in range(cx - 2, cx + 3):
                if 1 <= xx < RW - 1 and 1 <= yy < RH - 1 and g[yy][xx] in SOLID:
                    g[yy][xx] = floor
        for i in range(len(pts)):
            carve(g, pts[i], (cx, cy), floor)

# Fragment-Plätze und NPC-Plätze aus erreichbaren Feldern
frag_spots, npc_spots, insch_spots = {}, {}, {}
for k, g in grids.items():
    rng = random.Random(sum(ord(ch) for ch in k) * 7919)
    pix = pixel_reachable(g, entries[k])
    reach = tiles_from_pixels(pix)
    cand = sorted([(x, y) for (x, y) in reach if 1 <= x <= RW - 2 and 1 <= y <= RH - 2])
    rng.shuffle(cand)
    picked, npcs, insch = [], [], []
    for c in cand:
        if len(picked) >= 4:
            break
        if all(abs(c[0] - p[0]) + abs(c[1] - p[1]) >= 3 for p in picked):
            picked.append(c)
    rest = [c for c in cand if c not in picked]
    for c in rest:
        if len(npcs) >= 1:
            break
        if all(abs(c[0] - p[0]) + abs(c[1] - p[1]) >= 3 for p in picked):
            npcs.append(c)
    rest2 = [c for c in rest if c not in npcs]
    for c in rest2:
        if len(insch) >= 3:
            break
        if all(abs(c[0] - p[0]) + abs(c[1] - p[1]) >= 3 for p in picked + npcs + insch):
            insch.append(c)
    frag_spots[k] = picked
    npc_spots[k] = npcs
    insch_spots[k] = insch

# Statistik
print(f"Räume: {len(grids)}")
for k in sorted(grids):
    g = grids[k]
    reach = len(tiles_from_pixels(pixel_reachable(g, entries[k])))
    solid = sum(1 for row in g for ch in row if ch in SOLID)
    print(f"  {k:5} {ROOMS[k][2]:8} {ROOMS[k][1][:26]:28} begehbar {reach:3}  fest {solid:3}")

total_frag = sum(len(v) for v in frag_spots.values())
total_insch = sum(len(v) for v in insch_spots.values())
print(f"\nFragment-Plätze {total_frag}, Inschriften-Plätze {total_insch}, NPC-Plätze {sum(len(v) for v in npc_spots.values())}")
leer = [k for k, v in frag_spots.items() if len(v) < 3]
if leer:
    print("  ⚠ wenig Platz in:", leer)
fehlend = [k for k in ROOMS if not npc_spots.get(k) or not insch_spots.get(k)]
if fehlend:
    print("  ⚠ NPC oder Inschrift fehlt in:", fehlend)

# --- JS ausgeben ---
out = ["  const rooms = {};"]
for k in sorted(grids):
    biome, name, arch, _ = ROOMS[k]
    lines = ",\n".join("      '" + "".join(r) + "'" for r in grids[k])
    out.append(f"  rooms['{k}'] = {{ biome: '{biome}', name: '{name}', arch: '{arch}', tiles: [\n{lines},\n  ] }};")

def dump(name, data):
    out.append("")
    out.append(f"  const {name} = {{")
    for k in sorted(data):
        pts = ", ".join(f"[{x},{y}]" for x, y in data[k])
        out.append(f"    '{k}': [{pts}],")
    out.append("  };")

dump('autoFragSpots', frag_spots)
dump('autoNpcSpots', npc_spots)
dump('autoInschriften', insch_spots)
open('/tmp/arkana_rooms.js', 'w').write("\n".join(out))
print("→ /tmp/arkana_rooms.js")
