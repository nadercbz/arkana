// Geparkt am 29.07.2026. Vollstaendiger Fog-of-War-Kartencode.
// Wieder einbauen: diesen Block vor 'Start und Hauptschleife' in
// js/main.js einfuegen, dazu die Bloecke #minikarte und #vollkarte
// aus geparkt/karte_markup.html, und in spielStart/tickInner die
// Aufrufe deckeAuf() und aktualisiereMinikarte() ergaenzen.

// ------------------------------------------------------------
// Karte. Deckt sich beim Erkunden auf, wie in einem Strategiespiel.
// Ein Kachelraster haelt fest, was schon gesehen wurde. Das Raster
// selbst reist im Spielstand mit, damit ein aufgedeckter Bereich nach
// dem Schliessen der Seite aufgedeckt bleibt.
// ------------------------------------------------------------
const KARTE_ZELLE = 2;                          // 2 Weltkacheln pro Kartenzelle, spart Speicher
const KARTE_W = Math.ceil(MAP.W / KARTE_ZELLE);
const KARTE_H = Math.ceil(MAP.H / KARTE_ZELLE);
let AUFGEDECKT = new Uint8Array(KARTE_W * KARTE_H);
const SICHTRADIUS = 9;                           // in Weltkacheln, wie weit man "sieht"

function kartenIndex(tx, ty) {
  const kx = Math.floor(tx / KARTE_ZELLE), ky = Math.floor(ty / KARTE_ZELLE);
  if (kx < 0 || ky < 0 || kx >= KARTE_W || ky >= KARTE_H) return -1;
  return ky * KARTE_W + kx;
}

// Deckt einen Kreis um die Spielerposition auf. Wird jeden Frame mit der
// aktuellen Position aufgerufen, ist aber billig: nur ein kleiner
// Ausschnitt wird geprueft, und schon aufgedeckte Zellen werden
// uebersprungen.
let kartenGeaendert = false;
function deckeAuf(tx, ty, radius) {
  const r = Math.ceil(radius / KARTE_ZELLE);
  const kx0 = Math.floor(tx / KARTE_ZELLE), ky0 = Math.floor(ty / KARTE_ZELLE);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const kx = kx0 + dx, ky = ky0 + dy;
      if (kx < 0 || ky < 0 || kx >= KARTE_W || ky >= KARTE_H) continue;
      const i = ky * KARTE_W + kx;
      if (!AUFGEDECKT[i]) { AUFGEDECKT[i] = 1; kartenGeaendert = true; }
    }
  }
}

// Aufgedecktes Raster in einen kompakten String packen. Lauflaengen
// statt einzelner Bits, das reicht: grosse zusammenhaengende Flaechen
// sind aufgedeckt oder eben nicht.
function kartePacken() {
  let out = '', lauf = 0, wert = 0;
  for (let i = 0; i < AUFGEDECKT.length; i++) {
    if (AUFGEDECKT[i] === wert) { lauf++; continue; }
    out += lauf + (wert ? 'x' : 'o'); lauf = 1; wert = AUFGEDECKT[i];
  }
  out += lauf + (wert ? 'x' : 'o');
  return out;
}
function karteEntpacken(s) {
  const aus = new Uint8Array(KARTE_W * KARTE_H);
  if (!s) return aus;
  let i = 0;
  for (const stueck of s.match(/\d+[xo]/g) || []) {
    const wert = stueck.endsWith('x') ? 1 : 0;
    const n = parseInt(stueck, 10);
    if (wert) for (let k = 0; k < n && i + k < aus.length; k++) aus[i + k] = 1;
    i += n;
  }
  return aus;
}

// Regionen, Fundorte und Figuren als Symbole auf der Karte
function karteSymbole() {
  const aus = [];
  for (const r of MAP.regions) aus.push({ x: r.x, y: r.y, art: 'region', name: r.name });
  for (const [x, y] of MAP.shrine) aus.push({ x, y, art: 'schrein' });
  for (const [x, y] of MAP.npc) aus.push({ x, y, art: 'npc' });
  return aus;
}
const KARTE_SYMBOLE = karteSymbole();

