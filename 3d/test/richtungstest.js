// Prueft die ECHTEN Zeilen aus js/main.js, nicht eine Nachbildung.
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('js/main.js', 'utf8');

// Tastenzuordnung aus richtung() herausschneiden
const mKeys = src.match(/if \(tasten\.KeyA[\s\S]*?tasten\.ArrowDown\) y \+= 1;/);
// Bewegungsvektor herausschneiden
const mMove = src.match(/const vor = \{ x: Math\.sin\(maus\.yaw\)[\s\S]*?rechts\.z \* roh\.x \};/);
if (!mKeys || !mMove) { console.log('Codezeilen nicht gefunden'); process.exit(1); }
console.log('Geprueft werden diese Zeilen aus main.js:\n' + mMove[0] + '\n');

const faelle = [['KeyW','W'], ['KeyS','S'], ['KeyA','A'], ['KeyD','D']];
let fehler = 0;

for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
  // Bildschirm-Rechts an diesem Winkel: oben x (-Blickrichtung)
  const f = [Math.sin(yaw), 0, Math.cos(yaw)];
  const rechtsEcht = [ 1*(-f[2]) - 0*(-f[1]), 0*(-f[0]) - 0*(-f[2]), 0*(-f[1]) - 1*(-f[0]) ];
  const zeile = [];
  for (const [code, name] of faelle) {
    const ctx = { tasten: { [code]: true }, maus: { yaw }, Math, x: 0, y: 0, roh: null, vor: null, rechts: null, d: null };
    vm.createContext(ctx);
    vm.runInContext(`
      let x = 0, y = 0;
      ${mKeys[0]}
      const l = Math.hypot(x, y);
      const roh = l > 1 ? { x: x / l, y: y / l } : { x, y };
      ${mMove[0]}
      globalThis.ergebnis = d;
    `, ctx);
    const d = ctx.ergebnis;
    const vorProj  = d.x * f[0] + d.y * f[2];          // entlang Blickrichtung
    const rechtProj = d.x * rechtsEcht[0] + d.y * rechtsEcht[2];  // entlang Bildschirm-rechts
    let ist = 'nichts';
    if (Math.abs(vorProj) > Math.abs(rechtProj)) ist = vorProj > 0 ? 'VORWAERTS' : 'RUECKWAERTS';
    else if (Math.abs(rechtProj) > 0.5) ist = rechtProj > 0 ? 'RECHTS' : 'LINKS';
    const soll = { W: 'VORWAERTS', S: 'RUECKWAERTS', A: 'LINKS', D: 'RECHTS' }[name];
    const ok = ist === soll;
    if (!ok) fehler++;
    zeile.push(`${name}=${ist}${ok ? '' : ' SOLL:' + soll}`);
  }
  console.log(`yaw ${yaw.toFixed(2).padStart(5)}  ${zeile.join('  ')}`);
}
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle vier Richtungen stimmen, in jeder Blickrichtung.');
process.exit(fehler ? 1 : 0);
