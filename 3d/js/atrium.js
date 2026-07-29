// ============================================================
// DAS ATRIUM — der erste Raum
//
// Nachgebaut nach dem Moodboard "Look 5": ein versunkener Betonplatz
// unter einem dunklen Torrahmen, spiegelnasser Boden, terrassierte
// Waende, eine Deckenoeffnung, durch die Licht in den Dunst faellt,
// Mammutbaeume, die durch den Raum wachsen. Und Menschen, die
// reglos nach oben getragen werden.
//
// Der Raum steht nicht auf dem Kachelraster von Arkana. Er ist von
// Hand gesetzt, mit eigener Kollision aus Rechtecken.
//
// Zum Aussehen: die Materialien bekommen ihre Normalen-, Rauheits-
// und Hohlraumkarten von aussen (pbrAus in main.js), und jede
// Geometrie skaliert ihre UVs nach ihrer echten Groesse. Ohne das
// zieht sich eine Kachel ueber eine 50 Meter lange Wand und alles
// sieht nach verwaschener Bastelgrafik aus.
// ============================================================
import * as THREE from 'three';
import { Reflector } from '../vendor/addons/objects/Reflector.js';
import { mergeGeometries } from '../vendor/addons/utils/BufferGeometryUtils.js';

// Masse des Raums. Der Spieler betritt ihn im Sueden oben und geht
// die Treppe hinunter auf den Platz.
export const ATRIUM = {
  start: { x: 0, z: 30 },          // Startposition auf der Kanzel
  startBlick: Math.PI,             // schaut nach -Z, in den Raum hinein
  mitte: { x: 0, z: 0 },           // der Lichtfleck, dort hebt es ab
  mitteRadius: 2.6,
};

const PLATZ = { x0: -26, x1: 26, z0: -26, z1: 21 };   // Bodenflaeche
const KANZEL_Y = 6.5;                                  // Hoehe der Eingangskanzel
const DECKE_Y = 34;
const LOCH = { x0: -11, x1: 11, z0: -15, z1: 5 };      // Deckenoeffnung

// Wie viele Texturkacheln auf einen Meter kommen. Ein Wert fuer den
// ganzen Raum, damit die Koernung ueberall gleich gross wirkt.
const DICHTE = 1 / 5.5;

// Kollisionsrechtecke. Alles ausserhalb der begehbaren Flaechen ist
// fest. Statt einer Kachelkarte reichen hier ein paar Rechtecke.
const SPERREN = [];
function sperre(x0, z0, x1, z1) { SPERREN.push({ x0, z0, x1, z1 }); }

export function atriumBlockiert(x, z) {
  // Ausserhalb des Gesamtgrundrisses
  if (x < PLATZ.x0 + 1 || x > PLATZ.x1 - 1) return true;
  if (z < PLATZ.z0 + 1 || z > 34) return true;
  for (const s of SPERREN) {
    if (x > s.x0 && x < s.x1 && z > s.z0 && z < s.z1) return true;
  }
  return false;
}

// Bodenhoehe an einer Stelle: die Kanzel und die Treppe liegen hoeher
// als der Platz. So laeuft die Figur sichtbar hinunter.
export function atriumBoden(x, z) {
  if (z >= 27) return KANZEL_Y;                       // Kanzel
  if (z > 21) return KANZEL_Y * (z - 21) / 6;         // Treppe nach unten
  // Grosse Freitreppe rechts hinten
  if (x > 9 && z < -6 && z > -25) {
    const t = Math.min(1, Math.max(0, (x - 9) / 14));
    return t * 10;
  }
  return 0;
}

// UVs eines Klotzes auf seine echte Groesse ziehen. Die sechs Seiten
// einer BoxGeometry liegen in fester Reihenfolge hintereinander,
// je vier Ecken. Jede Seite bekommt die Masse, die sie aufspannt.
function uvNachGroesse(g, bx, by, bz, dichte) {
  const uv = g.attributes.uv;
  const seiten = [[bz, by], [bz, by], [bx, bz], [bx, bz], [bx, by], [bx, by]];
  for (let f = 0; f < 6; f++) {
    const [sw, sh] = seiten[f];
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * sw * dichte, uv.getY(k) * sh * dichte);
    }
  }
  uv.needsUpdate = true;
}