// Beide Karten (Minikarte und Vollbild) teilen sich dieses Zeichnen.
// spieler_ zeigt Position und Blickrichtung, aufklappen schaltet
// Regionsnamen und Symbole hinzu, die auf der kleinen Karte zu eng waeren.
function zeichneKarte(ctx, seite, aufklappen) {
  ctx.clearRect(0, 0, seite, seite);
  const sx = seite / MAP.W, sy = seite / MAP.H;

  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, seite, seite);

  // Nur aufgedeckte Zellen zeichnen. Boden hell, Wand dunkel, damit
  // Raeume auf der Karte genauso lesbar sind wie im Spiel.
  for (let ky = 0; ky < KARTE_H; ky++) {
    for (let kx = 0; kx < KARTE_W; kx++) {
      if (!AUFGEDECKT[ky * KARTE_W + kx]) continue;
      const tx0 = kx * KARTE_ZELLE, ty0 = ky * KARTE_ZELLE;
      let hellstes = 0, bio = null;
      for (let j = 0; j < KARTE_ZELLE; j++) {
        for (let i = 0; i < KARTE_ZELLE; i++) {
          const tx = tx0 + i, ty = ty0 + j;
          if (tx >= MAP.W || ty >= MAP.H) continue;
          if (!fest(tx, ty)) hellstes = 1;
          if (bio === null) bio = BIO[biomAt(tx, ty)];
        }
      }
      const farbe = bio ? (hellstes ? bio.boden : bio.wand) : null;
      ctx.fillStyle = farbe ? '#' + farbe.getHexString() : (hellstes ? '#3a4452' : '#181c22');
      ctx.fillRect(tx0 * sx, ty0 * sy, KARTE_ZELLE * sx + 0.6, KARTE_ZELLE * sy + 0.6);
    }
  }

  // Symbole nur zeigen, wenn die Zelle aufgedeckt ist
  for (const s of KARTE_SYMBOLE) {
    const i = kartenIndex(s.x, s.y);
    if (i < 0 || !AUFGEDECKT[i]) continue;
    const px = s.x * sx, py = s.y * sy;
    if (s.art === 'region') {
      ctx.fillStyle = 'rgba(255,216,160,0.9)';
      ctx.beginPath(); ctx.arc(px, py, aufklappen ? 3.4 : 2.2, 0, 7); ctx.fill();
      if (aufklappen) {
        ctx.fillStyle = '#ffd9a0'; ctx.font = '11px inherit';
        ctx.textAlign = 'center';
        ctx.fillText(s.name, px, py - 8);
      }
    } else if (aufklappen && s.art === 'schrein') {
      ctx.fillStyle = '#e8c87a';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    } else if (aufklappen && s.art === 'npc') {
      ctx.fillStyle = 'rgba(180,196,214,0.85)';
      ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 7); ctx.fill();
    }
  }

  // Spielerpfeil, zeigt in die Blickrichtung
  const px = pos.x * sx, py = pos.z * sy;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(blick);
  ctx.fillStyle = '#ffb864';
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-4, 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

const miniCanvas = document.querySelector('#minikarte canvas');
const vollCanvas = document.querySelector('#vollkarte canvas');
function aktualisiereMinikarte() {
  if (!S || $('minikarte').classList.contains('hidden')) return;
  const seite = 132;
  if (miniCanvas.width !== seite) { miniCanvas.width = seite; miniCanvas.height = seite; }
  zeichneKarte(miniCanvas.getContext('2d'), seite, false);
}
function oeffneVollkarte() {
  if (!S) return;
  const seite = 720;
  if (vollCanvas.width !== seite) { vollCanvas.width = seite; vollCanvas.height = seite; }
  zeichneKarte(vollCanvas.getContext('2d'), seite, true);
  $('vollkarte').classList.remove('hidden');
}
function schliesseVollkarte() { $('vollkarte').classList.add('hidden'); }
function karteUmschalten() {
  if (!$('vollkarte').classList.contains('hidden')) schliesseVollkarte();
  else oeffneVollkarte();
}
$('minikarte').addEventListener('click', karteUmschalten);
$('vollkarte').addEventListener('click', schliesseVollkarte);

