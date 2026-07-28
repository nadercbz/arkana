#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Setzt die Objekte in src/07_bigmap.js. Erst Arkana, dann die graue Stadt.
Beide Karten werden vorher auf den Rohstand der Terrain-Generatoren
zurueckgesetzt, damit das Ergebnis reproduzierbar bleibt."""
import re, os, sys, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kompo import Welt, reach_px, BODEN, BODEN_STADT
from prefabs import ENSEMBLES, ENSEMBLES_STADT

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', 'src', '07_bigmap.js')

BK = ['asche','bibliothek','hain','kristall','mond','sternen','sumpf','unterwelt','wueste']

# Was sich an die Waende legt. Je Biom eine eigene Handschrift.
SAUM = {
  'asche':      list('4573'), 'bibliothek': list('J4H3'),
  'hain':       list('12266'), 'kristall':   list('4K45'),
  'mond':       list('6266P'), 'sternen':    list('4F45'),
  'sumpf':      list('Q3QU'),  'unterwelt':  list('44K5'),
  'wueste':     list('4453'),
}
SAUM_STADT = {'stadt': list('L78L99')}

# Was die Alleen taktet
ALLEE = {
  'asche': list('L9'), 'bibliothek': list('LJ'), 'hain': list('12'),
  'kristall': list('LK'), 'mond': list('6P'), 'sternen': list('LF'),
  'sumpf': list('QQ'), 'unterwelt': list('L4'), 'wueste': list('L9'),
}
ALLEE_STADT = {'stadt': list('L9')}

# Was die Wege begleitet. Erstes Zeichen kommt im Takt, der Rest streut.
WEGSAUM = {
  'asche':      list('L953'), 'bibliothek': list('LJ45'),
  'hain':       list('12665'), 'kristall':   list('LK45'),
  'mond':       list('L6P5'), 'sternen':    list('LF45'),
  'sumpf':      list('QQ35'), 'unterwelt':  list('L4K5'),
  'wueste':     list('L9455'),
}
WEGSAUM_STADT = {'stadt': list('L978')}

# Fassungen um die Fundorte
FASSUNG = {b: ['L'] for b in BK}
FASSUNG['hain'] = ['6']; FASSUNG['mond'] = ['P']; FASSUNG['sumpf'] = ['Q']
FASSUNG['kristall'] = ['K']; FASSUNG['unterwelt'] = ['4']

# Die Mitte jedes Platzes. Erst das Wahrzeichen macht aus einer Flaeche
# einen Ort, den man wiedererkennt und beschreiben kann.
WAHRZEICHEN = {
  'asche':      ['0', 'L'],   # Brunnen
  'bibliothek': ['S', 'J'],   # sitzende Statue zwischen Buechern
  'hain':       ['N', '6'],   # Schrein im Gruen
  'kristall':   ['F', 'K'],   # Obelisk im Kristallfeld
  'mond':       ['0', 'P'],   # Brunnen mit Pilzlicht
  'sternen':    ['F', 'L'],   # Obelisk unter dem Himmel
  'sumpf':      ['U', 'Q'],   # gestrandetes Wrack im Schilf
  'unterwelt':  ['F', 'H'],   # Obelisk zwischen Graebern
  'wueste':     ['E', 'L'],   # Torbogen im Sand
}

# Welchen Charakter die Fluren je Biom haben duerfen und wie oft.
# Die Wiese ist bewusst stark gewichtet: ohne Leere keine Komposition.
CHARAKTER = {
  'asche':      [('wiese',34),('ruine',22),('steinfeld',18),('solitaer',14),('reihe',8),('hain',4)],
  'bibliothek': [('wiese',34),('ruine',24),('solitaer',16),('steinfeld',14),('reihe',8),('hain',4)],
  'hain':       [('wiese',26),('hain',30),('reihe',18),('solitaer',14),('steinfeld',8),('ruine',4)],
  'kristall':   [('wiese',32),('hain',22),('steinfeld',22),('solitaer',14),('reihe',6),('ruine',4)],
  'mond':       [('wiese',30),('hain',26),('reihe',16),('solitaer',16),('steinfeld',8),('ruine',4)],
  'sternen':    [('wiese',38),('solitaer',20),('steinfeld',18),('ruine',12),('reihe',8),('hain',4)],
  'sumpf':      [('wiese',26),('hain',30),('reihe',14),('solitaer',12),('steinfeld',10),('ruine',8)],
  'unterwelt':  [('wiese',32),('steinfeld',26),('ruine',18),('solitaer',14),('hain',6),('reihe',4)],
  'wueste':     [('wiese',44),('steinfeld',22),('solitaer',16),('ruine',10),('reihe',6),('hain',2)],
}
CHARAKTER_STADT = {
  'stadt': [('wiese',40),('ruine',20),('solitaer',18),('steinfeld',12),('reihe',10)],
}


def lade(pfad, block):
    s = open(pfad, encoding='utf-8').read()
    alle = list(re.finditer(r"const tiles = \[\n((?:    '[^\n]*\n)+)  \];", s))
    m = alle[0] if block == 'arkana' else alle[-1]
    rows = [l.strip().rstrip(',').strip("'") for l in m.group(1).rstrip().split('\n')]
    return s, m, rows


def rohstand():
    """Terrain aus den Generatoren zurueckholen, Objekte verwerfen."""
    for gen, block in (('/tmp/arkana_bigmap.js', 'arkana'), ('/tmp/arkana_city.js', 'stadt')):
        if not os.path.exists(gen): continue
        g = open(gen).read()
        gt = re.search(r"const tiles = \[\n(?:    '[^\n]*\n)+  \];", g).group(0)
        s, m, _ = lade(ZIEL, block)
        open(ZIEL, 'w', encoding='utf-8').write(s[:m.start()] + gt + s[m.end():])


def spots(s, ab, namen):
    aus = []
    for nm in namen:
        mm = re.search(r'const %s = \[(.*?)\];' % nm, s[ab:], re.S)
        if mm: aus += [(int(a), int(b)) for a, b in re.findall(r'\[(\d+),\s*(\d+)\]', mm.group(1))]
    return aus


def schreibe(block, g):
    s, m, _ = lade(ZIEL, block)
    nt = "const tiles = [\n" + "".join("    '" + "".join(r) + "',\n" for r in g) + "  ];"
    open(ZIEL, 'w', encoding='utf-8').write(s[:m.start()] + nt + s[m.end():])


def bericht(w, name, vorher, nachher):
    print('\n%s' % name)
    for k in sorted(w.stat, key=lambda k: -w.stat[k]):
        print('   %-34s %3d' % (k, w.stat[k]))
    print('   %-34s %3d' % ('GESAMT', sum(w.stat.values())))
    print('   Wegkacheln %d' % len(w.pfad))
    print('   begehbare Positionen %d -> %d (%.1f%% belegt)'
          % (vorher, nachher, 100*(vorher-nachher)/vorher))


def baue_arkana():
    s, m, rows = lade(ZIEL, 'arkana')
    mb = re.search(r"const biomeMap = \[\n((?:    '[^\n]*\n)+)  \];", s)
    brows = [l.strip().rstrip(',').strip("'") for l in mb.group(1).rstrip().split('\n')]
    biome_of = lambda x, y: BK[int(brows[y][x])]

    interaktiv = spots(s, 0, ('fragSpots','inschriftSpots','npcSpots','shrineSpots'))
    tabu = set()
    for (x, y) in interaktiv:
        for dy in range(-1, 2):
            for dx in range(-1, 2): tabu.add((x+dx, y+dy))
    ms = re.search(r'const START = \[(\d+), (\d+)\];', s)
    START = (int(ms.group(1)), int(ms.group(2)))
    for dy in range(-3, 4):
        for dx in range(-3, 4): tabu.add((START[0]//40+dx, START[1]//40+dy))

    rng = random.Random(777)
    w = Welt(rows, biome_of, BODEN, tabu, START, rng)
    vorher = reach_px(w.g, START, w.W, w.H)

    # Knoten des Wegenetzes: alle Regionsmitten, alle Orte, die man findet
    regs = [(int(a), int(b)) for a, b in
            re.findall(r"x: (\d+), y: (\d+), r:", s)]
    # Nur die Orte kommen ins Netz, an denen jemand steht oder etwas steht.
    # Die Fundstuecke bleiben abseits, sonst gaebe es nichts zu suchen.
    orte = spots(s, 0, ('npcSpots', 'shrineSpots', 'inschriftSpots'))
    knoten = regs + orte + [(START[0]//40, START[1]//40)]
    w.wegenetz(knoten, plaetze=regs + spots(s, 0, ('shrineSpots',)),
               platz_rand=list('L4L5'), mitte_von=WAHRZEICHEN)
    w.saum(SAUM, laenge=(3, 6), luecke=(2, 5), tiefe2=0.4)
    w.wegsaum(WEGSAUM, takt=3, streu=0.34)
    ens = w.ensembles(ENSEMBLES, abstand=9)
    w.fluren(CHARAKTER, raster=7)
    w.alleen(ALLEE, minlen=8, takt=4)
    w.rahme(interaktiv, FASSUNG)

    _, n = w.pruefe_und_repariere(vorher)
    bericht(w, 'ARKANA', len(vorher), n)
    print('   Ensembles: ' + ', '.join('%s %d' % (k, v) for k, v in sorted(ens.items()) if v))
    schreibe('arkana', w.g)


def baue_stadt():
    s, m, rows = lade(ZIEL, 'stadt')
    ab = m.start()
    interaktiv = spots(s, ab, ('npcSpots','LADEN'))
    tabu = set()
    for (x, y) in interaktiv:
        for dy in range(-1, 2):
            for dx in range(-1, 2): tabu.add((x+dx, y+dy))
    ms = re.search(r'const START = \[(\d+), (\d+)\];', s[ab:])
    START = (int(ms.group(1)), int(ms.group(2)))
    for dy in range(-3, 4):
        for dx in range(-3, 4): tabu.add((START[0]//40+dx, START[1]//40+dy))

    rng = random.Random(5150)
    w = Welt(rows, lambda x, y: 'stadt', BODEN_STADT, tabu, START, rng)
    vorher = reach_px(w.g, START, w.W, w.H)

    # Die Stadt hat ihr Wegenetz schon: die Strassen sind das Raster.
    # Hier arbeitet der Saum an den Fassaden, das ist die Stadtkante.
    w.saum(SAUM_STADT, laenge=(2, 5), luecke=(2, 4), tiefe2=0.25)
    ens = w.ensembles(ENSEMBLES_STADT, abstand=6)
    w.fluren(CHARAKTER_STADT, raster=6)
    w.alleen(ALLEE_STADT, minlen=9, takt=5)
    w.rahme(interaktiv, {'stadt': ['L']})

    _, n = w.pruefe_und_repariere(vorher)
    bericht(w, 'DIE GRAUE STADT', len(vorher), n)
    print('   Ensembles: ' + ', '.join('%s %d' % (k, v) for k, v in sorted(ens.items()) if v))
    schreibe('stadt', w.g)


if __name__ == '__main__':
    rohstand()
    baue_arkana()
    baue_stadt()
