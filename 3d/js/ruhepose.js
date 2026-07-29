// ============================================================
// STANDPOSE
//
// Die mitgelieferte Ruheanimation war unbrauchbar: gegen die eigene
// Ruhepose des Modells gemessen wich sie 71 Grad an der Wirbelsaeule
// und 42 Grad an den Beinen ab, die Knie standen dauerhaft 36 bis 59
// Grad gebeugt und bis zu 40 Grad seitlich verdreht. Ein Knie ist ein
// Scharnier, da gehoert keine Verdrehung hin.
//
// Statt sie ein siebtes Mal zu flicken wird die Standanimation hier
// aus der Ruhepose des Modells selbst gebaut. Die ist nachgemessen
// sauber und symmetrisch: Knie bei acht Grad Beugung, Verdrehung
// unter drei Grad. Darauf kommen nur kleine Abweichungen. Die Knie
// bleiben exakt auf der Ruhepose, sie koennen sich also gar nicht
// verdrehen.
//
// Alle Winkel werden im Koerperraum angegeben, nicht in den lokalen
// Achsen der Knochen. Dieses Skelett hat schraege Bindeachsen, eine
// Drehung um die lokale X-Achse der Huefte waere dort keine
// anatomische Bewegung. Deshalb rechnet drehungImKoerperraum jede
// Weltdrehung in den Elternraum des Knochens um.
// ============================================================
import * as THREE from 'three';

// Die Bewegung setzt sich aus langsamen Schwingungen zusammen. Alle
// Perioden teilen die Cliplaenge, dadurch schliesst sich die Schleife
// ohne Sprung. Sie sind untereinander nicht harmonisch, das Muster
// wiederholt sich also erst nach zwoelf Sekunden und wirkt nicht getaktet.
const DAUER = 12;
const BILDER_PRO_S = 10;

const ATEM = 3;      // 4.0 s, Ein- und Ausatmen
const WIPPEN = 5;    // 2.4 s, feines Schwanken

// Die Achsen des Koerperraums: X nickt, Y dreht, Z neigt zur Seite.
// Muessen vor allen Listen stehen, die sie benutzen. Ein const ist
// vor seiner Zeile nicht verwendbar, das Modul wuerde beim Laden
// werfen und das ganze Spiel bliebe im Ladebildschirm haengen.
const G2B = Math.PI / 180;
const achseX = new THREE.Vector3(1, 0, 0);
const achseY = new THREE.Vector3(0, 1, 0);
const achseZ = new THREE.Vector3(0, 0, 1);

// Konstante Haltungskorrektur.
//
// Die Bindepose des Modells ist eine A-Pose: die Oberarme stehen 23.4
// Grad von der Senkrechten ab, die Haende liegen dadurch etwa 23 cm
// neben dem Koerper. So steht kein Mensch entspannt da, das sah aus
// wie ein Schaufensterpuppen-Gestell. Ein entspannt haengender Arm
// steht rund 7 Grad ab und hat den Ellbogen leicht gebeugt.
//
// Diese Werte gelten immer, unabhaengig von der Bewegung. Sie liegen
// als Erstes auf der Ruhepose, alles andere kommt darauf.
const HALTUNG = [
  // Oberarme an den Koerper. Das ist der eigentliche Fix.
  ['LeftArm',  achseZ, -16.0],
  ['RightArm', achseZ,  16.0],
  // Ellbogen leicht gebeugt, die Haende kommen dadurch nach vorn
  ['LeftForeArm',  achseX, -8.0],
  ['RightForeArm', achseX, -8.0],
  // Unterarme minimal einwaerts, die Handflaechen zeigen zum Bein
  ['LeftForeArm',  achseZ, -5.0],
  ['RightForeArm', achseZ,  5.0],
  // Schultern faellt etwas ab, ein entspannter Nacken ist nicht hochgezogen
  ['LeftShoulder',  achseZ, -2.5],
  ['RightShoulder', achseZ,  2.5],
];

// Drehung aller Vorfahren bis unter die Wurzel. Damit laesst sich eine
// Drehung aus dem Koerperraum in den Elternraum des Knochens holen.
function elternDrehung(knochen, wurzel) {
  const kette = [];
  let o = knochen.parent;
  while (o && o !== wurzel) { kette.push(o); o = o.parent; }
  const q = new THREE.Quaternion();
  for (let i = kette.length - 1; i >= 0; i--) q.multiply(kette[i].quaternion);
  return q;
}

