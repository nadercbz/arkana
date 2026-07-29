// ============================================================
// POSETEST
//
// Prueft die Animationsdaten der Figuren-GLBs gegen anatomische
// Grenzen. Genau dieser Test hat gefehlt: die Ruheanimation ist bis
// Version 6 gewachsen, ohne dass jemand nachgemessen hat, und sie
// hat die Knie dauerhaft 36 bis 59 Grad gebeugt und bis zu 40 Grad
// seitlich verdreht in den Raum gestellt.
//
// Aufruf: node test/posetest.js
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HIER, '..', 'assets');

// Ein Knie ist ein Scharnier. Es beugt um eine Achse und verdreht
// sich nicht. Alles darueber ist ein Fehler in den Daten.
const KNIE_VERDREHUNG_MAX = 8;      // Grad
const KNIE_BEUGUNG_MAX = 95;        // Grad, im Gehen
const BEINE = ['LeftLeg', 'RightLeg'];

function ladeGlb(pfad) {
  const d = fs.readFileSync(pfad);
  if (d.subarray(0, 4).toString() !== 'glTF') throw new Error('kein GLB: ' + pfad);
  let off = 12, js = null, bin = null;
  while (off < d.length) {
    const laenge = d.readUInt32LE(off), typ = d.readUInt32LE(off + 4);
    off += 8;
    const stueck = d.subarray(off, off + laenge);
    off += laenge;
    if (typ === 0x4E4F534A) js = JSON.parse(stueck.toString('utf8'));
    else if (typ === 0x004E4942) bin = stueck;
  }
  return { js, bin };
}

const GROESSE = { 5126: 4 };
const ANZAHL = { SCALAR: 1, VEC3: 3, VEC4: 4 };

function lies(js, bin, index) {
  const a = js.accessors[index];
  const bv = js.bufferViews[a.bufferView];
  const start = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const gr = GROESSE[a.componentType];
  const n = ANZAHL[a.type];
  if (!gr || !n) throw new Error('unbekanntes Zahlenformat');
  const out = [];
  for (let i = 0; i < a.count; i++) {
    const v = [];
    for (let k = 0; k < n; k++) v.push(bin.readFloatLE(start + (i * n + k) * gr));
    out.push(v);
  }
  return out;
}

const grad = (x) => (x * 180) / Math.PI;

// Beugung ist die Drehung um die Scharnierachse X, Verdrehung ist
// alles, was um die beiden anderen Achsen passiert.
function knieWinkel(q) {
  const [x, y, z, w] = q;
  return {
    beugung: Math.abs(grad(2 * Math.atan2(x, w))),
    verdrehung: grad(2 * Math.atan2(Math.hypot(y, z), Math.abs(w))),
  };
}

let fehler = 0;
const dateien = fs.readdirSync(ASSETS).filter((f) => f.endsWith('.glb')).sort();

for (const datei of dateien) {
  const { js, bin } = ladeGlb(path.join(ASSETS, datei));
  const animationen = js.animations || [];
  if (!animationen.length) continue;

  for (const anim of animationen) {
    for (const kanal of anim.channels) {
      if (kanal.target.path !== 'rotation') continue;
      const name = (js.nodes[kanal.target.node] || {}).name;
      if (!BEINE.includes(name)) continue;

      const werte = lies(js, bin, anim.samplers[kanal.sampler].output);
      let maxV = 0, maxB = 0;
      for (const q of werte) {
        const k = knieWinkel(q);
        if (k.verdrehung > maxV) maxV = k.verdrehung;
        if (k.beugung > maxB) maxB = k.beugung;
      }

      const marke = `${datei} / ${anim.name || 'Animation'} / ${name}`;
      if (maxV > KNIE_VERDREHUNG_MAX) {
        console.error(`FEHLER ${marke}: Knieverdrehung ${maxV.toFixed(1)}° `
          + `ueber der Grenze von ${KNIE_VERDREHUNG_MAX}°`);
        fehler++;
      } else if (maxB > KNIE_BEUGUNG_MAX) {
        console.error(`FEHLER ${marke}: Kniebeugung ${maxB.toFixed(1)}° `
          + `ueber der Grenze von ${KNIE_BEUGUNG_MAX}°`);
        fehler++;
      } else {
        console.log(`ok    ${marke}: Beugung bis ${maxB.toFixed(1)}°, `
          + `Verdrehung bis ${maxV.toFixed(1)}°`);
      }
    }
  }
}

if (fehler) {
  console.error(`\n${fehler} Verstoss(e). Die Figur wuerde mit verdrehten Knien dastehen.`);
  process.exit(1);
}
console.log('\nAlle Kniewerte im anatomischen Rahmen.');
