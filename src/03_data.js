'use strict';
// ============================================================
// ARKANA Data: Signatur, Karten (15x22 Hochformat), Dialoge
// ============================================================

G.FRAGMENTS = __FRAGMENTS_PLACEHOLDER__;

// --- Sternzeichen ---
G.ZODIAC = [
  { name: 'Widder', sym: '♈', element: 'Feuer', planet: 'Mars', licht: 'Mut und Aufbruch', schatten: 'Ungeduld' },
  { name: 'Stier', sym: '♉', element: 'Erde', planet: 'Venus', licht: 'Beständigkeit', schatten: 'Starrheit' },
  { name: 'Zwillinge', sym: '♊', element: 'Luft', planet: 'Merkur', licht: 'Neugier', schatten: 'Zerstreuung' },
  { name: 'Krebs', sym: '♋', element: 'Wasser', planet: 'Mond', licht: 'Fürsorge', schatten: 'Rückzug' },
  { name: 'Löwe', sym: '♌', element: 'Feuer', planet: 'Sonne', licht: 'Herz und Würde', schatten: 'Stolz' },
  { name: 'Jungfrau', sym: '♍', element: 'Erde', planet: 'Merkur', licht: 'Klarheit', schatten: 'Zweifel' },
  { name: 'Waage', sym: '♎', element: 'Luft', planet: 'Venus', licht: 'Ausgleich', schatten: 'Unentschlossenheit' },
  { name: 'Skorpion', sym: '♏', element: 'Wasser', planet: 'Mars', licht: 'Tiefe', schatten: 'Kontrolle' },
  { name: 'Schütze', sym: '♐', element: 'Feuer', planet: 'Jupiter', licht: 'Weite und Sinn', schatten: 'Maßlosigkeit' },
  { name: 'Steinbock', sym: '♑', element: 'Erde', planet: 'Saturn', licht: 'Ausdauer', schatten: 'Härte' },
  { name: 'Wassermann', sym: '♒', element: 'Luft', planet: 'Saturn', licht: 'Freiheit', schatten: 'Distanz' },
  { name: 'Fische', sym: '♓', element: 'Wasser', planet: 'Jupiter', licht: 'Mitgefühl', schatten: 'Verlorenheit' },
];

G.SPIRITS = {
  Mars: { name: 'Funke', farbe: '#e8703f', wesen: 'ein rastloser Funke, der vorausdrängt' },
  Venus: { name: 'Lumen', farbe: '#7ec97e', wesen: 'ein warmes Licht, das Schönheit sucht' },
  Merkur: { name: 'Botin', farbe: '#ffd580', wesen: 'eine flinke Botin zwischen den Welten' },
  Mond: { name: 'Silber', farbe: '#c0d5e8', wesen: 'ein stilles Silberlicht, das mit den Gezeiten atmet' },
  Sonne: { name: 'Aur', farbe: '#ffa500', wesen: 'ein goldener Kern, der nicht erlischt' },
  Jupiter: { name: 'Weit', farbe: '#b89ee8', wesen: 'ein weiter Klang, der Türen größer macht' },
  Saturn: { name: 'Ring', farbe: '#9aa0ac', wesen: 'ein ruhiger Ring, der prüft, was bleibt' },
};

G.GIFTS = {
  1: { name: 'Pionier', text: 'Du öffnest, was verschlossen scheint.' },
  2: { name: 'Vermittler', text: 'Du hörst, was zwischen den Worten liegt.' },
  3: { name: 'Stimme', text: 'Deine Worte tragen weiter als du denkst.' },
  4: { name: 'Baumeister', text: 'Du erkennst das Fundament unter allem.' },
  5: { name: 'Wanderer', text: 'Wege zeigen sich dir, wo andere Mauern sehen.' },
  6: { name: 'Hüter', text: 'Was du beschützt, wächst.' },
  7: { name: 'Sucher', text: 'Verborgenes ruft nach dir.' },
  8: { name: 'Former', text: 'Du verstehst die Sprache der Kraft.' },
  9: { name: 'Vollender', text: 'Du siehst Kreise, wo andere Linien sehen.' },
  11: { name: 'Seher', text: 'Meisterzahl. Du empfängst, was noch nicht Form hat.' },
  22: { name: 'Weltenbauer', text: 'Meisterzahl. Du kannst Träume in Stein setzen.' },
  33: { name: 'Lehrer', text: 'Meisterzahl. Durch dich lernt das Muster sich selbst.' },
};