export function baueAtrium(tex, glowTextur, istMobil) {
  const G = new THREE.Group();
  G.name = 'atrium';

  // ---------------------------------------------------------
  // Materialien. Die Karten kommen spaeter von aussen dazu, hier
  // stehen nur Farbe und Grundwerte. envMapIntensity ist der Regler
  // dafuer, wie stark der Raum sich selbst spiegelt.
  // ---------------------------------------------------------
  const mat = {};
  const beton = (farbe, rau, envI) => new THREE.MeshStandardMaterial({
    map: tex.wand, color: farbe, roughness: rau, metalness: 0.0,
    envMapIntensity: envI,
  });
  mat.hell = beton(0x8d979c, 0.9, 0.85);
  mat.mittel = beton(0x5c666d, 0.88, 0.8);
  mat.dunkel = beton(0x232a31, 0.85, 0.7);
  // Die Deckenunterseite wird gespiegelt, sie darf nicht schwarz sein
  mat.decke = new THREE.MeshStandardMaterial({
    map: tex.decke, color: 0x5b656d, roughness: 0.95, metalness: 0.0,
    envMapIntensity: 0.55,
  });
  // Kanten und Simse. Etwas glatter, damit sie Licht abgreifen und
  // die Silhouette sich von der Flaeche abhebt.
  mat.kante = beton(0xa4aeb2, 0.62, 1.15);
  // Die Schattenfuge zwischen den Platten
  mat.fuge = new THREE.MeshStandardMaterial({
    color: 0x0d1116, roughness: 1, metalness: 0, envMapIntensity: 0.15 });

  const box = (m, bx, by, bz, x, y, z, ry) => {
    const g = new THREE.BoxGeometry(bx, by, bz);
    uvNachGroesse(g, bx, by, bz, DICHTE);
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y + by / 2, z);
    if (ry) o.rotation.y = ry;
    o.castShadow = true; o.receiveShadow = true;
    G.add(o);
    return o;
  };

  // Viele gleiche Kloetze in einem Zeichenaufruf. Stufen und Rippen
  // waeren sonst je ein eigener Aufruf, das frisst die Bildrate.
  const dummy = new THREE.Object3D();
  const vieleBoxen = (m, bx, by, bz, stellen) => {
    const g = new THREE.BoxGeometry(bx, by, bz);
    uvNachGroesse(g, bx, by, bz, DICHTE);
    const im = new THREE.InstancedMesh(g, m, stellen.length);
    stellen.forEach(([x, y, z], i) => {
      dummy.position.set(x, y + by / 2, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true; im.receiveShadow = true;
    G.add(im);
    return im;
  };

  // ---------------------------------------------------------
  // Boden. Der nasse Spiegel traegt das ganze Bild. Am Handy
  // waere ein echter Spiegel ein zweiter kompletter Bilddurchlauf,
  // dort kommt stattdessen ein dunkler Glanzboden.
  // ---------------------------------------------------------
  const bw = PLATZ.x1 - PLATZ.x0, bt = PLATZ.z1 - PLATZ.z0;
  const bmx = (PLATZ.x0 + PLATZ.x1) / 2, bmz = (PLATZ.z0 + PLATZ.z1) / 2;

  if (!istMobil) {
    const spiegel = new Reflector(new THREE.PlaneGeometry(bw, bt), {
      textureWidth: 1024, textureHeight: 1024, color: 0x8e9aa0,
    });
    spiegel.rotation.x = -Math.PI / 2;
    spiegel.position.set(bmx, 0.02, bmz);
    G.add(spiegel);
  }
  // Die Bodenplatte liegt halbdurchsichtig darueber. Ihre Rauheitskarte
  // macht aus den dunklen Stellen der Textur Pfuetzen: dort ist sie
  // glatt und die Umgebungskarte spiegelt sich, daneben bleibt sie matt.
  const bodenGeo = new THREE.PlaneGeometry(bw, bt);
  {
    const uv = bodenGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * bw * DICHTE, uv.getY(i) * bt * DICHTE);
    }
    uv.needsUpdate = true;
  }
  mat.boden = new THREE.MeshStandardMaterial({
    map: tex.boden,
    color: istMobil ? 0x4a555d : 0x59646d,
    roughness: 0.5, metalness: 0.0,
    envMapIntensity: istMobil ? 1.5 : 1.0,
    transparent: !istMobil, opacity: istMobil ? 1 : 0.62,
  });
  const boden = new THREE.Mesh(bodenGeo, mat.boden);
  boden.rotation.x = -Math.PI / 2;
  boden.position.set(bmx, istMobil ? 0.0 : 0.05, bmz);
  boden.receiveShadow = true;
  G.add(boden);

  // ---------------------------------------------------------
  // Terrassierte Waende. Jede Stufe springt zurueck, das erzeugt
  // die geschichtete Silhouette aus dem Moodboard. Auf jede Stufe
  // kommt ein heller Sims und darunter eine dunkle Schattenfuge.
  // Diese zwei Streifen sind der Unterschied zwischen einem Klotz
  // und einer gebauten Wand.
  // ---------------------------------------------------------
  const stufen = 5;
  for (let i = 0; i < stufen; i++) {
    const y = i * 7;
    const rueck = i * 2.4;
    const h = 7.2;
    const tiefe = 7 + rueck;
    const flaeche = i === 0 ? mat.hell : (i % 2 ? mat.mittel : mat.hell);
    // Die Innenkante jeder Stufe wandert nach aussen, der Raum oeffnet
    // sich also nach oben. Vorher war sie fuer alle Stufen gleich, damit
    // stand da eine glatte Wand statt der geschichteten Silhouette.
    const iL = PLATZ.x0 + 0.5 - rueck;      // innere Kante links
    const iR = PLATZ.x1 - 0.5 + rueck;      // rechts
    const iH = PLATZ.z0 + 0.5 - rueck;      // hinten
    box(flaeche, tiefe, h, bt + 30, iL - tiefe / 2, y, bmz);
    box(flaeche, tiefe, h, bt + 30, iR + tiefe / 2, y, bmz);
    box(flaeche, bw + 40, h, tiefe, bmx, y, iH - tiefe / 2);

    // Sims obenauf, ragt in den Raum. Er sitzt auf der Stufe, nicht
    // buendig in ihrer Oberflaeche, sonst flimmern beide Flaechen.
    box(mat.kante, 2.0, 0.5, bt + 30, iL + 0.4, y + h, bmz);
    box(mat.kante, 2.0, 0.5, bt + 30, iR - 0.4, y + h, bmz);
    box(mat.kante, bw + 40, 0.5, 2.0, bmx, y + h, iH + 0.4);
    // Schattenfuge knapp darunter, steht minimal vor der Wandflaeche
    box(mat.fuge, 0.3, 0.45, bt + 30, iL + 0.15, y + h - 1.1, bmz);
    box(mat.fuge, 0.3, 0.45, bt + 30, iR - 0.15, y + h - 1.1, bmz);
    box(mat.fuge, bw + 40, 0.45, 0.3, bmx, y + h - 1.1, iH + 0.15);
  }
  sperre(PLATZ.x0 - 12, PLATZ.z0 - 12, PLATZ.x0 + 1, 34);
  sperre(PLATZ.x1 - 1, PLATZ.z0 - 12, PLATZ.x1 + 12, 34);
  sperre(PLATZ.x0 - 12, PLATZ.z0 - 12, PLATZ.x1 + 12, PLATZ.z0 + 1);

  // Senkrechte Rippen auf der untersten Wandstufe. Sie brechen die
  // grosse leere Flaeche und geben dem Streiflicht etwas zu tun.
  {
    const stellen = [];
    for (let z = PLATZ.z0 + 3; z < PLATZ.z1 + 2; z += 5.5) {
      stellen.push([PLATZ.x0 + 0.35, 0, z], [PLATZ.x1 - 0.35, 0, z]);
    }
    for (let x = PLATZ.x0 + 4; x < PLATZ.x1 - 2; x += 5.5) {
      stellen.push([x, 0, PLATZ.z0 + 0.35]);
    }
    vieleBoxen(mat.mittel, 0.7, 6.6, 0.7, stellen);
  }

  // Fensterschlitze in der Rueckwand, wie im Bild. Selbstleuchtend,
  // damit der Bloom sie aufgreift, mit einem weichen Schein davor.
  {
    const fensterMat = new THREE.MeshBasicMaterial({ color: 0xdbe9ee });
    const scheinMat = new THREE.SpriteMaterial({
      map: glowTextur, color: 0xcfe2e8, transparent: true, opacity: 0.26,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (let i = 0; i < 7; i++) {
      const x = -18 + i * 6, y = 20 + (i % 2) * 4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), fensterMat);
      m.position.set(x, y, PLATZ.z0 + 1.6);
      G.add(m);
      const s = new THREE.Sprite(scheinMat);
      s.scale.set(3.6, 3.6, 1);
      s.position.set(x, y, PLATZ.z0 + 2.4);
      G.add(s);
    }
  }

  // ---------------------------------------------------------
  // Decke mit rechteckiger Oeffnung. Vier Platten rahmen das Loch,
  // eine umlaufende Kante fasst es ein.
  // ---------------------------------------------------------
  const d = 3;
  box(mat.decke, bw + 24, d, Math.abs(LOCH.z0 - (PLATZ.z0 - 14)), bmx, DECKE_Y,
      (LOCH.z0 + (PLATZ.z0 - 14)) / 2);
  box(mat.decke, bw + 24, d, Math.abs((PLATZ.z1 + 14) - LOCH.z1), bmx, DECKE_Y,
      (LOCH.z1 + (PLATZ.z1 + 14)) / 2);
  box(mat.decke, Math.abs(LOCH.x0 - (PLATZ.x0 - 14)), d, LOCH.z1 - LOCH.z0,
      (LOCH.x0 + (PLATZ.x0 - 14)) / 2, DECKE_Y, (LOCH.z0 + LOCH.z1) / 2);
  box(mat.decke, Math.abs((PLATZ.x1 + 14) - LOCH.x1), d, LOCH.z1 - LOCH.z0,
      ((PLATZ.x1 + 14) + LOCH.x1) / 2, DECKE_Y, (LOCH.z0 + LOCH.z1) / 2);
  // Laibung der Oeffnung, heller, faengt das Himmelslicht
  {
    const lz = LOCH.z1 - LOCH.z0, lx = LOCH.x1 - LOCH.x0;
    box(mat.kante, 0.7, d + 0.4, lz, LOCH.x0 - 0.35, DECKE_Y - 0.2, (LOCH.z0 + LOCH.z1) / 2);
    box(mat.kante, 0.7, d + 0.4, lz, LOCH.x1 + 0.35, DECKE_Y - 0.2, (LOCH.z0 + LOCH.z1) / 2);
    box(mat.kante, lx + 1.4, d + 0.4, 0.7, (LOCH.x0 + LOCH.x1) / 2, DECKE_Y - 0.2, LOCH.z0 - 0.35);
    box(mat.kante, lx + 1.4, d + 0.4, 0.7, (LOCH.x0 + LOCH.x1) / 2, DECKE_Y - 0.2, LOCH.z1 + 0.35);
  }

  // ---------------------------------------------------------
  // Eingangskanzel im Sueden mit dunklem Torrahmen. Von hier aus
  // sieht man in den Raum, genau wie im Moodboard.
  // ---------------------------------------------------------
  box(mat.hell, 30, KANZEL_Y, 9, 0, 0, 31.5);                   // Kanzelblock
  // Das Gesimsband sitzt unter der Oberkante und steht vor. Buendig
  // mit der Oberflaeche wuerden beide Ebenen gegeneinander flimmern.
  box(mat.kante, 30.8, 0.45, 9.8, 0, KANZEL_Y - 1.0, 31.5);
  // Treppe hinunter, alle Stufen in einem Aufruf
  {
    const stellen = [];
    for (let i = 0; i < 12; i++) stellen.push([0, i * (KANZEL_Y / 12), 21.4 + i * 0.5]);
    vieleBoxen(mat.hell, 18, KANZEL_Y / 12, 0.55, stellen);
  }
  // Der Torrahmen, unter dem man steht
  box(mat.dunkel, 44, 12, 5, 0, KANZEL_Y + 9, 33);              // Sturz oben
  box(mat.dunkel, 9, 16, 6, -19, KANZEL_Y, 31);                 // Pfeiler links
  box(mat.dunkel, 9, 16, 6, 19, KANZEL_Y, 31);                  // Pfeiler rechts
  box(mat.kante, 44.6, 0.6, 5.6, 0, KANZEL_Y + 8.4, 33);        // Lichtkante am Sturz
  // Gelaender links und rechts der Treppe
  for (const s of [-1, 1]) {
    box(mat.hell, 0.8, 1.2, 9, s * 9.4, KANZEL_Y * 0.5, 25);
    box(mat.kante, 1.0, 0.22, 9.2, s * 9.4, KANZEL_Y * 0.5 + 1.2, 25);
  }

  // ---------------------------------------------------------
  // Grosse Freitreppe rechts hinten
  // ---------------------------------------------------------
  {
    // Die Stufen sind unterschiedlich hoch, die bleiben einzeln.
    for (let i = 0; i < 14; i++) box(mat.hell, 1.05, 10 - i * 0.7, 19, 9.5 + i, 0, -15);
    // Die Kantenbaender sind alle gleich, die gehen in einen Aufruf.
    const stellen = [];
    for (let i = 0; i < 14; i++) stellen.push([9.5 + i, 10 - i * 0.7, -15]);
    vieleBoxen(mat.kante, 1.15, 0.18, 19.1, stellen);
  }

  // ---------------------------------------------------------
  // Pflanzinsel mit knorrigem Baum, wie im Bild
  // ---------------------------------------------------------
  box(mat.dunkel, 11, 1.1, 7, 1, 0, -11);
  box(mat.kante, 11.4, 0.2, 7.4, 1, 1.1, -11);
  sperre(-4.5, -14.5, 6.5, -7.5);
  {
    const stamm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.55, 4.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 1, envMapIntensity: 0.4 }));
    stamm.position.set(1, 3.3, -11); stamm.castShadow = true; G.add(stamm);
    const kroneMat = new THREE.MeshStandardMaterial({
      color: 0x3d4a3a, roughness: 1, flatShading: true, envMapIntensity: 0.5 });
    for (const [ox, oy, oz, r] of [[0,2.6,0,2.2],[-1.3,2.0,0.6,1.4],[1.4,2.2,-0.5,1.5]]) {
      const k = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), kroneMat);
      k.position.set(1 + ox, 4.5 + oy, -11 + oz);
      k.rotation.set(ox, oy, oz);
      k.castShadow = true; G.add(k);
    }
  }

  // ---------------------------------------------------------
  // Mammutbaeume, die durch den Raum nach oben wachsen. Die Krone
  // ist jetzt geschichtet statt ein einzelner Klumpen, und leicht
  // flach gedrueckt. Das liest sich aus der Ferne als Nadelbaum.
  // ---------------------------------------------------------
  const rindeMat = new THREE.MeshStandardMaterial({
    map: tex.wand, color: 0x4a3c30, roughness: 1, envMapIntensity: 0.35 });
  const nadelMat = new THREE.MeshStandardMaterial({
    color: 0x2b382f, roughness: 1, flatShading: true, envMapIntensity: 0.45 });
  // Alle Kronen der drei Baeume landen in einer einzigen Geometrie.
  // Als 33 Einzelmeshes waeren sie ein spuerbarer Teil des Budgets,
  // dabei bewegen sie sich nie.
  const kronenTeile = [];
  for (const [x, z, r, h] of [[-15, -14, 1.5, 44], [-8.5, -21, 1.1, 40], [-19.5, -6, 1.3, 38]]) {
    const g = new THREE.CylinderGeometry(r * 0.5, r, h, 10, 1);
    const st = new THREE.Mesh(g, rindeMat);
    st.position.set(x, h / 2, z); st.castShadow = true; G.add(st);
    sperre(x - r - 0.5, z - r - 0.5, x + r + 0.5, z + r + 0.5);
    for (let i = 0; i < 11; i++) {
      const y = 10 + i * 3.1;
      const rr = (3.2 + Math.sin(i * 1.7) * 0.7) * (1 - i * 0.052);
      const kg = new THREE.IcosahedronGeometry(rr, 1);
      kg.scale(1, 0.62, 1);
      kg.rotateY(i * 0.7);
      kg.translate(x + Math.sin(i * 2.3) * 1.2, y, z + Math.cos(i * 1.9) * 1.2);
      kronenTeile.push(kg);
    }
  }
  {
    const kronen = new THREE.Mesh(mergeGeometries(kronenTeile, false), nadelMat);
    kronenTeile.forEach((g) => g.dispose());
    kronen.castShadow = true;
    G.add(kronen);
  }

  // ---------------------------------------------------------
  // Kleinkram auf dem Platz. Ein Raum ohne Massstabsgeber wirkt
  // wie ein leeres Modell. Ein paar Betonbroecken reichen.
  // ---------------------------------------------------------
  {
    const stellen = [[-9, 0, 8], [-7.4, 0, 9.2], [13, 0, 6], [-21, 0, -3],
                     [17, 0, 13], [-14, 0, 16], [7, 0, 17]];
    vieleBoxen(mat.mittel, 1.1, 0.55, 1.4, stellen);
    vieleBoxen(mat.hell, 0.6, 0.35, 0.7,
      stellen.map(([x, y, z]) => [x + 1.3, y, z - 0.9]));
  }

  // ---------------------------------------------------------
  // Licht: ein Schacht durch die Deckenoeffnung
  // ---------------------------------------------------------
  const schachtMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, fog: false,
    uniforms: { farbe: { value: new THREE.Color(0xdfeef0) }, staerke: { value: 0.30 } },
    vertexShader: `varying float vH; varying vec3 vNw; varying vec3 vPw;
      void main(){ vH = uv.y;
        vec4 wp = modelMatrix * vec4(position, 1.0); vPw = wp.xyz;
        vNw = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform vec3 farbe; uniform float staerke;
      varying float vH; varying vec3 vNw; varying vec3 vPw;
      void main(){
        vec3 v = normalize(cameraPosition - vPw);
        float rim = 1.0 - abs(dot(normalize(vNw), v));
        float oben = smoothstep(0.0, 0.30, vH);
        float unten = 1.0 - smoothstep(0.55, 1.0, vH);
        gl_FragColor = vec4(farbe, staerke * rim * rim * oben * unten);
      }`,
  });
  const cx = (LOCH.x0 + LOCH.x1) / 2, cz = (LOCH.z0 + LOCH.z1) / 2;
  {
    // Verjuengter Zylinder, unten weiter als oben. Als Kasten sah der
    // Schacht aus wie eine weisse Platte, erst die Rundung und die
    // Silhouettenkante lassen ihn als Volumen lesen.
    const r = (LOCH.x1 - LOCH.x0) * 0.42;
    for (const [ro, ru, st] of [[r * 0.7, r * 1.25, 0.22], [r * 1.15, r * 1.9, 0.10]]) {
      const g = new THREE.CylinderGeometry(ro, ru, DECKE_Y, 18, 1, true);
      g.translate(0, DECKE_Y / 2, 0);
      const m = new THREE.Mesh(g, schachtMat.clone());
      m.material.uniforms.staerke.value = st;
      m.position.set(cx, 0, cz);
      m.renderOrder = 2;
      G.add(m);
    }
  }

  // Staub im Lichtschacht. Einzelne Partikel, die im Licht treiben,
  // sind der billigste Weg zu echter Tiefe in einem Innenraum.
  let staub = null, staubGeo = null;
  {
    const anzahl = istMobil ? 260 : 620;
    const pos = new Float32Array(anzahl * 3);
    const tempo = new Float32Array(anzahl);
    const rw = (LOCH.x1 - LOCH.x0) * 0.62, rt = (LOCH.z1 - LOCH.z0) * 0.62;
    for (let i = 0; i < anzahl; i++) {
      pos[i*3]   = cx + (Math.random() - 0.5) * rw;
      pos[i*3+1] = Math.random() * DECKE_Y;
      pos[i*3+2] = cz + (Math.random() - 0.5) * rt;
      tempo[i] = 0.12 + Math.random() * 0.5;
    }
    staubGeo = new THREE.BufferGeometry();
    staubGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sm = new THREE.PointsMaterial({
      map: glowTextur, color: 0xf0f8fa, size: 0.16, sizeAttenuation: true,
      transparent: true, opacity: 0.85, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false });
    staub = new THREE.Points(staubGeo, sm);
    staub.frustumCulled = false;
    staub.userData.tempo = tempo;
    G.add(staub);
  }

  // Das Licht selbst, von oben durch die Oeffnung
  const himmelslicht = new THREE.DirectionalLight(0xeaf4f6, 2.6);
  himmelslicht.position.set(2, 90, 4);
  himmelslicht.target.position.set(0, 0, 4);
  if (!istMobil) {
    himmelslicht.castShadow = true;
    himmelslicht.shadow.mapSize.set(2048, 2048);
    himmelslicht.shadow.camera.near = 20; himmelslicht.shadow.camera.far = 140;
    // Der Ausschnitt muss den ganzen Raum fassen, Kanzel im Sueden
    // eingeschlossen. Vorher endete er bei z=30, mitten auf der Kanzel,
    // und genau dort lag eine harte helle Kante quer durchs Bild.
    const R = 38;
    himmelslicht.shadow.camera.left = -R; himmelslicht.shadow.camera.right = R;
    himmelslicht.shadow.camera.top = R; himmelslicht.shadow.camera.bottom = -R;
    himmelslicht.shadow.bias = -0.0006;
    himmelslicht.shadow.normalBias = 0.04;
  }
  G.add(himmelslicht, himmelslicht.target);

  // Der Lichtfleck in der Mitte, das Ziel
  const fleckMat = new THREE.MeshBasicMaterial({
    color: 0xfff2dc, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false });
  const fleck = new THREE.Mesh(new THREE.CircleGeometry(ATRIUM.mitteRadius, 32), fleckMat);
  fleck.rotation.x = -Math.PI / 2;
  fleck.position.set(ATRIUM.mitte.x, 0.09, ATRIUM.mitte.z);
  G.add(fleck);
  const fleckLicht = new THREE.PointLight(0xfff0d8, 6, 22, 2);
  fleckLicht.position.set(ATRIUM.mitte.x, 3, ATRIUM.mitte.z);
  G.add(fleckLicht);

  // Streiflicht auf die Kanzel und die Treppe, sonst steht man im Schwarzen
  const kanzelLicht = new THREE.PointLight(0xbcd0d8, 9, 34, 2);
  kanzelLicht.position.set(0, KANZEL_Y + 5, 24);
  G.add(kanzelLicht);

  // Zwei schwache Fuelllichter an den Seitenwaenden. Das Himmelslicht
  // faellt senkrecht und trifft die senkrechten Wandflaechen kaum,
  // ohne diese beiden steht der Spieler am Rand im Schwarzen.
  for (const s of [-1, 1]) {
    const f = new THREE.PointLight(0x9fb6c4, 5.5, 46, 2);
    f.position.set(s * 21, 11, -4);
    G.add(f);
  }

  // ---------------------------------------------------------
  // Deckenspots, als Punktwolke in einem Zeichenaufruf
  // ---------------------------------------------------------
  {
    const punkte = [];
    for (let i = 0; i < 22; i++) {
      const x = -22 + (i % 6) * 9 + ((i / 6) | 0) * 2.5;
      const z = PLATZ.z1 + 6 - ((i / 6) | 0) * 11;
      if (x > LOCH.x0 - 3 && x < LOCH.x1 + 3 && z > LOCH.z0 - 3 && z < LOCH.z1 + 3) continue;
      punkte.push(x, DECKE_Y - 0.4, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(punkte), 3));
    // Klein und zurueckhaltend. Zu gross gelesen wirken sie wie
    // Unschaerfekreise, die vor dem Raum haengen, statt wie Leuchten
    // an der Decke.
    const m = new THREE.PointsMaterial({
      map: glowTextur, color: 0xdcecf0, size: 1.5, sizeAttenuation: true,
      transparent: true, opacity: 0.6, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: true });
    G.add(new THREE.Points(geo, m));
  }

  // ---------------------------------------------------------
  // Die Schwebenden. Dunkle Silhouetten, die reglos nach oben
  // getragen werden. Das Herzstueck des Moodboards.
  // ---------------------------------------------------------
  const leute = [];
  const leibMat = new THREE.MeshStandardMaterial({
    color: 0x161b21, roughness: 0.85, envMapIntensity: 0.6 });
  const ANZAHL_LEUTE = 12;
  let leuteMesh = null;
  {
    // Eine Figur besteht aus sechs Teilen. Als einzelne Meshes waeren
    // das zwoelf mal sechs Zeichenaufrufe, mehr als der ganze Rest des
    // Raums. Zusammengefasst und instanziert ist es genau einer.
    const teile = [];
    const nimm = (g, x, y, z, rz) => {
      if (rz) g.rotateZ(rz);
      g.translate(x, y, z);
      teile.push(g);
    };
    nimm(new THREE.CapsuleGeometry(0.30, 1.15, 4, 10), 0, 1.0, 0);
    nimm(new THREE.SphereGeometry(0.24, 12, 10), 0, 1.85, 0);
    for (const s of [-1, 1]) {
      nimm(new THREE.CapsuleGeometry(0.10, 0.75, 3, 7), s * 0.34, 0.92, 0, s * 0.14);
      nimm(new THREE.CapsuleGeometry(0.12, 0.85, 3, 7), s * 0.15, 0.05, 0);
    }
    const geo = mergeGeometries(teile, false);
    teile.forEach((g) => g.dispose());
    leuteMesh = new THREE.InstancedMesh(geo, leibMat, ANZAHL_LEUTE);
    leuteMesh.castShadow = true;
    leuteMesh.frustumCulled = false;
    G.add(leuteMesh);
  }
  for (let i = 0; i < ANZAHL_LEUTE; i++) {
    leute.push({
      x: -20 + Math.random() * 34, z: -24 + Math.random() * 30,
      y: 1 + Math.random() * 34,
      tempo: 0.5 + Math.random() * 0.8,
      pendel: Math.random() * 6.28, neigung: (Math.random() - 0.5) * 0.5,
    });
  }

  function neuLeute(d) {
    d.y = -3 - Math.random() * 4;
    d.x = -18 + Math.random() * 30;
    d.z = -22 + Math.random() * 26;
    d.tempo = 0.5 + Math.random() * 0.8;
  }

  function update(dt, t) {
    leute.forEach((d, i) => {
      d.y += d.tempo * dt;
      if (d.y > 46) neuLeute(d);
      dummy.position.set(d.x + Math.sin(t * 0.3 + d.pendel) * 0.5, d.y,
                         d.z + Math.cos(t * 0.22 + d.pendel) * 0.4);
      // Reglos haengend, leicht kippend. Sie wehren sich nicht.
      dummy.rotation.set(d.neigung + Math.sin(t * 0.4 + d.pendel) * 0.08,
                         t * 0.06 + d.pendel,
                         Math.sin(t * 0.33 + d.pendel) * 0.10);
      dummy.updateMatrix();
      leuteMesh.setMatrixAt(i, dummy.matrix);
    });
    leuteMesh.instanceMatrix.needsUpdate = true;
    // Staub steigt langsam und faengt oben wieder unten an
    if (staub) {
      const p = staubGeo.attributes.position;
      const tempo = staub.userData.tempo;
      for (let i = 0; i < p.count; i++) {
        let y = p.getY(i) + tempo[i] * dt;
        if (y > DECKE_Y) y -= DECKE_Y;
        p.setY(i, y);
        p.setX(i, p.getX(i) + Math.sin(t * 0.4 + i) * dt * 0.06);
      }
      p.needsUpdate = true;
    }
    fleckMat.opacity = 0.38 + 0.18 * Math.sin(t * 1.3);
    fleckLicht.intensity = 5 + 2 * Math.sin(t * 1.3);
  }

  return { gruppe: G, update, licht: himmelslicht, mat };
}
