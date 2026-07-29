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
// ============================================================
import * as THREE from 'three';
import { Reflector } from '../vendor/addons/objects/Reflector.js';

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

const dummy = new THREE.Object3D();

export function baueAtrium(matWand, matBoden, glowTextur, istMobil) {
  const G = new THREE.Group();
  G.name = 'atrium';

  const betonHell = new THREE.MeshStandardMaterial({
    map: matWand.map, normalMap: matWand.normalMap,
    color: 0x7e8a90, roughness: 0.92, metalness: 0.02,
  });
  const betonDunkel = new THREE.MeshStandardMaterial({
    map: matWand.map, normalMap: matWand.normalMap,
    color: 0x1e242a, roughness: 0.9, metalness: 0.02,
  });
  // Die Deckenunterseite wird gespiegelt, sie darf nicht schwarz sein
  const betonDecke = new THREE.MeshStandardMaterial({
    map: matWand.map, normalMap: matWand.normalMap,
    color: 0x555f66, roughness: 0.95, metalness: 0.02,
  });

  const box = (mat, bx, by, bz, x, y, z, ry) => {
    const g = new THREE.BoxGeometry(bx, by, bz);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y + by / 2, z);
    if (ry) m.rotation.y = ry;
    m.castShadow = true; m.receiveShadow = true;
    G.add(m);
    return m;
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
      textureWidth: 1024, textureHeight: 1024, color: 0x9aa8ac,
    });
    spiegel.rotation.x = -Math.PI / 2;
    spiegel.position.set(bmx, 0.02, bmz);
    G.add(spiegel);
  }
  // Immer eine Bodenplatte darunter oder darueber, damit der Spiegel
  // nicht als leere Flaeche wirkt und Schatten etwas auffangen
  const bodenMat = new THREE.MeshStandardMaterial({
    map: matBoden.map, normalMap: matBoden.normalMap,
    // metalness ohne Umgebungskarte rendert in Three.js schwarz. Der
    // nasse Glanz kommt hier aus der Spiegelung darunter, nicht aus
    // dem Material.
    color: istMobil ? 0x39434a : 0x424d55,
    roughness: 0.55, metalness: 0.0,
    transparent: !istMobil, opacity: istMobil ? 1 : 0.5,
  });
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(bw, bt), bodenMat);
  boden.rotation.x = -Math.PI / 2;
  boden.position.set(bmx, istMobil ? 0.0 : 0.05, bmz);
  boden.receiveShadow = true;
  G.add(boden);

  // ---------------------------------------------------------
  // Terrassierte Waende. Jede Stufe springt zurueck, das erzeugt
  // die geschichtete Silhouette aus dem Moodboard.
  // ---------------------------------------------------------
  const stufen = 5;
  for (let i = 0; i < stufen; i++) {
    const y = i * 7;
    const rueck = i * 2.4;
    const h = 7.2;
    // links
    box(betonHell, 7 + rueck, h, bt + 14, PLATZ.x0 - 3 - rueck / 2, y, bmz);
    // rechts
    box(betonHell, 7 + rueck, h, bt + 14, PLATZ.x1 + 3 + rueck / 2, y, bmz);
    // hinten
    box(betonHell, bw + 24, h, 7 + rueck, bmx, y, PLATZ.z0 - 3 - rueck / 2);
  }
  sperre(PLATZ.x0 - 12, PLATZ.z0 - 12, PLATZ.x0 + 1, 34);
  sperre(PLATZ.x1 - 1, PLATZ.z0 - 12, PLATZ.x1 + 12, 34);
  sperre(PLATZ.x0 - 12, PLATZ.z0 - 12, PLATZ.x1 + 12, PLATZ.z0 + 1);

  // Fensterschlitze in der Rueckwand, wie im Bild
  const fensterMat = new THREE.MeshBasicMaterial({ color: 0xcfe0e4 });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), fensterMat);
    m.position.set(-18 + i * 6, 20 + (i % 2) * 4, PLATZ.z0 + 1.6);
    G.add(m);
  }

  // ---------------------------------------------------------
  // Decke mit rechteckiger Oeffnung. Vier Platten rahmen das Loch.
  // ---------------------------------------------------------
  const LOCH = { x0: -11, x1: 11, z0: -15, z1: 5 };
  const d = 3;
  box(betonDecke, bw + 24, d, Math.abs(LOCH.z0 - (PLATZ.z0 - 14)), bmx, DECKE_Y,
      (LOCH.z0 + (PLATZ.z0 - 14)) / 2);
  box(betonDecke, bw + 24, d, Math.abs((PLATZ.z1 + 14) - LOCH.z1), bmx, DECKE_Y,
      (LOCH.z1 + (PLATZ.z1 + 14)) / 2);
  box(betonDecke, Math.abs(LOCH.x0 - (PLATZ.x0 - 14)), d, LOCH.z1 - LOCH.z0,
      (LOCH.x0 + (PLATZ.x0 - 14)) / 2, DECKE_Y, (LOCH.z0 + LOCH.z1) / 2);
  box(betonDecke, Math.abs((PLATZ.x1 + 14) - LOCH.x1), d, LOCH.z1 - LOCH.z0,
      ((PLATZ.x1 + 14) + LOCH.x1) / 2, DECKE_Y, (LOCH.z0 + LOCH.z1) / 2);

  // ---------------------------------------------------------
  // Eingangskanzel im Sueden mit dunklem Torrahmen. Von hier aus
  // sieht man in den Raum, genau wie im Moodboard.
  // ---------------------------------------------------------
  // Der Kanzelblock reichte bis z=24 und deckte damit die halbe Treppe
  // zu. Und er war aus dem dunklen Beton, dadurch lag vor dem Spieler
  // eine schwarze Flaeche quer durchs Bild. Jetzt kuerzer und hell.
  box(betonHell, 30, KANZEL_Y, 9, 0, 0, 31.5);                  // Kanzelblock
  // Treppe hinunter
  for (let i = 0; i < 12; i++) {
    box(betonHell, 18, KANZEL_Y / 12, 0.55, 0, i * (KANZEL_Y / 12), 21.4 + i * 0.5);
  }
  // Der Torrahmen, unter dem man steht
  box(betonDunkel, 44, 12, 5, 0, KANZEL_Y + 9, 33);             // Sturz oben
  box(betonDunkel, 9, 16, 6, -19, KANZEL_Y, 31);                // Pfeiler links
  box(betonDunkel, 9, 16, 6, 19, KANZEL_Y, 31);                 // Pfeiler rechts
  // Gelaender links und rechts der Treppe
  for (const s of [-1, 1]) {
    box(betonHell, 0.8, 1.2, 9, s * 9.4, KANZEL_Y * 0.5, 25);
  }

  // ---------------------------------------------------------
  // Grosse Freitreppe rechts hinten
  // ---------------------------------------------------------
  for (let i = 0; i < 14; i++) {
    box(betonHell, 1.05, 10 - i * 0.7, 19, 9.5 + i, 0, -15);
  }

  // ---------------------------------------------------------
  // Pflanzinsel mit knorrigem Baum, wie im Bild
  // ---------------------------------------------------------
  box(betonDunkel, 11, 1.1, 7, 1, 0, -11);
  sperre(-4.5, -14.5, 6.5, -7.5);
  {
    const stamm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.55, 4.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 1 }));
    stamm.position.set(1, 3.3, -11); stamm.castShadow = true; G.add(stamm);
    const kroneMat = new THREE.MeshStandardMaterial({ color: 0x3d4a3a, roughness: 1 });
    for (const [ox, oy, oz, r] of [[0,2.6,0,2.2],[-1.3,2.0,0.6,1.4],[1.4,2.2,-0.5,1.5]]) {
      const k = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), kroneMat);
      k.position.set(1 + ox, 4.5 + oy, -11 + oz); k.castShadow = true; G.add(k);
    }
  }

  // ---------------------------------------------------------
  // Mammutbaeume, die durch den Raum nach oben wachsen
  // ---------------------------------------------------------
  const rindeMat = new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 1 });
  const nadelMat = new THREE.MeshStandardMaterial({ color: 0x2e3c33, roughness: 1 });
  for (const [x, z, r, h] of [[-15, -14, 1.5, 44], [-8.5, -21, 1.1, 40], [-19.5, -6, 1.3, 38]]) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, h, 8), rindeMat);
    st.position.set(x, h / 2, z); st.castShadow = true; G.add(st);
    sperre(x - r - 0.5, z - r - 0.5, x + r + 0.5, z + r + 0.5);
    for (let i = 0; i < 7; i++) {
      const y = 12 + i * 4.4;
      const rr = (2.8 + Math.sin(i * 1.7) * 0.9) * (1 - i * 0.055);
      const k = new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 0), nadelMat);
      k.position.set(x + Math.sin(i * 2.3) * 1.6, y, z + Math.cos(i * 1.9) * 1.6);
      k.castShadow = true; G.add(k);
    }
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
  {
    // Verjuengter Zylinder, unten weiter als oben. Als Kasten sah der
    // Schacht aus wie eine weisse Platte, erst die Rundung und die
    // Silhouettenkante lassen ihn als Volumen lesen.
    const cx = (LOCH.x0 + LOCH.x1) / 2, cz = (LOCH.z0 + LOCH.z1) / 2;
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

  // Das Licht selbst, von oben durch die Oeffnung
  const himmelslicht = new THREE.DirectionalLight(0xeaf4f6, 2.4);
  himmelslicht.position.set(2, 90, -4);
  himmelslicht.target.position.set(0, 0, -4);
  if (!istMobil) {
    himmelslicht.castShadow = true;
    himmelslicht.shadow.mapSize.set(2048, 2048);
    himmelslicht.shadow.camera.near = 20; himmelslicht.shadow.camera.far = 140;
    const R = 34;
    himmelslicht.shadow.camera.left = -R; himmelslicht.shadow.camera.right = R;
    himmelslicht.shadow.camera.top = R; himmelslicht.shadow.camera.bottom = -R;
    himmelslicht.shadow.bias = -0.0006;
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
    const mat = new THREE.PointsMaterial({
      map: glowTextur, color: 0xdcecf0, size: 3.4, sizeAttenuation: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    G.add(new THREE.Points(geo, mat));
  }

  // ---------------------------------------------------------
  // Die Schwebenden. Dunkle Silhouetten, die reglos nach oben
  // getragen werden. Das Herzstueck des Moodboards.
  // ---------------------------------------------------------
  const leute = [];
  const leibMat = new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 1 });
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Group();
    const leib = new THREE.Mesh(new THREE.CapsuleGeometry(0.30, 1.15, 3, 7), leibMat);
    leib.position.y = 1.0; p.add(leib);
    const kopf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), leibMat);
    kopf.position.y = 1.85; p.add(kopf);
    for (const s of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.75, 3, 5), leibMat);
      arm.position.set(s * 0.34, 0.92, 0); arm.rotation.z = s * 0.14; p.add(arm);
      const bein = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.85, 3, 5), leibMat);
      bein.position.set(s * 0.15, 0.05, 0); p.add(bein);
    }
    p.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const daten = {
      grp: p,
      x: -20 + Math.random() * 34, z: -24 + Math.random() * 30,
      y: 1 + Math.random() * 34,
      tempo: 0.5 + Math.random() * 0.8,
      pendel: Math.random() * 6.28, neigung: (Math.random() - 0.5) * 0.5,
    };
    leute.push(daten);
    G.add(p);
  }

  function neuLeute(d) {
    d.y = -3 - Math.random() * 4;
    d.x = -18 + Math.random() * 30;
    d.z = -22 + Math.random() * 26;
    d.tempo = 0.5 + Math.random() * 0.8;
  }

  function update(dt, t) {
    for (const d of leute) {
      d.y += d.tempo * dt;
      if (d.y > 46) neuLeute(d);
      d.grp.position.set(d.x + Math.sin(t * 0.3 + d.pendel) * 0.5, d.y,
                         d.z + Math.cos(t * 0.22 + d.pendel) * 0.4);
      // Reglos haengend, leicht kippend. Sie wehren sich nicht.
      d.grp.rotation.set(d.neigung + Math.sin(t * 0.4 + d.pendel) * 0.08,
                         t * 0.06 + d.pendel,
                         Math.sin(t * 0.33 + d.pendel) * 0.10);
    }
    fleckMat.opacity = 0.38 + 0.18 * Math.sin(t * 1.3);
    fleckLicht.intensity = 5 + 2 * Math.sin(t * 1.3);
  }

  return { gruppe: G, update, licht: himmelslicht };
}
