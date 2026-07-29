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
const GEWICHT = 2;   // 6.0 s, Verlagerung von einem Bein aufs andere
const KOPF = 1;      // 12.0 s, langsames Umsehen
const WIPPEN = 5;    // 2.4 s, feines Schwanken

const G2B = Math.PI / 180;
const achseX = new THREE.Vector3(1, 0, 0);
const achseY = new THREE.Vector3(0, 1, 0);
const achseZ = new THREE.Vector3(0, 0, 1);

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

    // Gewichtsverlagerung. Das Becken kippt langsam zur Seite, der
    // Oberkoerper haelt mit einer Gegenneigung das Gleichgewicht.
    ['Hips',    achseZ,  1.40, GEWICHT, 0],
    ['Spine',   achseZ, -0.75, GEWICHT, 0],
    ['Spine01', achseZ, -0.45, GEWICHT, 0],
    // Die Oberschenkel halten dagegen, sonst rutschen die Fuesse
    // mit dem kippenden Becken zur Seite.
    ['LeftUpLeg',  achseZ, -1.40, GEWICHT, 0],
    ['RightUpLeg', achseZ, -1.40, GEWICHT, 0],
    // Das Becken dreht bei der Verlagerung leicht mit
    ['Hips',    achseY,  0.80, GEWICHT, 0.25],

    // Feines Schwanken, wie es jeder stehende Mensch hat
    ['Hips',    achseX,  0.40, WIPPEN, 0.3],
    ['Spine',   achseX, -0.25, WIPPEN, 0.3],

    // Umsehen. Der Kopf wandert langsam hin und her, mit einer zweiten
    // langsameren Welle, damit es nicht wie ein Metronom wirkt.
    ['Head',    achseY,  6.50, KOPF, 0],
    ['Head',    achseY,  2.20, GEWICHT, 0.37],
    ['Head',    achseX,  1.60, GEWICHT, 0.55],
    ['neck',    achseY,  2.60, KOPF, 0],
    ['neck',    achseX,  0.70, ATEM, 0.5],

    // Arme haengen und pendeln minimal mit der Verlagerung
    ['LeftArm',      achseZ,  1.70, GEWICHT, 0.12],
    ['RightArm',     achseZ, -1.70, GEWICHT, 0.12],
    ['LeftForeArm',  achseZ,  1.00, GEWICHT, 0.20],
    ['RightForeArm', achseZ, -1.00, GEWICHT, 0.20],
    ['LeftArm',      achseX,  0.75, WIPPEN, 0.4],
    ['RightArm',     achseX,  0.75, WIPPEN, 0.6],
  ];

  // Nach Knochen buendeln
  const proKnochen = {};
  for (const [name, achse, grad, welle, phase] of bewegungen) {
    if (!knochen[name]) continue;
    (proKnochen[name] = proKnochen[name] || []).push({ achse, grad, welle, phase });
  }

  const spuren = [];
  const tmp = new THREE.Quaternion();
  const wq = new THREE.Quaternion();

  for (const name in knochen) {
    const werte = new Float32Array(anzahl * 4);
    const teile = proKnochen[name];
    for (let i = 0; i < anzahl; i++) {
      tmp.copy(ruhe[name]);
      if (teile) {
        // Alle Anteile als Weltdrehungen aufsammeln, dann einmal
        // in den Elternraum holen. Das haelt die Reihenfolge stabil.
        wq.identity();
        for (const b of teile) {
          const s = Math.sin(2 * Math.PI * (b.welle * (i / (anzahl - 1)) + b.phase));
          wq.multiply(new THREE.Quaternion().setFromAxisAngle(b.achse, b.grad * s * G2B));
        }
        const ek = eltern[name].clone().conjugate();
        tmp.copy(ek).multiply(wq).multiply(eltern[name]).multiply(ruhe[name]);
      }
      werte[i * 4] = tmp.x; werte[i * 4 + 1] = tmp.y;
      werte[i * 4 + 2] = tmp.z; werte[i * 4 + 3] = tmp.w;
    }
    spuren.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, zeiten, werte));
  }

  return new THREE.AnimationClip('Stand', DAUER, spuren);
}
