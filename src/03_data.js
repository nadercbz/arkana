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
  area: 'stadt', room: '1,1', px: 168, py: 260,
  flags: {},
  fragmente: [],
  stats: { schritte: 0, dialoge: 0, geglaubt: 0, geprueft: 0 },
});

// ============================================================
// KARTEN-BAUKASTEN
// Räume sind 15 Zeichen breit, 22 hoch. Der Baukasten sorgt
// dafür, dass Ränder, Durchgänge und Maße immer stimmen.
// ============================================================
const RW = 15, RH = 22;

// exits: {n:true, s:true, w:true, o:true} = Durchgang in die Richtung
function room(exits, fill = '.', wall = '#') {
  const g = [];
  for (let y = 0; y < RH; y++) {
    const row = [];
    for (let x = 0; x < RW; x++) {
      const border = (x === 0 || x === RW - 1 || y === 0 || y === RH - 1);
      row.push(border ? wall : fill);
    }
    g.push(row);
  }
  // Durchgänge in die Mitte der jeweiligen Kante, 3 Felder breit
  const mx = Math.floor(RW / 2), my = Math.floor(RH / 2);
  if (exits.n) for (let x = mx - 1; x <= mx + 1; x++) g[0][x] = fill;
  if (exits.s) for (let x = mx - 1; x <= mx + 1; x++) g[RH - 1][x] = fill;
  if (exits.w) for (let y = my - 1; y <= my + 1; y++) g[y][0] = fill;
  if (exits.o) for (let y = my - 1; y <= my + 1; y++) g[y][RW - 1] = fill;
  return g;
}

// Rechteck oder Linie in einen Raum stempeln
function put(g, x, y, ch) { if (g[y] && g[y][x] !== undefined) g[y][x] = ch; }
function rect(g, x1, y1, x2, y2, ch) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) put(g, x, y, ch);
}
function hline(g, y, x1, x2, ch) { for (let x = x1; x <= x2; x++) put(g, x, y, ch); }
function vline(g, x, y1, y2, ch) { for (let y = y1; y <= y2; y++) put(g, x, y, ch); }
function toStrings(g) { return g.map((r) => r.join('')); }

