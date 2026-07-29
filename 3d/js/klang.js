// ============================================================
// KLANG
//
// Drei Schichten, nach den Mischregeln der Pipeline gestaffelt:
// Stimme oben, Sound-Effekte darunter, Musik ganz leise im Hintergrund.
// Die Pegel sind beim Erzeugen schon angeglichen worden, hier kommt
// nur noch die Feinabstimmung und das Ein- und Ausblenden dazu.
//
// Browser starten Ton erst nach einer echten Eingabe des Nutzers.
// Deshalb wartet alles auf den ersten Klick oder Tastendruck.
// ============================================================

const PEGEL = { stimme: 1.0, sfx: 0.55, musik: 0.30 };

const dateien = {
  erz1: 'stimme', erz2: 'stimme', erz3: 'stimme',
  musik_atrium: 'musik', musik_arkana: 'musik',
  sfx_schritt: 'sfx', sfx_raum: 'sfx', sfx_fragment: 'sfx', sfx_beam: 'sfx',
};

const puffer = {};
let ctx = null;
let frei = false;                 // darf der Browser schon Ton machen
let anKnoten = null;              // Hauptregler
let musikQuelle = null, musikGain = null, musikName = null;
let raumQuelle = null;
let stumm = false;

export function klangBereit() { return frei; }

function ladeAlle() {
  for (const name in dateien) {
    fetch(`./audio/${name}.mp3`)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((p) => { puffer[name] = p; })
      .catch(() => { /* eine fehlende Datei darf das Spiel nicht stoppen */ });
  }
}

export function klangStart() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  anKnoten = ctx.createGain();
  anKnoten.gain.value = 1;
  anKnoten.connect(ctx.destination);
  frei = true;
  ladeAlle();
}

function spiele(name, art, { schleife = false, lautstaerke = 1, versatz = 0 } = {}) {
  if (!frei || stumm || !puffer[name]) return null;
  const q = ctx.createBufferSource();
  q.buffer = puffer[name];
  q.loop = schleife;
  const g = ctx.createGain();
  g.gain.value = PEGEL[art] * lautstaerke;
  q.connect(g); g.connect(anKnoten);
  q.start(ctx.currentTime + versatz);
  return { quelle: q, gain: g };
}

// ---------- Musik ----------
export function musik(name, einblendZeit = 3) {
  if (!frei || musikName === name) return;
  musikName = name;
  if (musikQuelle) {
    const alt = musikGain, altQ = musikQuelle;
    alt.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(() => { try { altQ.stop(); } catch (e) { /* schon aus */ } }, 1700);
  }
  const s = spiele(name, 'musik', { schleife: true });
  if (!s) { musikName = null; return; }
  musikQuelle = s.quelle; musikGain = s.gain;
  const ziel = musikGain.gain.value;
  musikGain.gain.value = 0;
  musikGain.gain.linearRampToValueAtTime(ziel, ctx.currentTime + einblendZeit);
}

// ---------- Raumton, laeuft in Schleife ----------
export function raumton(an) {
  if (!frei) return;
  if (an && !raumQuelle) {
    const s = spiele('sfx_raum', 'sfx', { schleife: true, lautstaerke: 0.5 });
    if (s) raumQuelle = s.quelle;
  } else if (!an && raumQuelle) {
    try { raumQuelle.stop(); } catch (e) { /* egal */ }
    raumQuelle = null;
  }
}

// ---------- Einzelklaenge ----------
export function klangSchritt() {
  // Leichte Tonhoehenstreuung, sonst klingen Schritte wie ein Metronom
  const s = spiele('sfx_schritt', 'sfx', { lautstaerke: 0.5 + Math.random() * 0.25 });
  if (s) s.quelle.playbackRate.value = 0.9 + Math.random() * 0.25;
}
export function klangFragment() { spiele('sfx_fragment', 'sfx', { lautstaerke: 0.8 }); }
export function klangBeam() { spiele('sfx_beam', 'sfx', { lautstaerke: 0.9 }); }

// ---------- Erzaehlerstimme ----------
let erzaehlerLaeuft = false;
export function erzaehler(namen, abstaende) {
  if (!frei || erzaehlerLaeuft) return;
  erzaehlerLaeuft = true;
  let t = 0;
  namen.forEach((n, i) => {
    t += abstaende[i] || 0;
    setTimeout(() => spiele(n, 'stimme'), t * 1000);
  });
  setTimeout(() => { erzaehlerLaeuft = false; }, (t + 8) * 1000);
}

export function klangStumm(an) {
  stumm = an;
  if (anKnoten) anKnoten.gain.value = an ? 0 : 1;
  if (an) raumton(false);
}
