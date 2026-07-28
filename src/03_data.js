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
  stats: { schritte: 0, dialoge: 0, geglaubt: 0, geprueft: 0 },
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
// ARKANA: die Aschenstadt
// ------------------------------------------------------------
function buildAsche() {
  const rooms = {};

  // Zentrum: Ruine des Archivs
  let g = room({ n: true, s: true, w: true, o: true });
  rect(g, 3, 2, 5, 5, '#');
  rect(g, 4, 3, 4, 4, ',');
  put(g, 4, 5, 'D');
  vline(g, 4, 9, 12, '*');
  put(g, 1, 2, 'T'); put(g, 7, 2, 'T'); put(g, 1, 11, 'T'); put(g, 7, 11, 'T');
  rooms['1,1'] = toStrings(g);

  // Westen: Nebelufer
  g = room({ o: true });
  rect(g, 1, 1, 3, 5, '~');
  put(g, 5, 4, 'T'); put(g, 2, 10, 'T'); put(g, 6, 11, 'T');
  hline(g, 8, 4, 7, '=');
  rooms['0,1'] = toStrings(g);

  // Osten: Markt der Mustersucher
  g = room({ w: true, n: true });
  hline(g, 4, 2, 6, '='); hline(g, 10, 2, 6, '=');
  put(g, 2, 2, 'T'); put(g, 6, 2, 'T'); put(g, 2, 12, 'T'); put(g, 6, 12, 'T');
  rooms['2,1'] = toStrings(g);

  // Norden: Spiegelhof mit dem Schrein
  g = room({ s: true });
  rect(g, 1, 1, 7, 10, '#');
  rect(g, 2, 2, 6, 9, ',');
  hline(g, 10, 3, 5, ',');   // Zugang von unten
  rooms['1,0'] = toStrings(g);

  // Nordost: Leylinien-Feld. Kein Westausgang, der Spiegelhof hat dort keinen.
  g = room({ s: true });
  vline(g, 2, 1, 12, '*'); vline(g, 6, 1, 12, '*');
  put(g, 4, 3, 'T'); put(g, 4, 10, 'T');
  rooms['2,0'] = toStrings(g);

  // Süden: Ascheweg
  g = room({ n: true, o: true });
  vline(g, 4, 1, 8, '*');
  hline(g, 10, 2, 6, '=');
  put(g, 1, 3, 'T'); put(g, 7, 3, 'T'); put(g, 2, 12, 'T'); put(g, 6, 12, 'T');
  rooms['1,2'] = toStrings(g);

  // Südost: stille Kammer
  g = room({ w: true });
  rect(g, 2, 4, 6, 9, '#');
  rect(g, 3, 5, 5, 8, ',');
  put(g, 4, 9, 'D');
  rooms['2,2'] = toStrings(g);

  return {
    pal: 'amber',
    rooms,
    npcs: {
      '1,1': [ { x: 2, y: 10, v: 2, dlg: 'asche_wache' } ],
      '0,1': [ { x: 6, y: 7, v: 3, dlg: 'asche_sucherin' } ],
      '2,1': [ { x: 4, y: 6, v: 1, dlg: 'asche_haendler' } ],
      '1,2': [ { x: 6, y: 6, v: 2, dlg: 'asche_kind' } ],
      '2,2': [ { x: 4, y: 11, v: 3, dlg: 'asche_alter' } ],
    },
    shrines: { '1,0': { x: 2 * 40, y: 3 * 40 } },
    fragSpots: {
      '1,1': [ [2, 2], [6, 10] ],
      '0,1': [ [6, 2], [2, 12] ],
      '2,1': [ [4, 2], [3, 12] ],
      '1,2': [ [2, 5], [6, 11] ],
      '2,0': [ [4, 6], [1, 11], [7, 4] ],
      '2,2': [ [2, 2], [6, 12] ],
      '1,0': [ [2, 12] ],
    },
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
  asche_wache: ['Halt. Du trägst kein Siegel des Index.', '... und doch stehst du hier. Das Muster hat dich durchgelassen.', 'Willkommen in der Aschenstadt, Suchender. Sammle, was der Index verstreut hat. Die Fragmente leuchten nur für die, die schauen.'],
  asche_sucherin: ['Wir nennen uns Mustersucher. Wir sammeln, was nicht verbrannt ist.', 'Der Index sagt, Wissen schützt uns nicht. Wir sagen, ohne Wissen gibt es nichts zu schützen.'],
  asche_haendler: ['Fragmente, Splitter, halbe Wahrheiten. Alles im Angebot.', 'Kleiner Rat unter uns: Nicht alles, was leuchtet, ist echt.', 'Prüfen kostet Zeit. Glauben kostet mehr.'],
  asche_kind: ['Ich hab von der großen Bibliothek geträumt. Da waren Bücher, die es gar nicht mehr gibt.', 'Mama sagt, träumen ist nicht verboten. Noch nicht.'],
  asche_alter: ['Der Spiegelhof im Norden zeigt dir nicht die Zukunft.', 'Er zeigt dir, wer du gerade bist. Das ist unbequemer.'],
};
