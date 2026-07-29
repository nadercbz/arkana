// Pruefung fuer die ES-Module des Spiels.
//
// Zwei Stufen, und die zweite ist die wichtige:
//
// 1. Parsen. Faengt echte Syntaxfehler.
// 2. Auswerten. Faengt Fehler, die erst beim Laden auftreten, vor allem
//    Zugriff auf ein const, das weiter unten steht. Genau daran ist das
//    Spiel schon einmal komplett haengengeblieben: ruhepose.js benutzte
//    achseZ neun Zeilen ueber der Stelle, an der es angelegt wird. Die
//    Datei ist syntaktisch einwandfrei, wirft aber beim Laden, und damit
//    laeuft main.js nie an und der Ladebildschirm bleibt stehen. Stufe 1
//    allein hat das durchgelassen.
//
// Ausgewertet wird gegen Attrappen fuer three und die Vendor-Module. Es
// geht nicht darum, das Spiel laufen zu lassen, sondern nur darum, den
// obersten Abschnitt jeder Datei einmal wirklich auszufuehren.
//
// Aufruf: node --experimental-vm-modules test/modulpruefung.js js/*.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

if (!vm.SourceTextModule) {
  console.log('Node ohne --experimental-vm-modules gestartet');
  process.exit(2);
}

// Attrappe fuer three. Jede Eigenschaft liefert eine Klasse, die alles
// schluckt, und jede Instanz beantwortet jeden Zugriff wieder so. Damit
// laeuft Aufbaucode auf oberster Ebene durch, ohne dass three da ist.
function machAttrappe(name) {
  const f = function () { return machAttrappe(name + '()'); };
  f.prototype = {};
  // Gesetzte Felder landen in einer eigenen Ablage. Direkt auf die
  // Funktion schreiben geht nicht, name und length sind dort nur lesbar,
  // und Aufbaucode setzt gern ein .name auf seine Objekte.
  const ablage = new Map();
  return new Proxy(f, {
    get(ziel, feld) {
      if (feld === Symbol.toPrimitive) return () => 0;
      if (feld === 'then') return undefined;          // nicht als Promise gelten
      if (ablage.has(feld)) return ablage.get(feld);
      return machAttrappe(name + '.' + String(feld));
    },
    set(ziel, feld, wert) { ablage.set(feld, wert); return true; },
    defineProperty(ziel, feld, beschr) {
      ablage.set(feld, beschr.value);
      return true;
    },
    has() { return true; },
    deleteProperty(ziel, feld) { ablage.delete(feld); return true; },
    construct() { return machAttrappe('new ' + name); },
    apply() { return machAttrappe(name + '()'); },
  });
}

// Ein Element, das jeden Zugriff schluckt, aber echte Kindlisten und
// classList liefert, weil Aufbaucode damit rechnet.
function machElement() {
  const e = machAttrappe('element');
  return e;
}

// fetch liest echte Dateien von der Platte. Das Spiel holt seine Welt
// per fetch, mit einer leeren Attrappe wuerde die Pruefung an
// WELT.arkana scheitern statt an echten Fehlern.
const WURZEL = path.join(__dirname, '..');
const antwort = (url) => {
  const rel = String(url).replace(/^\.?\//, '').split('?')[0];
  const pfad = path.join(WURZEL, rel);
  let text = null;
  try { text = fs.readFileSync(pfad, 'utf8'); } catch (e) { /* gibt es nicht */ }
  return Promise.resolve({
    ok: text !== null, status: text !== null ? 200 : 404,
    json: () => Promise.resolve(text === null ? {} : JSON.parse(text)),
    text: () => Promise.resolve(text || ''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  });
};

const kontext = vm.createContext({
  console, Math, JSON, Date, performance: { now: () => 0 },
  Float32Array, Uint8Array, Uint16Array, Int32Array, ArrayBuffer,
  Array, Object, String, Number, Boolean, Error, RegExp,
  Map, Set, WeakMap, Promise, Symbol, isNaN, isFinite, parseInt, parseFloat,
  setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0,
  fetch: (url) => antwort(url),
  Image: function () { return machElement(); },
  AudioContext: function () { return machAttrappe('AudioContext'); },
  speechSynthesis: machAttrappe('speechSynthesis'),
  SpeechSynthesisUtterance: function () { return machAttrappe('utterance'); },
  document: {
    body: machElement(),
    createElement: () => machElement(),
    getElementById: () => machElement(),
    querySelector: () => machElement(),
    addEventListener: () => {},
    documentElement: machElement(),
  },
  navigator: { maxTouchPoints: 0, userAgent: 'pruefung' },
  location: { search: '', href: 'http://pruefung/' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  addEventListener: () => {}, removeEventListener: () => {},
  devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800,
  alert: () => {}, confirm: () => true,
});
// window zeigt auf den Kontext selbst, so wie im Browser
kontext.window = kontext;
kontext.globalThis = kontext;

async function pruefe(datei) {
  const quelle = fs.readFileSync(datei, 'utf8');
  let modul;
  try {
    modul = new vm.SourceTextModule(quelle, { identifier: path.resolve(datei), context: kontext });
  } catch (e) {
    console.log(`${datei}  SYNTAXFEHLER: ${e.message}`);
    return false;
  }

  // Jeden Import durch ein Ersatzmodul mit Attrappen austauschen.
  // Welche Namen es braucht, steht in der Quelle:
  //   import { a, b } from 'x'   -> a und b
  //   import * as NS from 'x'    -> alles, was als NS.Etwas benutzt wird
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function gebrauchteNamen(spez) {
    const namen = new Set(['default']);
    const reBenannt = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${esc(spez)}['"]`, 'g');
    let m;
    while ((m = reBenannt.exec(quelle))) {
      for (const teil of m[1].split(',')) {
        const n = teil.trim().split(/\s+as\s+/)[0].trim();
        if (n) namen.add(n);
      }
    }
    const reStern = new RegExp(`import\\s*\\*\\s*as\\s+(\\w+)\\s*from\\s*['"]${esc(spez)}['"]`, 'g');
    while ((m = reStern.exec(quelle))) {
      const ns = m[1];
      const reFeld = new RegExp(`\\b${ns}\\.(\\w+)`, 'g');
      let f;
      while ((f = reFeld.exec(quelle))) namen.add(f[1]);
    }
    return [...namen];
  }

  async function binde(spez) {
    const namen = gebrauchteNamen(spez);
    return new vm.SyntheticModule(namen, function () {
      for (const n of namen) this.setExport(n, machAttrappe(`${spez}.${n}`));
    }, { identifier: `attrappe:${spez}:${datei}`, context: kontext });
  }
  try {
    await modul.link(binde);
    await modul.evaluate();
    console.log(`${datei}  Syntax und Laden OK`);
    return true;
  } catch (e) {
    console.log(`${datei}  FEHLER BEIM LADEN: ${e.message}`);
    return false;
  }
}

(async () => {
  let alleGut = true;
  for (const datei of process.argv.slice(2)) {
    if (!(await pruefe(datei))) alleGut = false;
  }
  if (!alleGut) {
    console.log('\nMindestens ein Modul laedt nicht. Das Spiel bliebe im Ladebildschirm.');
    process.exit(1);
  }
})();