G.nameNumber = (name) => {
  const vals = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };
  const clean = name.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
  let sum = 0;
  for (const ch of clean) if (vals[ch]) sum += vals[ch];
  if (sum === 0) sum = 9;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, d) => a + Number(d), 0);
  }
  return sum;
};

G.saturnPhase = (age) => {
  if (age < 29.5) return { name: 'Der erste Ring', text: 'Deine Reise handelt vom Finden.' };
  if (age < 59) return { name: 'Die Rückkehr', text: 'Deine Reise handelt vom Wandeln.' };
  return { name: 'Der Weise', text: 'Deine Reise handelt vom Weitergeben.' };
};

G.makeSignature = (name, zodiacIdx, age) => {
  const z = G.ZODIAC[zodiacIdx];
  const num = G.nameNumber(name);
  return {
    name, age, zodiacIdx,
    zeichen: z.name, sym: z.sym, element: z.element, planet: z.planet,
    licht: z.licht, schatten: z.schatten,
    zahl: num, gabe: G.GIFTS[num],
    saturn: G.saturnPhase(age),
    spirit: G.SPIRITS[z.planet],
    farben: G.ELEMENT_COLORS[z.element],
    seed: G.hashStr(name.toLowerCase() + '|' + z.name + '|' + age),
  };
};

G.newState = () => ({
  sig: null,
  phase: 'prolog',
  area: 'stadt', room: '1,1', px: 167, py: 250,
  flags: {},
  fragmente: [],
  gelesen: {},
  stats: { schritte: 0, dialoge: 0, geglaubt: 0, geprueft: 0, inschriften: 0 },
});

// ============================================================
// KARTEN-BAUKASTEN
// Räume sind 9 Zeichen breit, 14 hoch (je 40px = 360x560).
// Der Baukasten garantiert korrekte Maße und Durchgänge.
// ============================================================
const RW = 9, RH = 14;
const MX = 4, MY = 7;   // Mitte, dort liegen die Durchgänge

function room(exits, fill = '.', wall = '#') {
  const g = [];
  for (let y = 0; y < RH; y++) {
    const row = [];
    for (let x = 0; x < RW; x++) {
      row.push((x === 0 || x === RW - 1 || y === 0 || y === RH - 1) ? wall : fill);
    }
    g.push(row);
  }
  // Durchgänge, 3 Felder breit, in der Kantenmitte
  if (exits.n) for (let x = MX - 1; x <= MX + 1; x++) g[0][x] = fill;
  if (exits.s) for (let x = MX - 1; x <= MX + 1; x++) g[RH - 1][x] = fill;
  if (exits.w) for (let y = MY - 1; y <= MY + 1; y++) g[y][0] = fill;
  if (exits.o) for (let y = MY - 1; y <= MY + 1; y++) g[y][RW - 1] = fill;
  return g;
}
function put(g, x, y, ch) { if (g[y] && g[y][x] !== undefined) g[y][x] = ch; }
function rect(g, x1, y1, x2, y2, ch) { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) put(g, x, y, ch); }
function hline(g, y, x1, x2, ch) { for (let x = x1; x <= x2; x++) put(g, x, y, ch); }
function vline(g, x, y1, y2, ch) { for (let y = y1; y <= y2; y++) put(g, x, y, ch); }
function toStrings(g) { return g.map((r) => r.join('')); }