// ------------------------------------------------------------
// PROLOG: die graue Stadt
// ------------------------------------------------------------
function buildStadt() {
  const rooms = {};

  // Zentrum: Straßenkreuzung
  let g = room({ n: true, s: true, w: true, o: true });
  hline(g, 7, 1, 13, '='); hline(g, 8, 1, 13, '=');
  hline(g, 14, 1, 13, '='); hline(g, 15, 1, 13, '=');
  vline(g, 6, 1, 20, '='); vline(g, 7, 1, 20, '=');
  put(g, 2, 4, 'T'); put(g, 12, 4, 'T'); put(g, 2, 18, 'T'); put(g, 12, 18, 'T');
  rect(g, 9, 2, 12, 3, 'W');
  rooms['1,1'] = toStrings(g);

  // Westen: Platz mit Bänken
  g = room({ o: true });
  rect(g, 3, 5, 11, 6, '=');
  rect(g, 3, 15, 11, 16, '=');
  put(g, 4, 9, 'T'); put(g, 10, 9, 'T'); put(g, 7, 12, 'T');
  rooms['0,1'] = toStrings(g);

  // Osten: Gasse mit Häuserfront
  g = room({ w: true, s: true });
  rect(g, 2, 2, 6, 6, '#'); rect(g, 3, 3, 5, 5, 'W');
  rect(g, 9, 2, 13, 6, '#'); rect(g, 10, 3, 12, 5, 'W');
  vline(g, 7, 1, 20, '=');
  put(g, 3, 16, 'T'); put(g, 11, 16, 'T');
  rooms['2,1'] = toStrings(g);

  // Norden: Park am Wasser
  g = room({ s: true });
  rect(g, 1, 1, 13, 5, '~');
  put(g, 3, 9, 'T'); put(g, 11, 9, 'T'); put(g, 5, 14, 'T'); put(g, 9, 14, 'T');
  hline(g, 11, 1, 13, '=');
  rooms['1,0'] = toStrings(g);

  // Süden: die alte Ladenzeile
  g = room({ n: true, o: true });
  // Ladenblock mit Tür in der Mitte
  rect(g, 4, 8, 10, 13, '#');
  rect(g, 5, 9, 9, 11, 'W');
  put(g, 7, 13, 'D');
  put(g, 2, 17, 'T'); put(g, 12, 17, 'T');
  rooms['1,2'] = toStrings(g);

  // Südost: Sackgasse
  g = room({ w: true });
  rect(g, 3, 3, 11, 4, '#');
  put(g, 4, 12, 'T'); put(g, 10, 12, 'T');
  rooms['2,2'] = toStrings(g);

  return {
    pal: 'gray',
    rooms,
    npcs: {
      '1,1': [ { x: 4, y: 10, v: 0, dlg: 'stadt_pendler' }, { x: 10, y: 17, v: 1, dlg: 'stadt_meckerer' } ],
      '0,1': [ { x: 7, y: 8, v: 0, dlg: 'stadt_scroller' } ],
      '2,1': [ { x: 9, y: 12, v: 2, dlg: 'stadt_alte_frau' } ],
      '1,0': [ { x: 7, y: 16, v: 1, dlg: 'stadt_parkmann' } ],
      '1,2': [ { x: 4, y: 17, v: 3, dlg: 'stadt_kind' } ],
      '2,2': [ { x: 7, y: 15, v: 1, dlg: 'stadt_obdachloser' } ],
    },
    triggers: { '1,2': [ { x1: 6, y1: 13, x2: 8, y2: 13, event: 'laden' } ] },
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
  rect(g, 5, 7, 9, 12, '#');
  rect(g, 6, 8, 8, 11, ',');
  put(g, 7, 12, 'D');
  vline(g, 7, 13, 20, '*');
  put(g, 2, 4, 'T'); put(g, 12, 4, 'T'); put(g, 2, 17, 'T'); put(g, 12, 17, 'T');
  rooms['1,1'] = toStrings(g);

  // Westen: Nebelufer
  g = room({ o: true });
  rect(g, 1, 1, 5, 8, '~');
  put(g, 8, 6, 'T'); put(g, 4, 14, 'T'); put(g, 10, 16, 'T');
  hline(g, 10, 6, 13, '=');
  rooms['0,1'] = toStrings(g);

  // Osten: Markt der Mustersucher
  g = room({ w: true, n: true });
  rect(g, 4, 6, 10, 7, '=');
  rect(g, 4, 13, 10, 14, '=');
  put(g, 3, 3, 'T'); put(g, 11, 3, 'T');
  put(g, 3, 18, 'T'); put(g, 11, 18, 'T');
  rooms['2,1'] = toStrings(g);

  // Norden: Spiegelhof mit dem Schrein
  g = room({ s: true });
  rect(g, 3, 5, 11, 15, '#');
  rect(g, 4, 6, 10, 14, ',');
  hline(g, 15, 6, 8, ',');   // Zugang von unten
  vline(g, 7, 16, 20, '*');
  rooms['1,0'] = toStrings(g);

  // Nordost: Leylinien-Feld
  g = room({ s: true, w: true });
  vline(g, 4, 1, 20, '*'); vline(g, 10, 1, 20, '*');
  put(g, 7, 5, 'T'); put(g, 7, 16, 'T');
  rooms['2,0'] = toStrings(g);

  // Süden: Ascheweg
  g = room({ n: true, o: true });
  vline(g, 7, 1, 12, '*');
  rect(g, 3, 14, 11, 15, '=');
  put(g, 2, 5, 'T'); put(g, 12, 5, 'T'); put(g, 4, 18, 'T'); put(g, 10, 18, 'T');
  rooms['1,2'] = toStrings(g);

  // Südost: stille Kammer
  g = room({ w: true });
  rect(g, 4, 6, 10, 13, '#');
  rect(g, 5, 7, 9, 12, ',');
  put(g, 7, 13, 'D');
  rooms['2,2'] = toStrings(g);

  return {
    pal: 'amber',
    rooms,
    npcs: {
      '1,1': [ { x: 3, y: 15, v: 2, dlg: 'asche_wache' } ],
      '0,1': [ { x: 10, y: 12, v: 3, dlg: 'asche_sucherin' } ],
      '2,1': [ { x: 7, y: 9, v: 1, dlg: 'asche_haendler' } ],
      '1,2': [ { x: 11, y: 9, v: 2, dlg: 'asche_kind' } ],
      '2,2': [ { x: 7, y: 16, v: 3, dlg: 'asche_alter' } ],
    },
    shrines: { '1,0': { x: 5 * 24, y: 8 * 24 } },
    fragSpots: {
      '1,1': [ [3, 6], [11, 14] ],
      '0,1': [ [9, 3], [3, 17] ],
      '2,1': [ [7, 4], [5, 17] ],
      '1,2': [ [3, 8], [11, 16] ],
      '2,0': [ [7, 9], [2, 14], [12, 6] ],
      '2,2': [ [3, 4], [11, 18] ],
      '1,0': [ [9, 18] ],
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
