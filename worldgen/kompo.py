#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Komposition statt Streuung.

Die Objekte werden nicht mehr gleichmaessig verteilt, sondern in vier
Schichten gesetzt, die aufeinander aufbauen:

  1 Saum       Baeume, Felsen und Kisten legen sich an die Waende, in Laeufen
               statt einzeln. Das rahmt die offenen Flaechen ein.
  2 Ensemble   Von Hand entworfene Gruppen (Lager, Lichtung, Friedhof,
               Kristallzirkel). Jede hat innen freie Wege.
  3 Allee      Lange gerade Gassen bekommen beidseitig Laternen oder Baeume
               im festen Takt.
  4 Rahmung    Jeder Fundort, Schrein, jede Inschrift und jede Figur bekommt
               eine kleine Fassung, damit das Auge sie findet.

Danach ein Erreichbarkeitstest mit exakt der Spiel-Physik. Nichts wird
gesetzt, was einen Weg zerschneidet.
"""
import re, sys, math, random
from collections import deque
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from prefabs import ENSEMBLES, ENSEMBLES_STADT

TP = 40
SOLID = set('#RTWD~vcoxbfMi*') | set('1234679 0ACEFHJKLNPQSU'.replace(' ', ''))
BODEN = set('.,sgpr')
PFAD = ':'          # begehbarer Naturboden, darauf darf gebaut werden
BODEN_STADT = set('.,=g')


# ---------------------------------------------------------------- Physik
def can_stand(g, nx, ny, w, h):
    for px, py in ((nx+7, ny+30), (nx+19, ny+30), (nx+7, ny+39), (nx+19, ny+39)):
        tx, ty = px // TP, py // TP
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


def trennt(g, x, y, w, h):
    """Pixelgenau: wuerde ein festes Objekt hier den Raum zerschneiden."""
    x0, y0 = max(0, x-4)*TP, max(0, y-4)*TP
    x1, y1 = min(w-1, x+5)*TP, min(h-1, y+5)*TP
    free = [(px, py) for py in range(y0, y1, 4) for px in range(x0, x1, 4)
            if can_stand(g, px, py, w, h)]
    if len(free) < 2: return False
    fs = set(free); seen = {free[0]}; q = deque([free[0]])
    while q:
        cx, cy = q.popleft()
        for dx, dy in ((4,0),(-4,0),(0,4),(0,-4)):
            n = (cx+dx, cy+dy)
            if n in fs and n not in seen: seen.add(n); q.append(n)
    return len(seen) != len(fs)


# Womit eine Flur bepflanzt wird. 'dicht' fuer Haine und Reihen,
# 'stein' fuer Geroell und Ruinen, 'solo' fuer den einen grossen Akzent.
FLUR_PAL = {
  'asche':      dict(dicht=list('3956'), stein=list('4455H'), solo=list('SF0'), klein=list('578')),
  'bibliothek': dict(dicht=list('J3J'),  stein=list('44H5'),  solo=list('SFN'), klein=list('5J8')),
  'hain':       dict(dicht=list('22161'), stein=list('455'),  solo=list('N02'), klein=list('656')),
  'kristall':   dict(dicht=list('K4K'),  stein=list('4455'),  solo=list('FKN'), klein=list('55K')),
  'mond':       dict(dicht=list('62P6'), stein=list('455'),   solo=list('N0P'), klein=list('665')),
  'sternen':    dict(dicht=list('4F45'), stein=list('4455'),  solo=list('FSN'), klein=list('55L')),
  'sumpf':      dict(dicht=list('QQ3Q'), stein=list('455U'),  solo=list('U0N'), klein=list('5Q5')),
  'unterwelt':  dict(dicht=list('4K45'), stein=list('44H5'),  solo=list('FSK'), klein=list('55H')),
  'wueste':     dict(dicht=list('3455'), stein=list('4455'),  solo=list('FAU'), klein=list('578')),
  'stadt':      dict(dicht=list('9786'), stein=list('5578'),  solo=list('C02'), klein=list('578')),
}


# ---------------------------------------------------------------- Welt
class Welt:
    def __init__(self, rows, biome_of, boden, tabu, start, rng):
        self.g = [list(r) for r in rows]
        self.H, self.W = len(rows), len(rows[0])
        self.biome_of = biome_of
        self.boden = boden
        self.tabu = tabu               # Felder, die frei bleiben muessen
        self.start = start
        self.rng = rng
        self.neu = {}                  # gesetzt -> vorheriges Zeichen
        self.pfad = set()              # das Wegenetz, bleibt immer frei
        self.belegt = set()            # von Ensembles beanspruchte Flaechen
        self.stat = {}

    def frei(self, x, y):
        return (0 <= x < self.W and 0 <= y < self.H
                and self.g[y][x] in self.boden and (x, y) not in self.tabu
                and (x, y) not in self.pfad)

    def setz(self, x, y, ch, gruppe):
        if not self.frei(x, y): return False
        if ch in SOLID and trennt(self.g, x, y, self.W, self.H): return False
        self.neu[(x, y)] = self.g[y][x]
        self.g[y][x] = ch
        self.stat[gruppe] = self.stat.get(gruppe, 0) + 1
        return True

    def wand(self, x, y):
        if x < 0 or y < 0 or x >= self.W or y >= self.H: return True
        return self.g[y][x] in SOLID and (x, y) not in self.neu

    # ------------------------------------------------------ 0 Wegenetz
    def wegenetz(self, knoten, plaetze=(), breite2=0.10, platz_rand=None, mitte_von=None):
        """Verbindet alle Orte mit sichtbaren Pfaden. Erst dadurch bekommt die
        Karte eine Ordnung, an der sich alles andere ausrichten kann.
        Minimal aufspannender Baum ueber die Knoten, jede Kante als kuerzester
        begehbarer Weg. Dazu kleine Plaetze an den wichtigen Punkten."""
        self.pfad = set()
        erreichbar = [k for k in knoten if self.begehbar(*k)]
        if len(erreichbar) < 2: return
        # Minimal aufspannender Baum, damit kein Ort abgehaengt bleibt
        drin = {erreichbar[0]}
        draussen = set(erreichbar[1:])
        kanten = []
        while draussen:
            best, bd = None, 1e9
            for a2 in drin:
                for b2 in draussen:
                    d = abs(a2[0]-b2[0]) + abs(a2[1]-b2[1])
                    if d < bd: bd, best = d, (a2, b2)
            kanten.append(best); drin.add(best[1]); draussen.discard(best[1])
        for (a2, b2) in kanten:
            weg = self.kuerzester(a2, b2)
            if weg: self.male_pfad(weg, breite2)
        for (px, py) in plaetze:
            self.platz(px, py, self.rng.randint(2, 3), platz_rand)
            if mitte_von:
                self.wahrzeichen(px, py, mitte_von)

    def begehbar(self, x, y):
        return (0 <= x < self.W and 0 <= y < self.H
                and self.g[y][x] not in SOLID)

    def kuerzester(self, a, b):
        """Billigster Weg. Vorhandene Pfade kosten fast nichts, damit sich
        Wege buendeln statt parallel zu laufen."""
        import heapq
        start, ziel = a, b
        dist = {start: 0}
        vor = {}
        pq = [(0, start)]
        while pq:
            d, k = heapq.heappop(pq)
            if k == ziel: break
            if d > dist.get(k, 1e9): continue
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                n = (k[0]+dx, k[1]+dy)
                if not self.begehbar(*n): continue
                c = 1 if n in self.pfad else (3 if self.g[n[1]][n[0]] in self.boden else 9)
                nd = d + c
                if nd < dist.get(n, 1e9):
                    dist[n] = nd; vor[n] = k; heapq.heappush(pq, (nd, n))
        if ziel not in dist: return None
        weg, k = [], ziel
        while k != start: weg.append(k); k = vor[k]
        weg.append(start)
        return weg

    def male_pfad(self, weg, breite2):
        for (x, y) in weg:
            if self.g[y][x] in self.boden and (x, y) not in self.tabu:
                self.g[y][x] = PFAD
            self.pfad.add((x, y))
            if self.rng.random() < breite2:
                for dx, dy in ((1,0),(0,1)):
                    nx, ny = x+dx, y+dy
                    if (self.begehbar(nx, ny) and self.g[ny][nx] in self.boden
                            and (nx, ny) not in self.tabu):
                        self.g[ny][nx] = PFAD; self.pfad.add((nx, ny)); break

    def platz(self, cx, cy, r, rand=None):
        """Ein runder Platz mit gesetztem Rand. Ohne Fassung bleibt er ein
        Fleck, mit Fassung wird er ein Ort."""
        innen, saum = [], []
        for dy in range(-r-1, r+2):
            for dx in range(-r-1, r+2):
                d = dx*dx + dy*dy*1.35
                x, y = cx+dx, cy+dy
                if not (self.begehbar(x, y) and self.g[y][x] in self.boden
                        and (x, y) not in self.tabu): continue
                if d <= r*r: innen.append((x, y))
                elif d <= (r+1)*(r+1): saum.append((x, y))
        for (x, y) in innen:
            self.g[y][x] = PFAD; self.pfad.add((x, y))
        if rand:
            for i, (x, y) in enumerate(sorted(saum)):
                if i % 3: continue
                if self.setz(x, y, rand[i // 3 % len(rand)], 'Platzfassung'):
                    self.belegt.add((x, y))

    # ------------------------------------------------------ 1b Wegsaum
    def wegsaum(self, palette, takt=4, streu=0.30):
        """Baeume und Laternen begleiten die Wege. Erst dadurch liest sich ein
        Pfad als Allee und nicht als Farbstreifen."""
        rand = []
        for (x, y) in sorted(self.pfad):
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                n = (x+dx, y+dy)
                if n in self.pfad: continue
                if self.frei(*n) and n not in self.belegt: rand.append((n, (x, y)))
        gesehen = set()
        for i, (n, ursprung) in enumerate(rand):
            if n in gesehen: continue
            gesehen.add(n)
            pal = palette.get(self.biome_of(*n))
            if not pal: continue
            # Takt entlang des Weges plus etwas Streuung, damit es nicht
            # wie eine Zahnreihe aussieht
            takt_hit = ((ursprung[0] + ursprung[1]) % takt == 0)
            if not takt_hit and self.rng.random() > streu: continue
            ch = pal[0] if takt_hit else self.rng.choice(pal[1:] or pal)
            if self.setz(*n, ch, 'Wegsaum'): self.belegt.add(n)

    def wahrzeichen(self, cx, cy, tabelle):
        """Ein Platz ohne Mitte bleibt eine Luecke. Das Wahrzeichen macht
        aus dem Platz eine Adresse, die man wiedererkennt."""
        stueck = tabelle.get(self.biome_of(cx, cy))
        if not stueck: return
        for (dx, dy) in ((0,0),(1,0),(0,1),(-1,0),(0,-1),(1,1),(-1,-1)):
            x, y = cx+dx, cy+dy
            if (x, y) in self.tabu or (x, y) in self.belegt: continue
            if not self.begehbar(x, y): continue
            alt = self.g[y][x]
            if alt != PFAD and alt not in self.boden: continue
            self.g[y][x] = stueck[0]
            if trennt(self.g, x, y, self.W, self.H):
                self.g[y][x] = alt; continue
            self.neu[(x, y)] = alt
            self.pfad.discard((x, y))
            self.belegt.add((x, y))
            self.stat['Wahrzeichen'] = self.stat.get('Wahrzeichen', 0) + 1
            # Kleine Begleitung, damit es nicht nackt dasteht
            for (ex, ey) in ((x-2, y), (x+2, y)):
                if self.frei(ex, ey) and (ex, ey) not in self.belegt:
                    if self.setz(ex, ey, stueck[1], 'Wahrzeichen'):
                        self.belegt.add((ex, ey))
            return

    # ------------------------------------------------------ 1 Saum
    def saum(self, palette, laenge=(2, 5), luecke=(2, 6), tiefe2=0.35):
        """Folgt jeder Wandkante und pflanzt in Laeufen. So entsteht eine
        Hecke oder eine Geroellhalde, kein gleichmaessiger Punktnebel."""
        for achse in ('h', 'v'):
            koords = (range(self.H), range(self.W)) if achse == 'h' else (range(self.W), range(self.H))
            for a in koords[0]:
                lauf, rest = 0, self.rng.randint(*luecke)
                for b in koords[1]:
                    x, y = (b, a) if achse == 'h' else (a, b)
                    an_wand = self.wand(x-1, y) or self.wand(x+1, y) or self.wand(x, y-1) or self.wand(x, y+1)
                    if not an_wand or not self.frei(x, y):
                        lauf, rest = 0, self.rng.randint(*luecke); continue
                    if rest > 0: rest -= 1; continue
                    pal = palette.get(self.biome_of(x, y))
                    if not pal: continue
                    if lauf == 0: lauf = self.rng.randint(*laenge)
                    if self.setz(x, y, self.rng.choice(pal), 'Saum'):
                        # gelegentlich eine zweite Reihe nach innen, gibt Tiefe
                        if self.rng.random() < tiefe2:
                            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                                if self.wand(x-dx, y-dy) and self.frei(x+dx, y+dy):
                                    self.setz(x+dx, y+dy, self.rng.choice(pal), 'Saum'); break
                    lauf -= 1
                    if lauf <= 0: rest = self.rng.randint(*luecke)

    # ------------------------------------------------------ 2 Ensembles
    def ensembles(self, liste, abstand=9, toleranz=0.25):
        """Reihum, damit jede Sorte drankommt und keine Region eintoenig wird.
        Die mit '.' markierten Wegzellen duerfen zu einem Teil auch Fels sein,
        dann schmiegt sich das Ensemble an das Gelaende."""
        mitten = []
        stellen = [(x, y) for y in range(2, self.H-2) for x in range(2, self.W-2)]
        self.rng.shuffle(stellen)
        zaehler = {e['name']: 0 for e in liste}
        offen = list(liste)
        runde = 0
        while offen:
            runde += 1
            if runde > 60: break
            naechste = []
            for ens in offen:
                if zaehler[ens['name']] >= ens['max']: continue
                if self.versuche(ens, stellen, mitten, abstand, toleranz):
                    zaehler[ens['name']] += 1
                    naechste.append(ens)
            offen = naechste
        return zaehler

    def versuche(self, ens, stellen, mitten, abstand, toleranz):
        pat = ens['pat']
        ph, pw = len(pat), max(len(r) for r in pat)
        for (x, y) in stellen:
            if x + pw >= self.W-1 or y + ph >= self.H-1: continue
            mitte = (x + pw//2, y + ph//2)
            if self.biome_of(*mitte) not in ens['biome']: continue
            if any(abs(mitte[0]-m[0]) + abs(mitte[1]-m[1]) < abstand for m in mitten): continue
            zellen, weg_frei, weg_ges, ok = [], 0, 0, True
            for j in range(ph):
                for i in range(len(pat[j])):
                    c = pat[j][i]
                    if c == ' ': continue
                    px, py = x+i, y+j
                    if (px, py) in self.belegt or (px, py) in self.tabu: ok = False; break
                    if c == '.':
                        weg_ges += 1
                        if self.frei(px, py): weg_frei += 1; zellen.append((px, py, c))
                    else:
                        if not self.frei(px, py): ok = False; break
                        zellen.append((px, py, c))
                if not ok: break
            if not ok: continue
            if weg_ges and (weg_ges - weg_frei) / weg_ges > toleranz: continue
            for (px, py, c) in zellen:
                self.belegt.add((px, py))
                if c != '.': self.setz(px, py, c, 'Ensemble: ' + ens['name'])
            mitten.append(mitte)
            return True
        return False

    # ------------------------------------------------------ 3 Alleen
    def alleen(self, palette, minlen=7, takt=3):
        """Lange gerade freie Gassen bekommen beidseitig Takt."""
        for achse in ('h', 'v'):
            aussen = range(self.H) if achse == 'h' else range(self.W)
            innen = range(self.W) if achse == 'h' else range(self.H)
            for a in aussen:
                lauf = []
                for b in list(innen) + [None]:
                    ok = False
                    if b is not None:
                        x, y = (b, a) if achse == 'h' else (a, b)
                        seiten = ((x, y-1), (x, y+1)) if achse == 'h' else ((x-1, y), (x+1, y))
                        # Eine Gasse ist nur eine Gasse, wenn seitlich in
                        # Sichtweite eine Wand steht. Auf freiem Feld wuerde
                        # der Takt sonst zu einem Raster zerfallen.
                        eng = False
                        for d in (2, 3, 4):
                            a1 = (x, y-d) if achse == 'h' else (x-d, y)
                            a2 = (x, y+d) if achse == 'h' else (x+d, y)
                            if self.wand(*a1) and self.wand(*a2): eng = True; break
                        ok = (eng and self.frei(x, y) and (x, y) not in self.belegt
                              and all(self.frei(*s) for s in seiten))
                    if ok: lauf.append((x, y))
                    else:
                        if len(lauf) >= minlen:
                            pal = palette.get(self.biome_of(*lauf[len(lauf)//2]))
                            if pal:
                                for k, (lx, ly) in enumerate(lauf):
                                    if k % takt: continue
                                    if k == 0 or k == len(lauf)-1: continue
                                    s1, s2 = (((lx, ly-1), (lx, ly+1)) if achse == 'h'
                                              else ((lx-1, ly), (lx+1, ly)))
                                    ch = pal[(k // takt) % len(pal)]
                                    self.setz(*s1, ch, 'Allee')
                                    self.setz(*s2, ch, 'Allee')
                                    self.belegt.update([s1, s2, (lx, ly)])
                        lauf = []

    # ------------------------------------------------------ 3b Fluren
    def fluren(self, charakter, raster=7):
        """Das offene Feld bekommt eine Gliederung. Punkte im lockeren Raster,
        jeder Punkt wird zu einer Flur mit eigenem Charakter: dichter Hain,
        leere Wiese, Steinfeld, Baumreihe, Solitaer. Erst der Wechsel aus
        Fuelle und Leere laesst eine Landschaft gestaltet wirken."""
        punkte = []
        for y in range(3, self.H-3, raster):
            for x in range(3, self.W-3, raster):
                px = x + self.rng.randint(-2, 2)
                py = y + self.rng.randint(-2, 2)
                if self.frei(px, py) and (px, py) not in self.belegt:
                    punkte.append((px, py))
        self.rng.shuffle(punkte)
        for (x, y) in punkte:
            bio = self.biome_of(x, y)
            ch = charakter.get(bio)
            if not ch: continue
            art = self.rng.choices([a for a, _ in ch], [g for _, g in ch])[0]
            getattr(self, '_flur_' + art)(x, y, bio)

    def _pflanzen(self, bio):
        return FLUR_PAL[bio]

    def _flur_wiese(self, x, y, bio):
        pass                                    # bewusst leer, das ist der Atem

    def _flur_hain(self, x, y, bio):
        """Dichte Gruppe mit freier Mitte, wie eine Lichtung im Wald."""
        pal = self._pflanzen(bio)['dicht']
        n = self.rng.randint(6, 13)
        rad = self.rng.randint(2, 4)
        gesetzt = 0
        for _ in range(n * 4):
            if gesetzt >= n: break
            a = self.rng.random() * 6.283
            r = rad + self.rng.random() * 1.6
            px, py = x + round(math.cos(a) * r), y + round(math.sin(a) * r * 0.8)
            if abs(px-x) + abs(py-y) < 2: continue          # Mitte bleibt frei
            if (px, py) in self.belegt: continue
            if self.setz(px, py, self.rng.choice(pal), 'Flur: Hain'):
                self.belegt.add((px, py)); gesetzt += 1

    def _flur_reihe(self, x, y, bio):
        """Eine Baumreihe. Liest sich wie ein alter Weg oder eine Grenze."""
        pal = self._pflanzen(bio)['dicht']
        dx, dy = self.rng.choice([(1,0),(0,1),(1,1),(1,-1)])
        n = self.rng.randint(4, 8)
        luecke = self.rng.randint(3, 6)
        for k in range(n):
            if k == luecke: continue                        # Durchlass
            px, py = x + dx*k, y + dy*k
            if (px, py) in self.belegt: continue
            if self.setz(px, py, pal[k % len(pal)], 'Flur: Reihe'):
                self.belegt.add((px, py))

    def _flur_steinfeld(self, x, y, bio):
        pal = self._pflanzen(bio)['stein']
        n = self.rng.randint(3, 7)
        a0 = self.rng.random() * 6.283
        for k in range(n):
            a = a0 + k * 0.7
            r = 1.5 + k * 0.5
            px, py = x + round(math.cos(a)*r), y + round(math.sin(a)*r*0.8)
            if (px, py) in self.belegt: continue
            if self.setz(px, py, self.rng.choice(pal), 'Flur: Steinfeld'):
                self.belegt.add((px, py))

    def _flur_solitaer(self, x, y, bio):
        """Ein grosses Stueck allein, mit kleinem Gefolge. Setzt einen Akzent."""
        p = self._pflanzen(bio)
        if not self.setz(x, y, self.rng.choice(p['solo']), 'Flur: Solitaer'): return
        self.belegt.add((x, y))
        for _ in range(self.rng.randint(1, 3)):
            dx, dy = self.rng.randint(-2, 2), self.rng.randint(-2, 2)
            if abs(dx) + abs(dy) < 2: continue
            if (x+dx, y+dy) in self.belegt: continue
            if self.setz(x+dx, y+dy, self.rng.choice(p['klein']), 'Flur: Solitaer'):
                self.belegt.add((x+dx, y+dy))

    def _flur_ruine(self, x, y, bio):
        """Ein angedeuteter Grundriss. Erzaehlt, dass hier mal etwas stand."""
        p = self._pflanzen(bio)
        w = self.rng.randint(3, 5); h = self.rng.randint(2, 4)
        luecke = self.rng.randint(0, w-1)
        for i in range(w):
            for j in (0, h):
                if i == luecke and j == 0: continue
                px, py = x+i, y+j
                if (px, py) in self.belegt: continue
                if self.setz(px, py, self.rng.choice(p['stein']), 'Flur: Ruine'):
                    self.belegt.add((px, py))
        for j in range(1, h):
            for i in (0, w):
                px, py = x+i, y+j
                if (px, py) in self.belegt: continue
                if self.rng.random() < 0.65 and self.setz(px, py, self.rng.choice(p['stein']), 'Flur: Ruine'):
                    self.belegt.add((px, py))

    # ------------------------------------------------------ 4 Rahmung
    def rahme(self, punkte, links_rechts, hinten=None, gruppe='Rahmung'):
        """Setzt eine kleine Fassung um einen Fundort, damit er auffaellt."""
        for (x, y) in punkte:
            pal = links_rechts.get(self.biome_of(x, y)) if isinstance(links_rechts, dict) else links_rechts
            if not pal: continue
            for dx in (-2, 2):
                if self.frei(x+dx, y) and (x+dx, y) not in self.belegt:
                    self.setz(x+dx, y, pal[0], gruppe)
            if hinten:
                hp = hinten.get(self.biome_of(x, y)) if isinstance(hinten, dict) else hinten
                if hp:
                    for dx in (-1, 0, 1):
                        if self.frei(x+dx, y-2) and (x+dx, y-2) not in self.belegt:
                            self.setz(x+dx, y-2, hp[0], gruppe)

    # ------------------------------------------------------ Abschluss
    def pruefe_und_repariere(self, vorher):
        for _ in range(300):
            jetzt = reach_px(self.g, self.start, self.W, self.H)
            verloren = {q for q in vorher if q not in jetzt
                        and can_stand(self.g, q[0], q[1], self.W, self.H)}
            if not verloren: return 0, len(jetzt)
            vt = {(q[0]//TP, q[1]//TP) for q in verloren}
            jt = {(q[0]//TP, q[1]//TP) for q in jetzt}
            wahl = None
            for k in self.neu:
                umf = [(k[0]+dx, k[1]+dy) for dx in (-1,0,1) for dy in (-1,0,1)]
                if any(u in vt for u in umf) and any(u in jt for u in umf): wahl = k; break
            if wahl is None:
                for k in self.neu:
                    if any((k[0]+dx, k[1]+dy) in vt for dx in (-2,-1,0,1,2) for dy in (-2,-1,0,1,2)):
                        wahl = k; break
            if wahl is None: break
            self.g[wahl[1]][wahl[0]] = self.neu.pop(wahl)
        jetzt = reach_px(self.g, self.start, self.W, self.H)
        verloren = {q for q in vorher if q not in jetzt
                    and can_stand(self.g, q[0], q[1], self.W, self.H)}
        assert not verloren, 'Karte trennt %d Positionen ab' % len(verloren)
        return 0, len(jetzt)