// ------------------------------------------------------------
// PROLOG: die graue Stadt
// ------------------------------------------------------------
function buildStadt() {
  const rooms = {};

  // Zentrum: Kreuzung
  let g = room({ n: true, s: true, w: true, o: true });
  hline(g, 4, 1, 7, '='); hline(g, 9, 1, 7, '=');
  vline(g, 3, 1, 12, '='); vline(g, 5, 1, 12, '=');
  put(g, 1, 2, 'T'); put(g, 7, 2, 'T'); put(g, 1, 11, 'T'); put(g, 7, 11, 'T');
  rooms['1,1'] = toStrings(g);

  // Westen: Platz
  g = room({ o: true });
  hline(g, 3, 2, 6, '='); hline(g, 10, 2, 6, '=');
  put(g, 2, 6, 'T'); put(g, 6, 6, 'T');
  rooms['0,1'] = toStrings(g);

  // Osten: Gasse mit Häuserfront
  g = room({ w: true, s: true });
  rect(g, 1, 1, 3, 4, '#'); rect(g, 2, 2, 2, 3, 'W');
  rect(g, 5, 1, 7, 4, '#'); rect(g, 6, 2, 6, 3, 'W');
  vline(g, 4, 1, 12, '=');
  put(g, 2, 10, 'T'); put(g, 6, 10, 'T');
  rooms['2,1'] = toStrings(g);

  // Norden: Park am Wasser
  g = room({ s: true });
  rect(g, 1, 1, 7, 3, '~');
  put(g, 2, 6, 'T'); put(g, 6, 6, 'T'); put(g, 4, 10, 'T');
  hline(g, 8, 1, 7, '=');
  rooms['1,0'] = toStrings(g);

  // Süden: Ladenzeile mit dem flackernden Laden
  g = room({ n: true, o: true });
  rect(g, 2, 5, 6, 8, '#');
  rect(g, 3, 6, 5, 7, 'W');
  put(g, 4, 8, 'D');
  put(g, 1, 11, 'T'); put(g, 7, 11, 'T');
  rooms['1,2'] = toStrings(g);

  // Südost: Sackgasse, von Westen und von Norden erreichbar
  g = room({ w: true, n: true });
  rect(g, 2, 5, 6, 6, '#');
  put(g, 3, 10, 'T'); put(g, 5, 10, 'T');
  rooms['2,2'] = toStrings(g);

  return {
    pal: 'gray',
    rooms,
    npcs: {
      '1,1': [ { x: 2, y: 6, v: 0, dlg: 'stadt_pendler' }, { x: 6, y: 10, v: 1, dlg: 'stadt_meckerer' } ],
      '0,1': [ { x: 4, y: 6, v: 0, dlg: 'stadt_scroller' } ],
      '2,1': [ { x: 6, y: 7, v: 2, dlg: 'stadt_alte_frau' } ],
      '1,0': [ { x: 4, y: 5, v: 1, dlg: 'stadt_parkmann' } ],
      '1,2': [ { x: 2, y: 11, v: 3, dlg: 'stadt_kind' } ],
      '2,2': [ { x: 4, y: 8, v: 1, dlg: 'stadt_obdachloser' } ],
    },
    triggers: { '1,2': [ { x1: 3, y1: 8, x2: 5, y2: 8, event: 'laden' } ] },
    ambient: 'regen',
  };
}





