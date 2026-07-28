# -*- coding: utf-8 -*-
"""Ensembles fuer Arkana. Jedes ist von Hand gesetzt, nicht gewuerfelt.

Legende im Muster:
  ' '  egal, wird nicht angefasst
  '.'  muss begehbarer Boden sein und bleibt frei  (haelt Wege offen)
  sonst: Kachelzeichen aus 02_world.js, wird gesetzt

Jedes Ensemble nennt die Biome, in die es gehoert, und wie oft es
hoechstens vorkommen darf. So bleibt jede Region wiedererkennbar.
"""

ENSEMBLES = [
  # ---------------- Wueste, Sandtor, Duenen ----------------
  dict(name='Karawanenlager', biome=['wueste'], max=4, pat=[
    " ..8.. ",
    ".9...9.",
    ".A.L.C.",
    ".......",
    " .7.8. ",
  ]),
  dict(name='Duenenrast', biome=['wueste'], max=5, pat=[
    " .4. ",
    "4...5",
    ".. ..",
    "5...4",
    " .5. ",
  ]),
  dict(name='Sandtor', biome=['wueste','asche'], max=3, pat=[
    "9...9",
    "L.E.L",
    ".....",
    " ... ",
  ]),
  dict(name='Verwehtes Wrack', biome=['wueste'], max=3, pat=[
    " .5. ",
    "5.U.4",
    ".....",
    " 5.. ",
  ]),

  # ---------------- Aschenstadt, Markt ----------------
  dict(name='Marktreihe', biome=['asche'], max=4, pat=[
    "8.7.8.7",
    "O.O.O.O",
    ".......",
    "C.9.9.C",
  ]),
  dict(name='Brunnenplatz', biome=['asche','mond'], max=3, pat=[
    "L.....L",
    ".. 0 ..",
    ".......",
    "L.9.9.L",
  ]),
  dict(name='Hinterhof', biome=['asche'], max=5, pat=[
    "9999.99",
    "7.8...9",
    "C.....9",
    ".......",
  ]),
  dict(name='Gedenkstein', biome=['asche','sternen'], max=4, pat=[
    " 5.5 ",
    "..S..",
    "L...L",
    " ... ",
  ]),
  dict(name='Verfallenes Gehoeft', biome=['asche','hain'], max=4, pat=[
    "999.999",
    "9.....9",
    "9.3.8.9",
    "9.....9",
    "99...99",
  ]),

  # ---------------- Hain, Wurzelhain ----------------
  dict(name='Lichtung mit Schrein', biome=['hain','mond'], max=3, pat=[
    " 2...2 ",
    "2.....2",
    "...N...",
    "2.....2",
    " 2...2 ",
  ]),
  dict(name='Obstgarten', biome=['hain'], max=4, pat=[
    "9999999",
    "9.2.2.9",
    "9.....9",
    "9.2.2.9",
    "999.999",
  ]),
  dict(name='Waldweg', biome=['hain','mond'], max=6, pat=[
    "1.6.1.6.1",
    ".........",
    ".........",
    "6.1.6.1.6",
  ]),
  dict(name='Dickicht', biome=['hain'], max=6, pat=[
    " 66. ",
    "62.66",
    "6...6",
    ".6.2.",
    " .6. ",
  ]),
  dict(name='Koehlerplatz', biome=['hain'], max=3, pat=[
    " 3.3 ",
    "..L..",
    "8...7",
    ".....",
  ]),

  # ---------------- Mondgarten ----------------
  dict(name='Mondbeet', biome=['mond'], max=4, pat=[
    " .6. ",
    "6.P.6",
    "..N..",
    "6.P.6",
    " .6. ",
  ]),
  dict(name='Stiller Teich', biome=['mond','sumpf'], max=4, pat=[
    " QQ. ",
    "Q...Q",
    "..0..",
    "Q...Q",
    " .QQ ",
  ]),
  dict(name='Pilzring', biome=['mond','hain'], max=4, pat=[
    " P.P ",
    "P...P",
    ".....",
    "P...P",
    " P.P ",
  ]),

  # ---------------- Bibliothek ----------------
  dict(name='Lesenische', biome=['bibliothek'], max=5, pat=[
    "J.J.J",
    ".O.O.",
    "L...L",
    ".....",
  ]),
  dict(name='Ruinensaal', biome=['bibliothek','sternen'], max=4, pat=[
    "F.....F",
    ".......",
    ".S...S.",
    ".......",
    "F.....F",
  ]),
  dict(name='Verbrannte Regale', biome=['bibliothek'], max=5, pat=[
    " J.J ",
    "J...J",
    "..3..",
    "J...J",
    " ... ",
  ]),

  # ---------------- Sternenwarte ----------------
  dict(name='Sternenzirkel', biome=['sternen'], max=3, pat=[
    "  F.F  ",
    " L...L ",
    "F..N..F",
    " L...L ",
    "  F.F  ",
  ]),
  dict(name='Beobachterplatz', biome=['sternen'], max=4, pat=[
    "9.L.9",
    ".....",
    "S...S",
    ".....",
  ]),

  # ---------------- Kristall, Unterwelt ----------------
  dict(name='Kristallzirkel', biome=['kristall'], max=4, pat=[
    " K.K ",
    "K...K",
    "..F..",
    "K...K",
    " K.K ",
  ]),
  dict(name='Kristallader', biome=['kristall'], max=6, pat=[
    "K.4..",
    ".K.K.",
    "4..K.",
    "..K..",
  ]),
  dict(name='Grabfeld', biome=['unterwelt','asche'], max=4, pat=[
    "9999999",
    "9H.H.H9",
    "9.....9",
    "9H.H.H9",
    "999E999",
  ]),
  dict(name='Bergmannslager', biome=['unterwelt','kristall'], max=4, pat=[
    " .L. ",
    "8...7",
    ".C...",
    "..4..",
  ]),

  # ---------------- Sumpf, Bucht ----------------
  dict(name='Schilfbucht', biome=['sumpf'], max=5, pat=[
    "QQ...QQ",
    "Q.....Q",
    "...U...",
    "Q.....Q",
    " QQ.QQ ",
  ]),
  dict(name='Sumpfsteg', biome=['sumpf'], max=5, pat=[
    "Q.Q.Q.Q",
    ".......",
    ".......",
    "Q.3.Q.3",
  ]),
  dict(name='Strandgut', biome=['sumpf','wueste'], max=4, pat=[
    " 5.7 ",
    "U....",
    ".....",
    " 8.5 ",
  ]),
]

# Die graue Stadt hat eigene Ensembles, gebaute Dinge statt Natur.
ENSEMBLES_STADT = [
  dict(name='Baustelle', biome=['stadt'], max=4, pat=[
    "9999.99",
    "9.7.8.9",
    "9.....9",
    ".......",
  ]),
  dict(name='Hinterhof', biome=['stadt'], max=6, pat=[
    "7.8.7",
    ".....",
    "C...9",
    ".....",
  ]),
  dict(name='Kleiner Park', biome=['stadt'], max=5, pat=[
    "9.9.9",
    ".2.6.",
    "L...L",
    ".....",
  ]),
  dict(name='Laternenreihe', biome=['stadt'], max=6, pat=[
    "L...L...L",
    ".........",
    ".........",
  ]),
  dict(name='Muellecke', biome=['stadt'], max=5, pat=[
    " 7.8 ",
    "8...7",
    ".....",
  ]),
]