/**
 * Baut die Standanimation aus der aktuellen Ruhepose des Skeletts.
 * Muss aufgerufen werden, solange noch keine Animation auf das
 * Skelett wirkt, sonst wird eine verbogene Pose zur Grundlage.
 */
export function baueRuheClip(wurzel) {
  const knochen = {};
  wurzel.traverse((o) => { if (o.isBone) knochen[o.name] = o; });

  const ruhe = {}, eltern = {};
  for (const name in knochen) {
    ruhe[name] = knochen[name].quaternion.clone();
    eltern[name] = elternDrehung(knochen[name], wurzel);
  }

  const anzahl = Math.round(DAUER * BILDER_PRO_S) + 1;
  const zeiten = new Float32Array(anzahl);
  for (let i = 0; i < anzahl; i++) zeiten[i] = (i / (anzahl - 1)) * DAUER;

  // Jeder Eintrag: Knochen, Achse im Koerperraum, Ausschlag in Grad,
  // Schwingung, Phasenversatz. Mehrere Eintraege je Knochen addieren sich.
  const bewegungen = [
    // Atmung. Der Brustkorb hebt sich, die untere Wirbelsaeule geht
    // leicht mit, der Kopf bleibt dadurch fast ruhig stehen.
    ['Spine01', achseX, -0.55, ATEM, 0],
    ['Spine02', achseX, -0.95, ATEM, 0],
    ['neck',    achseX,  0.70, ATEM, 0],
    ['LeftShoulder',  achseZ,  0.55, ATEM, 0],
    ['RightShoulder', achseZ, -0.55, ATEM, 0],

    // Feines Schwanken, wie es jeder stehende Mensch hat
    ['Hips',    achseX,  0.40, WIPPEN, 0.3],
    ['Spine',   achseX, -0.25, WIPPEN, 0.3],
    ['neck',    achseX,  0.70, ATEM, 0.5],

    // Arme pendeln minimal mit dem Atem
    ['LeftArm',      achseX,  0.75, WIPPEN, 0.4],
    ['RightArm',     achseX,  0.75, WIPPEN, 0.6],
    ['LeftForeArm',  achseZ,  0.55, ATEM, 0.2],
    ['RightForeArm', achseZ, -0.55, ATEM, 0.2],
  ];
  // Gewichtsverlagerung und Umsehen stecken absichtlich nicht hier
  // drin. Als Sinuskurve in einer Schleife wirken sie getaktet und
  // steif. Sie kommen aus macheStandBeleber weiter unten, mit
  // Haltephasen und zufaelligem Abstand.

  // Nach Knochen buendeln. fest sind die Haltungswerte, die immer
  // gelten, wellen die Schwingungen darauf.
  const proKnochen = {};
  const eintrag = (name) => (proKnochen[name] = proKnochen[name] || { fest: [], wellen: [] });
  for (const [name, achse, grad] of HALTUNG) {
    if (knochen[name]) eintrag(name).fest.push({ achse, grad });
  }
  for (const [name, achse, grad, welle, phase] of bewegungen) {
    if (knochen[name]) eintrag(name).wellen.push({ achse, grad, welle, phase });
  }

  const spuren = [];
  const tmp = new THREE.Quaternion();
  const wq = new THREE.Quaternion();
  const einzel = new THREE.Quaternion();
  const ek = new THREE.Quaternion();

  for (const name in knochen) {
    const werte = new Float32Array(anzahl * 4);
    const teile = proKnochen[name];
    for (let i = 0; i < anzahl; i++) {
      tmp.copy(ruhe[name]);
      if (teile) {
        // Alle Anteile als Weltdrehungen aufsammeln, dann einmal
        // in den Elternraum holen. Das haelt die Reihenfolge stabil.
        wq.identity();
        for (const h of teile.fest) {
          wq.multiply(einzel.setFromAxisAngle(h.achse, h.grad * G2B));
        }
        for (const b of teile.wellen) {
          const s = Math.sin(2 * Math.PI * (b.welle * (i / (anzahl - 1)) + b.phase));
          wq.multiply(einzel.setFromAxisAngle(b.achse, b.grad * s * G2B));
        }
        ek.copy(eltern[name]).conjugate();
        tmp.copy(ek).multiply(wq).multiply(eltern[name]).multiply(ruhe[name]);
      }
      werte[i * 4] = tmp.x; werte[i * 4 + 1] = tmp.y;
      werte[i * 4 + 2] = tmp.z; werte[i * 4 + 3] = tmp.w;
    }
    spuren.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, zeiten, werte));
  }

  return new THREE.AnimationClip('Stand', DAUER, spuren);
}