// ------------------------------------------------------------
// ARKANA: 20 Räume, elf Layout-Archetypen, neun Habitate.
// Die Räume kommen aus dem Generator in /tmp/arkana_world.py und
// sind asymmetrisch: Höhlen, Labyrinthe, Inseln, Schluchten,
// Ruinen, Säulenhallen, Terrassen, Haine, Abgründe, Kammern.
// ------------------------------------------------------------
function buildAsche() {
  const rooms = {};
  rooms['0,1'] = { biome: 'sumpf', name: 'Ufer der Vergessenen', arch: 'islands', tiles: [
      '~~~~~~~~~',
      '~~~~~~~~~',
      '~~~~..~~~',
      '~~~....~~',
      '~~......~',
      '~~.....~~',
      '~~..w.w~~',
      '~~..w..~~',
      '~...w.g.~',
      '~~.....~~',
      '~~.....~~',
      '~~~...~~~',
      '~~~...~~~',
      '~~~...~~~',
  ] };
  rooms['0,2'] = { biome: 'sumpf', name: 'Nebelsumpf', arch: 'islands', tiles: [
      '~~~...~~~',
      '~~....~~~',
      '~.....~~~',
      '~~.~~~~~~',
      '~~w~~~~~~',
      '~~.~~~~~~',
      '~...~~...',
      '~........',
      '~........',
      '~~......~',
      '~~~~...~~',
      '~~~...~~~',
      '~~~...~~~',
      '~~~...~~~',
  ] };
  rooms['0,3'] = { biome: 'mond', name: 'Stille Bucht', arch: 'islands', tiles: [
      '~~~...~~~',
      '~~~...~~~',
      '~~....~~~',
      '~~...w~~~',
      '~~~.~w~~~',
      '~~~w~w~~~',
      '#~~w~.~~#',
      '#~.w...~#',
      '#...~.~~#',
      '.....w~~~',
      '~...~.~~~',
      '~~.w...~~',
      '~~~~~.~~~',
      '~~~###~~~',
  ] };
  rooms['1,0'] = { biome: 'mond', name: 'Halle der stillen Spiegel', arch: 'terrace', tiles: [
      '#########',
      '#..i....#',
      '#.iiii..#',
      '#...x...#',
      '#.......#',
      '#..iiii.#',
      '#.......#',
      '#.......#',
      '#....iii#',
      '#.......#',
      '#....iii#',
      '#.......#',
      '#.......#',
      '###...###',
  ] };
  rooms['1,1'] = { biome: 'bibliothek', name: 'Verbrannte Bibliothek', arch: 'maze', tiles: [
      '###...###',
      '##......#',
      '#.b.....#',
      '#.......#',
      '#..b....#',
      '#.#.....#',
      '#........',
      '#........',
      '#b.......',
      '#...f...#',
      '#.......#',
      '#.......#',
      '#......##',
      '#########',
  ] };
  rooms['1,2'] = { biome: 'hain', name: 'Wurzelhain', arch: 'grove', tiles: [
      '#########',
      '#....g..#',
      '#g......#',
      '#.pg....#',
      '#r......#',
      '#.......#',
      '.....r...',
      '.........',
      '.........',
      '#.......#',
      '#......g#',
      '#.......#',
      '#.....g.#',
      '###...###',
  ] };
  rooms['1,3'] = { biome: 'mond', name: 'Mondgarten', arch: 'grove', tiles: [
      '###...###',
      '#.......#',
      '#pp....g#',
      '#.p.....#',
      '#.......#',
      '#.i....i#',
      '#..p.....',
      '#...i....',
      '#w.......',
      '#.g.....#',
      '#..w....#',
      '#...p...#',
      '#.p.....#',
      '#########',
  ] };
  rooms['2,0'] = { biome: 'sternen', name: 'Sternenwarte', arch: 'chamber', tiles: [
      '#########',
      '#o,b,MMM#',
      '#,,,,,,,#',
      '#M,,,,,,#',
      '#,,,,,,M#',
      '#M,,,o,M#',
      '#M,,,,,,#',
      '#,,,,,,,#',
      '#o,,,,,o#',
      '#,,,,,,M#',
      '#,,,,,,b#',
      '#o,...,M#',
      '#M,...,M#',
      '###...###',
  ] };
  rooms['2,1'] = { biome: 'asche', name: 'Spiegelhof', arch: 'hall', tiles: [
      '###...###',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.......#',
      '#o..o.f.#',
      '.........',
      '.........',
      '.....o...',
      '#..x....#',
      '#.......#',
      '#o.....o#',
      '#.......#',
      '###...###',
  ] };
  rooms['2,2'] = { biome: 'asche', name: 'Aschenstadt', arch: 'ruin', tiles: [
      '###...###',
      '#.......#',
      '#.......#',
      '#.......#',
      '#.##.#..#',
      '#.##.#o.#',
      '...#.#...',
      '...#.....',
      '....#....',
      '#...###.#',
      '#...#.#.#',
      '#.....#.#',
      '#.......#',
      '###...###',
  ] };
  rooms['2,3'] = { biome: 'asche', name: 'Markt der Mustersucher', arch: 'open', tiles: [
      '###...###',
      '#.......#',
      '#.....o.#',
      '#.......#',
      '#.......#',
      '#......=#',
      '.........',
      '.........',
      '.........',
      '#.......#',
      '#..=....#',
      '#......=#',
      '#.=.....#',
      '###...###',
  ] };
  rooms['2,4'] = { biome: 'unterwelt', name: 'Die Tiefe', arch: 'chamber', tiles: [
      'RRR...RRR',
      'RMM...,fR',
      'RM,...,MR',
      'R,,,,,,,R',
      'R,,,,,,,R',
      'R,,,,M,,R',
      'R,,,,,,xR',
      'R,,,,,,MR',
      'RM,,,,,,R',
      'Rx,,,,,,R',
      'Rx,,,,,,R',
      'R,,,,,,xR',
      'RM,,x,fMR',
      'RRRRRRRRR',
  ] };
  rooms['3,0'] = { biome: 'kristall', name: 'Echokammer', arch: 'maze', tiles: [
      'RRRRRRRRR',
      'R.RM..RRR',
      'R.......R',
      'R..M....R',
      'R...M...R',
      'R.......R',
      'R.......R',
      'RR....M.R',
      'RR....M.R',
      'RR.R....R',
      'RR.R....R',
      'R.......R',
      'RR......R',
      'RRR...RRR',
  ] };
  rooms['3,1'] = { biome: 'kristall', name: 'Kristallkaverne', arch: 'cave', tiles: [
      'RRR...RRR',
      'R......RR',
      'R.......R',
      'R.......R',
      'RR......R',
      'R.......R',
      '....c...R',
      '........R',
      '........R',
      'R.......R',
      'R....c..R',
      'R.......R',
      'RR......R',
      'RRRRRRRRR',
  ] };
  rooms['3,2'] = { biome: 'wueste', name: 'Sandtor', arch: 'open', tiles: [
      '#########',
      '#sssssss#',
      '#sMsssss#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      'sssssssss',
      'sssssssss',
      'sssssssss',
      '#sssssss#',
      '#sxsssss#',
      '#sssssss#',
      '#sssssss#',
      '#########',
  ] };
  rooms['3,3'] = { biome: 'unterwelt', name: 'Glutschlund', arch: 'chasm', tiles: [
      'RRRRRRRRR',
      'R.......R',
      'R.......R',
      'R.......R',
      'Rvvvvv..R',
      'RBBBBB..R',
      '...vvv.fR',
      '...vvv..R',
      '...vvv..R',
      'R.......R',
      'R.......R',
      'R.......R',
      'R.......R',
      'RRR...RRR',
  ] };
  rooms['3,4'] = { biome: 'unterwelt', name: 'Adern des Glutschlunds', arch: 'cave', tiles: [
      'RRR...RRR',
      'RRR...RRR',
      'RRR.....R',
      'R.......R',
      'R.....M.R',
      'R.......R',
      'R.......R',
      'R.......R',
      'R.....f.R',
      'R.......R',
      'R....M..R',
      'R.......R',
      'RRM.....R',
      'RRRRRRRRR',
  ] };
  rooms['4,1'] = { biome: 'wueste', name: 'Wandernde Dünen', arch: 'open', tiles: [
      '#########',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '#ssMssss#',
      '#sssssMM#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '#sssssss#',
      '###sss###',
  ] };
  rooms['4,2'] = { biome: 'wueste', name: 'Die stumme Pyramide', arch: 'chamber', tiles: [
      '###sss###',
      '#,MsssM,#',
      '#x,sss,M#',
      '#,,,,,,o#',
      '#M,,,,,,#',
      '#o,,,,,,#',
      'sss,,,,,#',
      'sss,,,,M#',
      'sss,,,,,#',
      '#o,x,,,,#',
      '#o,,,,,o#',
      '#o,sss,o#',
      '#o,sss,x#',
      '###sss###',
  ] };
  rooms['4,3'] = { biome: 'unterwelt', name: 'Obsidianfeld', arch: 'canyon', tiles: [
      'RRR...RRR',
      'RRR.....R',
      'RRR.....R',
      'RRRR...RR',
      'RRRR...RR',
      'RRR...RRR',
      'RR...R..R',
      'R.......R',
      'R..MRR..R',
      'R...RRRRR',
      'R.M..RRRR',
      'R...RRRRR',
      'RR...RRRR',
      'RRRRRRRRR',
  ] };

  const autoFragSpots = {
    '0,1': [[4,9], [3,12], [4,2], [3,6]],
    '0,2': [[2,1], [2,5], [4,7], [6,6]],
    '0,3': [[2,3], [4,2], [5,10], [2,10]],
    '1,0': [[6,9], [4,11], [2,12], [7,4]],
    '1,1': [[3,11], [5,4], [5,10], [7,7]],
    '1,2': [[2,1], [5,3], [7,7], [7,12]],
    '1,3': [[5,11], [5,5], [2,2], [7,12]],
    '2,0': [[5,4], [6,2], [6,9], [2,5]],
    '2,1': [[4,8], [6,7], [2,3], [3,11]],
    '2,2': [[1,4], [2,10], [4,2], [6,8]],
    '2,3': [[3,8], [1,5], [5,5], [2,10]],
    '2,4': [[3,5], [3,10], [2,12], [6,6]],
    '3,0': [[1,5], [6,2], [4,11], [1,11]],
    '3,1': [[5,2], [3,5], [3,8], [6,6]],
    '3,2': [[5,4], [3,12], [4,7], [1,11]],
    '3,3': [[3,12], [5,5], [6,12], [7,1]],
    '3,4': [[6,3], [1,3], [3,1], [1,10]],
    '4,1': [[5,3], [3,11], [4,6], [1,5]],
    '4,2': [[3,12], [3,7], [7,4], [2,3]],
    '4,3': [[5,1], [6,6], [1,11], [3,6]],
  };

  const autoNpcSpots = {
    '0,1': [[2,10]],
    '0,2': [[4,11]],
    '0,3': [[5,7]],
    '1,0': [[7,1]],
    '1,1': [[3,7]],
    '1,2': [[1,7]],
    '1,3': [[5,1]],
    '2,0': [[6,6]],
    '2,1': [[6,10]],
    '2,2': [[7,5]],
    '2,3': [[6,7]],
    '2,4': [[5,4]],
    '3,0': [[6,5]],
    '3,1': [[5,9]],
    '3,2': [[1,5]],
    '3,3': [[1,11]],
    '3,4': [[7,12]],
    '4,1': [[7,1]],
    '4,2': [[4,1]],
    '4,3': [[1,8]],
  };

  const autoInschriften = {
    '0,1': [[7,4], [2,4], [6,8]],
    '0,2': [[7,8], [4,2], [5,9]],
    '0,3': [[5,4], [3,6], [1,8]],
    '1,0': [[1,9], [1,1], [2,5]],
    '1,1': [[7,1], [1,5], [1,9]],
    '1,2': [[6,1], [4,10], [5,8]],
    '1,3': [[7,6], [3,4], [6,8]],
    '2,0': [[5,11], [3,10], [2,12]],
    '2,1': [[7,1], [6,3], [5,5]],
    '2,2': [[5,11], [1,8], [1,1]],
    '2,3': [[7,1], [7,12], [3,3]],
    '2,4': [[7,9], [4,8], [4,2]],
    '3,0': [[3,4], [3,8], [7,7]],
    '3,1': [[1,11], [7,12], [1,3]],
    '3,2': [[7,1], [6,10], [2,3]],
    '3,3': [[1,7], [3,9], [7,10]],
    '3,4': [[1,6], [4,5], [6,10]],
    '4,1': [[6,10], [4,9], [1,12]],
    '4,2': [[5,5], [6,2], [5,11]],
    '4,3': [[3,10], [4,3], [4,12]],
  };

  return {
    pal: 'amber',
    rooms,
    npcs: {
      '0,1': [ { spot: 0, v: 0, dlg: 'ufer_faehre' } ],
      '0,2': [ { spot: 0, v: 1, dlg: 'sumpf_faehrmann' } ],
      '0,3': [ { spot: 0, v: 2, dlg: 'bucht_schweigende' } ],
      '1,0': [ { spot: 0, v: 3, dlg: 'spiegel_wanderin' } ],
      '1,1': [ { spot: 0, v: 0, dlg: 'biblio_archivar' } ],
      '1,2': [ { spot: 0, v: 1, dlg: 'hain_alte' } ],
      '1,3': [ { spot: 0, v: 2, dlg: 'mond_gaertnerin' } ],
      '2,0': [ { spot: 0, v: 3, dlg: 'sternwarte_deuterin' } ],
      '2,1': [ { spot: 0, v: 0, dlg: 'hof_hueterin' } ],
      '2,2': [ { spot: 0, v: 1, dlg: 'asche_wache' } ],
      '2,3': [ { spot: 0, v: 2, dlg: 'asche_haendler' } ],
      '2,4': [ { spot: 0, v: 3, dlg: 'tiefe_stimme' } ],
      '3,0': [ { spot: 0, v: 0, dlg: 'echo_lauscher' } ],
      '3,1': [ { spot: 0, v: 1, dlg: 'kristall_hoerer' } ],
      '3,2': [ { spot: 0, v: 2, dlg: 'wueste_wanderer' } ],
      '3,3': [ { spot: 0, v: 3, dlg: 'glut_schmied' } ],
      '3,4': [ { spot: 0, v: 0, dlg: 'adern_bergmann' } ],
      '4,1': [ { spot: 0, v: 1, dlg: 'duenen_nomade' } ],
      '4,2': [ { spot: 0, v: 2, dlg: 'pyramide_waechter' } ],
      '4,3': [ { spot: 0, v: 3, dlg: 'obsidian_schmelzer' } ],
    },
    shrines: { '2,1': { spot: 0 }, '4,2': { spot: 0 }, '2,4': { spot: 0 } },
    fragSpots: autoFragSpots,
    npcSpots: autoNpcSpots,
    inschriftSpots: autoInschriften,
    ambient: 'asche',
  };
}

