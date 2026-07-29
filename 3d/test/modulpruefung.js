// Syntaxpruefung fuer ES-Module: als Modul parsen, ohne auszufuehren.
// SourceTextModule kennt import, export und Top-Level-await.
const fs = require('fs'), vm = require('vm');
if (!vm.SourceTextModule) { console.log('Node ohne --experimental-vm-modules'); process.exit(2); }
for (const datei of process.argv.slice(2)) {
  try {
    new vm.SourceTextModule(fs.readFileSync(datei, 'utf8'), { identifier: datei });
    console.log(datei, 'Syntax OK');
  } catch (e) { console.log(datei, 'SYNTAXFEHLER:', e.message); process.exitCode = 1; }
}