// ============================================================
// DER BELEBER
//
// Eine geschlossene Schleife aus Sinuskurven wirkt immer ein bisschen
// steif, weil alles gleichmaessig weiterschwingt und sich nach kurzer
// Zeit wiederholt. Menschen stehen anders: sie halten eine Haltung
// eine Weile, sehen sich dann um, verlagern das Gewicht, halten
// wieder. Also unregelmaessige Aktionen mit Haltephasen.
//
// Diese Schicht laeuft nach dem Mixer und legt ihre Drehungen auf das
// Ergebnis der Ueberblendung. Sie beruehrt die Knie nicht, die Knie
// bleiben bei jeder Aktion exakt auf der Ruhepose.
// ============================================================

// Weiches Anfahren eines Ziels. Kein hartes Einrasten, kein Ueberschwingen.
function annaehern(wert, ziel, tempo, dt) {
  return wert + (ziel - wert) * Math.min(1, tempo * dt);
}

export function macheStandBeleber(wurzel) {
  const knochen = {};
  wurzel.traverse((o) => { if (o.isBone) knochen[o.name] = o; });
  const eltern = {};
  for (const name in knochen) eltern[name] = elternDrehung(knochen[name], wurzel);

  // Werte, die sich weich auf ihr Ziel zubewegen. gewicht ist das
  // Standbein: minus eins links, plus eins rechts.
  const w = { kopfGier: 0, kopfNick: 0, kopfNeig: 0, gewicht: 0, schulter: 0,
              armL: 0, armR: 0 };
  const ziel = { kopfGier: 0, kopfNick: 0, kopfNeig: 0, gewicht: 0, schulter: 0,
                 armL: 0, armR: 0 };
  const tempo = { kopfGier: 2.2, kopfNick: 3.0, kopfNeig: 2.4, gewicht: 0.9, schulter: 3.5,
                  armL: 1.3, armR: 1.3 };

  let bisAktion = 1.5 + Math.random() * 2;
  let blickHalten = 0;
  const zuf = (a, b) => a + Math.random() * (b - a);

  function neueAktion() {
    const r = Math.random();
    if (r < 0.36) {
      // Umsehen. Der Kopf dreht zur Seite und bleibt eine Weile dort.
      const seite = Math.random() < 0.5 ? -1 : 1;
      ziel.kopfGier = seite * zuf(0.35, 1.0);
      ziel.kopfNick = zuf(-0.35, 0.25);
      ziel.kopfNeig = seite * zuf(0.0, 0.35);
      blickHalten = zuf(1.0, 2.6);
    } else if (r < 0.58) {
      // Gewicht auf das andere Bein. Das haelt dann laenger.
      ziel.gewicht = w.gewicht > 0 ? -zuf(0.6, 1.0) : zuf(0.6, 1.0);
    } else if (r < 0.72) {
      // Kurzes Nicken, als wuerde er etwas zur Kenntnis nehmen
      ziel.kopfNick = zuf(0.4, 0.8);
      blickHalten = zuf(0.25, 0.5);
    } else if (r < 0.84) {
      // Schulter lockern
      ziel.schulter = zuf(0.5, 1.0);
      blickHalten = zuf(0.3, 0.6);
    } else {
      // Arme neu ablegen. Beide Seiten unabhaengig, sonst wirkt es
      // wie eine Turnuebung. Meist bewegt sich nur eine Seite.
      if (Math.random() < 0.65) ziel.armL = zuf(-0.8, 0.8);
      if (Math.random() < 0.65) ziel.armR = zuf(-0.8, 0.8);
    }
    bisAktion = zuf(1.8, 4.6);
  }

  const tmpQ = new THREE.Quaternion();
  const sammel = new THREE.Quaternion();
  const ek = new THREE.Quaternion();

  // Wichtig und leicht zu uebersehen: der AnimationMixer schreibt einen
  // Knochen nur dann in die Szene, wenn sich der Wert der Animation
  // gegenueber dem letzten Bild geaendert hat. Der Standclip haelt Kopf
  // und Becken konstant, also schreibt der Mixer sie nie zurueck. Wer
  // hier einfach auf den aktuellen Wert draufmultipliziert, addiert sich
  // Bild fuer Bild auf, und nach einer Minute steht der Kopf verdreht.
  //
  // Darum merkt sich jeder Knochen zwei Dinge: den Ausgangswert, auf den
  // gerechnet wird, und das, was zuletzt geschrieben wurde. Weicht der
  // aktuelle Wert davon ab, hat der Mixer geschrieben und der neue Wert
  // wird zum Ausgangswert. Sonst bleibt der alte stehen. So wird jedes
  // Bild absolut gerechnet statt aufaddiert.
  const basis = {}, zuletzt = {};
  const fastGleich = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6
    && Math.abs(a.z - b.z) < 1e-6 && Math.abs(a.w - b.w) < 1e-6;

  function lege(name, teile) {
    const k = knochen[name];
    if (!k) return;
    if (!basis[name]) {
      basis[name] = k.quaternion.clone();
      zuletzt[name] = k.quaternion.clone();
    } else if (!fastGleich(k.quaternion, zuletzt[name])) {
      basis[name].copy(k.quaternion);
    }

    sammel.identity();
    for (let i = 0; i < teile.length; i += 2) {
      const grad = teile[i + 1];
      if (Math.abs(grad) < 0.005) continue;
      sammel.multiply(tmpQ.setFromAxisAngle(teile[i], grad * G2B));
    }
    ek.copy(eltern[name]).conjugate();
    k.quaternion.copy(basis[name])
      .premultiply(eltern[name]).premultiply(sammel).premultiply(ek);
    zuletzt[name].copy(k.quaternion);
  }

  return {
    /**
     * Nach mixer.update aufrufen.
     * staerke ist das Gewicht der Standanimation: beim Loslaufen
     * faehrt die Schicht mit herunter, sonst zappelt der Kopf
     * mitten im Schritt.
     */
    update(dt, staerke) {
      bisAktion -= dt;
      if (bisAktion <= 0) neueAktion();

      if (blickHalten > 0) {
        blickHalten -= dt;
        if (blickHalten <= 0) {
          // Zurueck nach vorn, aber nicht exakt geradeaus. Ein Mensch
          // trifft die Mitte nie genau.
          ziel.kopfGier = zuf(-0.12, 0.12);
          ziel.kopfNick = zuf(-0.10, 0.10);
          ziel.kopfNeig = 0;
          ziel.schulter = 0;
        }
      }
      for (const k in w) w[k] = annaehern(w[k], ziel[k], tempo[k], dt);

      if (staerke <= 0.003) return;
      const s = staerke;
      const g = w.gewicht * s;

      // Umsehen: Kopf fuehrt, Hals und Brustkorb gehen anteilig mit.
      // Ohne das Mitgehen sieht es aus, als sitze der Kopf auf einer Stange.
      lege('Head', [achseY, w.kopfGier * 26 * s, achseX, w.kopfNick * 9 * s,
                    achseZ, w.kopfNeig * 5 * s - g * 0.9]);
      lege('neck', [achseY, w.kopfGier * 10 * s, achseX, w.kopfNick * 4 * s]);
      lege('Spine02', [achseY, w.kopfGier * 4.0 * s]);

      // Gewichtsverlagerung: Becken kippt und dreht, der Oberkoerper
      // haelt dagegen, die Oberschenkel halten die Fuesse an Ort.
      lege('Hips', [achseZ, g * 2.6, achseY, g * 1.2]);
      lege('Spine', [achseZ, -g * 1.1, achseY, -g * 0.5]);
      lege('Spine01', [achseZ, -g * 0.7]);
      lege('LeftUpLeg', [achseZ, -g * 2.6]);
      lege('RightUpLeg', [achseZ, -g * 2.6]);

      // Arme haengen mit, Schultern lockern gelegentlich. Die Arme
      // legen sich ausserdem gelegentlich neu ab, jede Seite fuer sich.
      lege('LeftShoulder', [achseZ, w.schulter * 2.6 * s + g * 0.6]);
      lege('RightShoulder', [achseZ, -w.schulter * 2.6 * s + g * 0.6]);

      // raus ist der Ausschlag vom Koerper weg, in Grad. Nachgemessen
      // liegt die entspannte Hand nur zwei Zentimeter neben der
      // Mantelkante, und pro Grad wandert sie etwa einen Zentimeter.
      // Nach innen darf deshalb fast nichts dazukommen, sonst schiebt
      // sich die Hand sichtbar in den Mantel. Nach aussen ist frei.
      const lehne = g * 1.2;
      const rausL = Math.max(-0.8, w.armL * 3.0 * s - lehne);
      const rausR = Math.max(-0.8, w.armR * 3.0 * s + lehne);
      lege('LeftArm',  [achseZ,  rausL, achseX, w.armL * 2.6 * s]);
      lege('RightArm', [achseZ, -rausR, achseX, w.armR * 2.6 * s]);
      lege('LeftForeArm',  [achseX, w.armL * 4.5 * s]);
      lege('RightForeArm', [achseX, w.armR * 4.5 * s]);
    },
  };
}