G.MAPS = { stadt: buildStadt(), asche: buildAsche() };

// ============================================================
// DIALOGE
// ============================================================
G.DIALOGE = {
  stadt_pendler: ['Entschuldige, keine Zeit. Ich bin schon zu spät für etwas, das mir egal ist.'],
  stadt_meckerer: ['Seit damals ist alles anders, sag ich dir. Die Leute reden nur noch übereinander, nicht mehr miteinander.', 'Aber was soll man machen. Ist halt so.'],
  stadt_scroller: ['Warte kurz, ich muss das zu Ende scrollen.', '... okay, was wolltest du? Egal, ich habs vergessen.'],
  stadt_alte_frau: ['Du siehst es auch, oder? Diesen Schleier über allem.', 'Die meisten haben aufgehört zu schauen. Du nicht.', 'Geh zur alten Ladenzeile im Süden. Wenn du nachts das Flackern siehst, dann ist es soweit.'],
  stadt_parkmann: ['Früher war der Park voller Stimmen. Jetzt sitzen alle woanders. Ich weiß auch nicht wo.'],
  stadt_kind: ['Psst. Der Laden da hinten hat kein Schild.', 'Aber um 3 Uhr 33 leuchtet er. Ich habs gesehen. Mir glaubt ja keiner.'],
  stadt_obdachloser: ['Ich hab aufgehört, die Tage zu zählen. Aber die Zahlen zählen weiter, das merk ich schon.'],
  asche_wache: ['Halt. Du trägst kein Siegel des Index.', '... und doch stehst du hier. Das Muster hat dich durchgelassen.', 'Willkommen in der Aschenstadt. Neun Regionen liegen vor dir. Die Fragmente leuchten nur für die, die schauen.'],
  hof_hueterin: ['Der Spiegelhof zeigt dir nicht die Zukunft. Er zeigt dir, wer du gerade bist.', 'Je mehr du gesammelt hast, desto mehr sieht er. Komm wieder, wenn du weiter bist.'],
  asche_haendler: ['Fragmente, Splitter, halbe Wahrheiten. Alles im Angebot.', 'Kleiner Rat: Nicht alles, was leuchtet, ist echt. Prüfen kostet Zeit. Glauben kostet mehr.'],
  asche_kind: ['Ich hab von der großen Bibliothek geträumt. Da waren Bücher, die es gar nicht mehr gibt.', 'Im Westen steht sie noch. Halb verbrannt, aber sie steht.'],
  biblio_archivar: ['Sie haben die Bücher verbrannt, nicht die Sätze.', 'Was einmal gedacht wurde, findet immer einen Weg zurück. Manchmal dauert es Jahrhunderte.'],
  hain_alte: ['Die Wurzeln hier sind älter als die Stadt. Sie waren schon da, bevor jemand Mauern für nötig hielt.', 'Wenn du nach Westen gehst, wird der Boden weich. Pass auf, wo du auftrittst.'],
  sumpf_faehrmann: ['Der Nebel nimmt dir die Richtung, nicht den Weg.', 'Im Norden liegt das Ufer der Vergessenen. Im Süden die stille Bucht. Beide führen zurück, wenn du geduldig bist.'],
  kristall_hoerer: ['Halt still. Hörst du das?', 'Die Kristalle geben zurück, was man hineinruft. Nur etwas später und etwas ehrlicher.'],
  wueste_wanderer: ['Der Sand vergisst jede Spur. Deshalb bauten sie hier aus Stein.', 'Weiter östlich steht die Pyramide. Sie hat nie jemandem gehört. Vielleicht ist sie deshalb noch da.'],
  glut_schmied: ['Vorsicht auf den Brücken. Was da unten glüht, ist älter als Feuer.', 'Manche sagen, der Schlund sei eine Wunde. Ich sage, er ist ein Ofen. Beides stimmt.'],
  mond_gaertnerin: ['Hier wächst nur, was nachts wach ist.', 'Das Wasser hier zieht sich zurück und kommt wieder. Wie alles, was lebt.'],
  sternwarte_deuterin: ['Von hier sieht man das Gewölbe am besten. Die Zeichen ziehen langsam, aber sie ziehen.', 'Der Index hat den Himmel geschwärzt. Ein Loch haben sie übersehen. Das über uns.'],
  tiefe_stimme: ['Du bist tief gekommen. Die meisten drehen vorher um.', 'Hier unten ist es still genug, dass man sich selbst hört. Das halten nicht viele aus.'],
  pyramide_waechter: ['Sie ist leer. Das war sie immer.', 'Die Leute erfinden lieber einen Schatz, als eine leere Kammer zu ertragen. Das ist der ganze Trick.'],
  spiegel_wanderin: ['Das Eis hier hält Augenblicke fest. Schau nicht zu lange hin.', 'Ich habe einmal einen Moment gesehen, den ich lieber vergessen hätte. Jetzt komme ich jeden Tag zurück.'],
  echo_lauscher: ['Die Spirale gibt alles zurück. Nur später und ehrlicher.', 'Ruf etwas hinein, das du dir selbst nicht sagst. Dann weißt du, warum ich hier sitze.'],
  ufer_faehre: ['Hier kamen die an, die vergessen werden wollten.', 'Manche hat der Index geschickt. Manche kamen freiwillig. Am Ufer sieht man den Unterschied nicht mehr.'],
  bucht_schweigende: ['Sprich leise. Das Eis trägt jedes Wort bis ans andere Ufer.', 'Ich rede hier seit Jahren nicht. Für dich mache ich eine Ausnahme, weil du zuhörst.'],
  duenen_nomade: ['Der Sand deckt alles zu. Das ist keine Drohung, das ist ein Angebot.', 'Wer hier eine Spur hinterlassen will, muss immer weitergehen.'],
  obsidian_schmelzer: ['Das schwarze Glas war einmal flüssig. Jetzt hält es die Form von damals.', 'So arbeitet auch der Index. Er friert ein, was in Bewegung war.'],
  adern_bergmann: ['Die Gänge folgen der Hitze, nicht dem Verstand.', 'Ich grabe nicht nach Erz. Ich grabe nach dem, was sie hier unten verschüttet haben.'],

};
