// ============================================================
// ARKANA 3D — Dritte Person, brutalistischer Surrealismus
// Stil laut design/artdirection.md: kalter Beton, dichter Nebel,
// eine kleine warme Figur, alles Wichtige leuchtet warmweiss.
// ============================================================
import * as THREE from 'three';
import { EffectComposer } from '../vendor/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from '../vendor/addons/loaders/GLTFLoader.js';
import { ATRIUM, baueAtrium, atriumBlockiert, atriumBoden } from './atrium.js';
import { klangStart, klangStumm, musik, raumton, klangSchritt, klangFragment,
         klangBeam, erzaehler } from './klang.js';

const T3 = 4;                     // eine Kachel = 4 Welt-Einheiten
const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------
// Daten laden
// ------------------------------------------------------------
const [WELT, STORY] = await Promise.all([
  fetch('./data/welt.json').then((r) => r.json()),
  fetch('./data/story.json').then((r) => r.json()),
]);
const MAP = WELT.arkana;
const SOLID = WELT.solid;

// ------------------------------------------------------------
// Signatur (wie im 2D-Spiel: Name, Zeichen, Alter -> Seed)
// ------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function nameZahl(name) {
  let s = 0;
  for (const ch of name.toUpperCase()) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) s += ((c - 65) % 9) + 1;
  }
  while (s > 9 && s !== 11 && s !== 22) {
    s = String(s).split('').reduce((a, b) => a + +b, 0);
  }
  return s || 9;
}
function saturnPhase(alter) {
  if (alter < 29.5) return { name: 'Der erste Ring', text: 'Du baust noch am Fundament.' };
  if (alter < 58) return { name: 'Der zweite Ring', text: 'Du weisst, was traegt. Jetzt zaehlt, was du damit tust.' };
  return { name: 'Der dritte Ring', text: 'Du gibst weiter, was du gesehen hast.' };
}
function makeSignatur(name, zi, alter) {
  const z = WELT.zodiac[zi];
  return {
    name, zeichen: z.name, sym: z.sym, element: z.element, planet: z.planet,
    zahl: nameZahl(name), saturn: saturnPhase(alter), alter,
    seed: hashStr(name.toLowerCase() + '|' + zi + '|' + alter),
  };
}

// ------------------------------------------------------------
// Spielstand
// ------------------------------------------------------------
let S = null;
function neuerStand(sig) {
  return { sig, px: 0, py: 0, neu: true,
    fragmente: [], gelesen: {}, stats: { geglaubt: 0, geprueft: 0 },
    ort: 'atrium' };            // erst das Atrium, dann Arkana
}
function speichern() { try { localStorage.setItem('arkana3d', JSON.stringify(S)); } catch (e) { /* egal */ } }
function laden() {
  try {
    const s = JSON.parse(localStorage.getItem('arkana3d'));
    if (s && s.sig && Number.isFinite(s.px)) {
      // Alte Spielstaende kennen das Atrium nicht, die starten in Arkana
      if (!s.ort) s.ort = 'arkana';
      return s;
    }
  } catch (e) { /* egal */ }
  return null;
}

// ------------------------------------------------------------
// Szene, Licht, Nebel
// ------------------------------------------------------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
const IST_MOBIL = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
renderer.shadowMap.enabled = !IST_MOBIL;          // Schatten kosten, Handys sparen
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

// Nebel traegt den Look. Farbe wandert mit dem Biom.
const fog = new THREE.FogExp2(0x2b3644, 0.0125);
scene.fog = fog;
// Statt einer flachen Hintergrundfarbe eine Kuppel mit Verlauf und
// einer fernen blendenden Quelle. Das gibt dem Dunst eine Richtung.
const HIMMEL_RICHTUNG = new THREE.Vector3(0.72, 0.16, 0.34).normalize();
const himmelMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    unten: { value: new THREE.Color(0x2b3644) },
    oben: { value: new THREE.Color(0x101725) },
    glanz: { value: new THREE.Color(0xffe9c8) },
    richtung: { value: HIMMEL_RICHTUNG },
  },
  vertexShader: `varying vec3 vP;
    void main(){ vP = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 unten, oben, glanz; uniform vec3 richtung; varying vec3 vP;
    void main(){
      float h = clamp(vP.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 c = mix(unten, oben, pow(h, 0.7));
      float d = max(dot(normalize(vP), normalize(richtung)), 0.0);
      c += glanz * (pow(d, 22.0) * 1.5 + pow(d, 4.0) * 0.16);
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const himmel = new THREE.Mesh(new THREE.SphereGeometry(320, 24, 16), himmelMat);
himmel.frustumCulled = false;
scene.add(himmel);

const hemi = new THREE.HemisphereLight(0xa8c0dc, 0x39404c, 2.6);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0x6a7890, 1.7));
const sonne = new THREE.DirectionalLight(0xffeeda, 2.1);
sonne.position.copy(HIMMEL_RICHTUNG).multiplyScalar(120);
if (!IST_MOBIL) {
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  sonne.shadow.camera.near = 10; sonne.shadow.camera.far = 260;
  const R = 70;
  sonne.shadow.camera.left = -R; sonne.shadow.camera.right = R;
  sonne.shadow.camera.top = R; sonne.shadow.camera.bottom = -R;
  sonne.shadow.bias = -0.0004;
  scene.add(sonne.target);
}
scene.add(sonne);
// Ein wanderndes warmes Licht bleibt beim Spieler, wie eine getragene Laterne
const tragelicht = new THREE.PointLight(0xffc98a, 16, 38, 1.8);
scene.add(tragelicht);

// Nachbearbeitung: Bloom laesst Portale, Fragmente und Laternen
// wirklich leuchten statt nur hell zu sein
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.55, 0.88);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', () => { resize(); skaliereGluehen(); }); resize();

// Weicher Leuchtfleck als Sprite-Textur
function glowTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,240,210,1)');
  g.addColorStop(0.35, 'rgba(255,210,140,0.45)');
  g.addColorStop(1, 'rgba(255,180,90,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}
const GLOW = glowTex();

// Jeder Sprite ist ein eigener Zeichenaufruf. Bei ueber 500 Lichtern
// bricht damit jedes Handy ein. Deshalb wandern alle Leuchtpunkte in
// eine einzige Punktwolke: ein Zeichenaufruf fuer die ganze Welt.
const GLUEHEN = [];      // { x, y, z, groesse, farbe }
let gluehWolke = null, gluehGroesse = null;
function gluehen(x, y, z, groesse, farbe, alpha) {
  GLUEHEN.push({ x, y, z, groesse: groesse * (alpha === undefined ? 1 : alpha), farbe });
  return GLUEHEN.length - 1;
}
function baueGluehWolke() {
  const n = GLUEHEN.length;
  if (!n) return;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  gluehGroesse = new Float32Array(n);
  const far = new Float32Array(n * 3);
  const c = new THREE.Color();
  GLUEHEN.forEach((p, i) => {
    pos[i*3] = p.x; pos[i*3+1] = p.y; pos[i*3+2] = p.z;
    gluehGroesse[i] = p.groesse;
    c.set(p.farbe);
    far[i*3] = c.r; far[i*3+1] = c.g; far[i*3+2] = c.b;
  });
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('groesse', new THREE.BufferAttribute(gluehGroesse, 1));
  g.setAttribute('farbe', new THREE.BufferAttribute(far, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { karte: { value: GLOW }, skala: { value: 500 } },
    vertexShader: `attribute float groesse; attribute vec3 farbe;
      uniform float skala; varying vec3 vF;
      void main(){ vF = farbe;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(0.0, groesse) * skala / max(1.0, -mv.z);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D karte; varying vec3 vF;
      void main(){ vec4 t = texture2D(karte, gl_PointCoord);
        if (t.a < 0.01) discard;
        gl_FragColor = vec4(vF, 1.0) * t; }`,
  });
  gluehWolke = new THREE.Points(g, mat);
  gluehWolke.frustumCulled = false;
  gluehWolke.renderOrder = 3;
  scene.add(gluehWolke);
  skaliereGluehen();
}
function skaliereGluehen() {
  if (!gluehWolke) return;
  gluehWolke.material.uniforms.skala.value =
    innerHeight / (2 * Math.tan(camera.fov * Math.PI / 360));
}
function loescheGluehen(i) {
  if (!gluehWolke || i < 0) return;
  gluehGroesse[i] = 0;
  gluehWolke.geometry.attributes.groesse.needsUpdate = true;
}

function glowSprite(scale, farbe) {
  const m = new THREE.SpriteMaterial({ map: GLOW, color: farbe || 0xffffff,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(m); s.scale.setScalar(scale);
  return s;
}

// ------------------------------------------------------------
// Higgsfield-Texturen (nach der Stilformel generiert)
// ------------------------------------------------------------
const texLader = new THREE.TextureLoader();
function ladeTex(url, wdh) {
  const t = texLader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (wdh) t.repeat.set(wdh[0], wdh[1]);
  return t;
}
const TEX_BODEN = ladeTex('./assets/tex_boden.jpg', [MAP.W / 2, MAP.H / 2]);
const TEX_WAND = ladeTex('./assets/tex_wand_kalt.jpg');

// Aus der Helligkeit der Textur eine Normalmap rechnen. Ohne die bleibt
// Beton eine flache Flaeche, egal wie gut die Farbtextur ist.
function normalAus(url, staerke, wdh, ziel) {
  const bild = new Image();
  bild.onload = () => {
    const N = 512;
    const cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d');
    c.drawImage(bild, 0, 0, N, N);
    const q = c.getImageData(0, 0, N, N).data;
    const hell = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) {
      hell[i] = (q[i*4] * 0.299 + q[i*4+1] * 0.587 + q[i*4+2] * 0.114) / 255;
    }
    const raus = c.createImageData(N, N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const l = hell[y * N + ((x - 1 + N) % N)], r = hell[y * N + ((x + 1) % N)];
        const o = hell[((y - 1 + N) % N) * N + x], u = hell[((y + 1) % N) * N + x];
        const dx = (l - r) * staerke, dy = (o - u) * staerke;
        const len = Math.hypot(dx, dy, 1);
        raus.data[i*4]   = ((dx / len) * 0.5 + 0.5) * 255;
        raus.data[i*4+1] = ((dy / len) * 0.5 + 0.5) * 255;
        raus.data[i*4+2] = ((1 / len) * 0.5 + 0.5) * 255;
        raus.data[i*4+3] = 255;
      }
    }
    c.putImageData(raus, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (wdh) t.repeat.set(wdh[0], wdh[1]);
    for (const m of ziel) { m.normalMap = t; m.needsUpdate = true; }
  };
  bild.src = url;
}
const MAT_BODEN = new THREE.MeshStandardMaterial({
  vertexColors: true, map: TEX_BODEN, roughness: 0.94, metalness: 0.02 });
const MAT_WAND = new THREE.MeshStandardMaterial({
  map: TEX_WAND, roughness: 0.9, metalness: 0.03 });
normalAus('./assets/tex_boden.jpg', 5, [MAP.W / 2, MAP.H / 2], [MAT_BODEN]);
normalAus('./assets/tex_wand_kalt.jpg', 4, null, [MAT_WAND]);

// ------------------------------------------------------------
// Biomfarben (aus dem 2D-Spiel, entsaettigt in den Nebel gelegt)
// ------------------------------------------------------------
const BIOME_KEYS = ['asche', 'bibliothek', 'hain', 'kristall', 'mond', 'sternen', 'sumpf', 'unterwelt', 'wueste'];
function entsaettigt(hex, satt, hell) {
  const c = new THREE.Color(hex);
  const h = { h: 0, s: 0, l: 0 }; c.getHSL(h);
  c.setHSL(h.h, h.s * satt, Math.min(1, h.l * hell));
  return c;
}
const BIO = {};
for (const k of BIOME_KEYS) {
  const b = WELT.biomes[k];
  BIO[k] = {
    boden: entsaettigt(b.bg, 0.42, 1.0),
    wand: entsaettigt(b.card, 0.35, 1.35),
    nebel: entsaettigt(b.bgDeep, 0.45, 1.5),
    akzent: new THREE.Color(b.main),
  };
}
const biomAt = (tx, ty) => {
  if (tx < 0 || ty < 0 || tx >= MAP.W || ty >= MAP.H) return 'asche';
  return BIOME_KEYS[+MAP.biome[ty][tx]] || 'asche';
};
const at = (tx, ty) => (MAP.tiles[ty] || '')[tx] || '#';
const extraFest = new Set();          // Kacheln, die Bauwerke wie Portale belegen
const fest = (tx, ty) => {
  if (tx < 0 || ty < 0 || tx >= MAP.W || ty >= MAP.H) return true;
  if (extraFest.has(tx + ',' + ty)) return true;
  return !!SOLID[at(tx, ty)];
};

// ------------------------------------------------------------
// Welt bauen
// ------------------------------------------------------------
const rngWelt = mulberry32(4711);
function hash2(x, y) { return (Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 * 0.5 + 0.5; }

// Boden als ein grosses Mesh mit Vertexfarben
function bauBoden() {
  const geo = new THREE.PlaneGeometry(MAP.W * T3, MAP.H * T3, MAP.W, MAP.H);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const farben = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const tx = Math.min(MAP.W - 1, Math.max(0, Math.floor(pos.getX(i) / T3 + MAP.W / 2)));
    const ty = Math.min(MAP.H - 1, Math.max(0, Math.floor(pos.getZ(i) / T3 + MAP.H / 2)));
    const ch = at(tx, ty);
    const b = BIO[biomAt(tx, ty)];
    tmp.copy(b.boden);
    if (ch === ':') tmp.lerp(new THREE.Color(0xcfc9b8), 0.45);          // Pfad, hell
    else if (ch === '~' || ch === 'w') tmp.set(0x11202e);               // Wasser
    else if (ch === 'v') tmp.set(0x02040a);                             // Abgrund
    else tmp.multiplyScalar(0.9 + hash2(tx, ty) * 0.2);                  // feine Koernung
    // Kontaktverschattung: je mehr Masse ringsum, desto dunkler der Boden.
    // Erst das setzt die Bauten auf den Grund statt sie darauf zu legen.
    let masse = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (!fest(tx + dx, ty + dy)) continue;
        masse += 1 / (1 + dx * dx + dy * dy);
      }
    }
    tmp.multiplyScalar(Math.max(0.32, 1 - masse * 0.16));
    farben[i * 3] = tmp.r; farben[i * 3 + 1] = tmp.g; farben[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(farben, 3));
  // Textur mal Vertexfarbe: die Betonplatten liegen unter allem,
  // die Biomfarbe toent sie ein
  const m = new THREE.Mesh(geo, MAT_BODEN);
  m.position.set(MAP.W * T3 / 2, 0, MAP.H * T3 / 2);
  m.receiveShadow = true;
  scene.add(m);
}

// Feste Kacheln nach Bauart einsammeln
const HOEHEN = new Float32Array(MAP.W * MAP.H);   // Sichthoehe je Kachel
function bauWelt() {
  const waende = [];      // Architektur: hohe Monolithe
  const baeume = [];      // Stamm + Krone
  const felsen = [];
  const kristalle = [];
  const kisten = [];
  const stelen = [];      // Obelisken, Grabsteine, Statuen, Schreine
  const lampen = [];

  for (let ty = 0; ty < MAP.H; ty++) {
    for (let tx = 0; tx < MAP.W; tx++) {
      const ch = at(tx, ty);
      if (!SOLID[ch]) continue;
      const e = { tx, ty, ch, h: hash2(tx, ty) };
      HOEHEN[ty * MAP.W + tx] = 3;                 // Objekte stoeren die Sicht kaum
      if ('#WR'.includes(ch)) waende.push(e);
      else if (ch === 'T') baeume.push(e);
      else if ('126PQ3'.includes(ch)) baeume.push(e);
      else if ('45'.includes(ch)) felsen.push(e);
      else if ('Kc'.includes(ch)) kristalle.push(e);
      else if ('789C8A0UJib'.includes(ch)) kisten.push(e);
      else if ('FHSNEoxM'.includes(ch)) stelen.push(e);
      else if ('Lf'.includes(ch)) lampen.push(e);
      else kisten.push(e);
    }
  }

  const px = (e) => (e.tx + 0.5) * T3, pz = (e) => (e.ty + 0.5) * T3;
  const dummy = new THREE.Object3D();

  // ------------------------------------------------------------
  // Architektur. Ein Wuerfel je Kachel ergibt eine Lego-Skyline.
  // Stattdessen bekommt jede Masse drei Schichten: den Hauptkoerper,
  // einen abgesetzten Aufsatz und vorkragende Baender an den Kanten.
  // Dazu leuchtende Oeffnungen, das Erkennungszeichen des Moodboards.
  // ------------------------------------------------------------
  {
    const frei = (tx, ty) => !fest(tx, ty);
    const kanten = (e) => [[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b]) => frei(e.tx+a, e.ty+b));

    // Hoehen zuerst bestimmen, damit Aufsaetze und Baender darauf aufbauen
    for (const e of waende) {
      const nachbarn = 4 - kanten(e).length;
      // Grosse Spreizung: manche Bloecke sind Tuerme, andere flach.
      const stufe = Math.floor(e.h * 4);
      const basis = [7, 13, 22, 34][stufe];
      e.hoehe = basis * (0.75 + hash2(e.tx * 3, e.ty * 5) * 0.5) + nachbarn * 1.5;
      HOEHEN[e.ty * MAP.W + e.tx] = e.hoehe;
    }

    const dummy2 = new THREE.Object3D();
    const farbe = new THREE.Color();
    const setzen = (inst, i, pos3, skal, drehY, ton) => {
      dummy2.position.set(pos3[0], pos3[1], pos3[2]);
      dummy2.scale.set(skal[0], skal[1], skal[2]);
      dummy2.rotation.set(0, drehY || 0, 0);
      dummy2.updateMatrix();
      inst.setMatrixAt(i, dummy2.matrix);
      if (ton) inst.setColorAt(i, ton);
    };

    // --- Hauptkoerper aus gestapelten Segmenten ---
    // Ein einzelner Wuerfel, in der Hoehe auf 30 Einheiten gezogen, streckt
    // die Textur um das Achtfache. Deshalb wird jeder Turm aus gleich hohen
    // Scheiben gestapelt. Der Massstab stimmt dann ueberall, und die Fugen
    // zwischen den Scheiben lesen sich wie Geschosse in Sichtbeton.
    const SEG = 4.5;
    let segGesamt = 0;
    for (const e of waende) {
      e.segAnz = Math.max(2, Math.round(e.hoehe / SEG));
      e.hoehe = e.segAnz * SEG;                       // auf volle Scheiben runden
      HOEHEN[e.ty * MAP.W + e.tx] = e.hoehe;
      segGesamt += e.segAnz;
    }
    const geoK = new THREE.BoxGeometry(T3, SEG, T3); geoK.translate(0, SEG / 2, 0);
    const koerper = new THREE.InstancedMesh(geoK, MAT_WAND, segGesamt);
    koerper.castShadow = koerper.receiveShadow = true;
    let si = 0;
    for (const e of waende) {
      const grund = BIO[biomAt(e.tx, e.ty)].wand;
      for (let k = 0; k < e.segAnz; k++) {
        // Jede Scheibe leicht anders getoent, das bricht die Flaeche auf
        const n = hash2(e.tx * 5 + k * 3, e.ty * 7 + k * 11);
        farbe.copy(grund).multiplyScalar(1.85 + e.h * 0.7 + n * 0.5);
        setzen(koerper, si++, [px(e), k * SEG, pz(e)], [1, 1, 1], 0, farbe);
      }
    }
    scene.add(koerper);

    // --- Aufsaetze: abgesetzter Kopf auf hohen Bloecken ---
    const mitKopf = waende.filter((e) => e.hoehe > 16);
    if (mitKopf.length) {
      const geoA = new THREE.BoxGeometry(T3, SEG, T3); geoA.translate(0, SEG / 2, 0);
      const aufs = new THREE.InstancedMesh(geoA, MAT_WAND, mitKopf.length);
      aufs.castShadow = aufs.receiveShadow = true;
      mitKopf.forEach((e, i) => {
        const n = hash2(e.tx * 7, e.ty * 11);
        const s2 = 0.55 + n * 0.3;
        const hh = 1 + Math.round(n * 1.6);          // in ganzen Scheiben
        const vx = (hash2(e.tx * 13, e.ty) - 0.5) * T3 * 0.3;
        const vz = (hash2(e.tx, e.ty * 13) - 0.5) * T3 * 0.3;
        farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(2.4 + n);
        setzen(aufs, i, [px(e) + vx, e.hoehe, pz(e) + vz], [s2, hh, s2], 0, farbe);
      });
      scene.add(aufs);
    }

    // --- Vorkragende Baender an den Aussenkanten ---
    const baender = [];
    for (const e of waende) {
      for (const [dx, dz] of kanten(e)) {
        const n = hash2(e.tx * 17 + dx * 3, e.ty * 19 + dz * 5);
        if (n < 0.55) continue;                       // nicht ueberall, sonst Brei
        baender.push({ e, dx, dz, n });
      }
    }
    if (baender.length) {
      const geoB = new THREE.BoxGeometry(1, 1, 1); geoB.translate(0, 0.5, 0);
      const bnd = new THREE.InstancedMesh(geoB, MAT_WAND, baender.length);
      bnd.castShadow = bnd.receiveShadow = true;
      baender.forEach((b, i) => {
        const { e, dx, dz, n } = b;
        const y = 3 + n * (e.hoehe - 5);
        const tief = 1.0 + n * 1.6;                   // wie weit es vorspringt
        const dick = 0.8 + n * 1.4;
        const laenge = T3 * (0.7 + n * 0.3);
        const bx = px(e) + dx * (T3 / 2 + tief / 2 - 0.2);
        const bz = pz(e) + dz * (T3 / 2 + tief / 2 - 0.2);
        const skal = dx !== 0 ? [tief, dick, laenge] : [laenge, dick, tief];
        farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(2.9 + n * 0.8);
        setzen(bnd, i, [bx, y, bz], skal, 0, farbe);
      });
      scene.add(bnd);
    }

    // --- Leuchtende Oeffnungen: das Erkennungszeichen des Moodboards ---
    const oeffnungen = [];
    for (const e of waende) {
      for (const [dx, dz] of kanten(e)) {
        const n = hash2(e.tx * 29 + dx, e.ty * 31 + dz);
        if (n < 0.9 || e.hoehe < 12) continue;        // selten, das macht sie stark
        oeffnungen.push({ e, dx, dz, n });
      }
    }
    if (oeffnungen.length) {
      const geoO = new THREE.PlaneGeometry(1, 1);
      const matO = new THREE.MeshBasicMaterial({
        color: 0xfff4e2, side: THREE.DoubleSide, fog: true,
        transparent: true, opacity: 0.95, depthWrite: false });
      const oef = new THREE.InstancedMesh(geoO, matO, oeffnungen.length);
      oeffnungen.forEach((o, i) => {
        const { e, dx, dz, n } = o;
        const y = 5 + n * (e.hoehe - 9);
        const b = 1.1 + n * 1.4, hh = 3 + n * 6;
        dummy2.position.set(px(e) + dx * (T3 / 2 + 0.06), y + hh / 2, pz(e) + dz * (T3 / 2 + 0.06));
        dummy2.scale.set(b, hh, 1);
        dummy2.rotation.set(0, dx !== 0 ? Math.PI / 2 : 0, 0);
        dummy2.updateMatrix();
        oef.setMatrixAt(i, dummy2.matrix);
        // Ein weicher Schein davor, damit es im Nebel glueht
        gluehen(px(e) + dx * (T3 / 2 + 0.5), y + hh / 2, pz(e) + dz * (T3 / 2 + 0.5),
          1.5 + n * 1.4, 0xffe9c8, 0.5);
      });
      scene.add(oef);
    }
  }

  // Baeume: dunkle Silhouetten im Nebel
  {
    const stammGeo = new THREE.CylinderGeometry(0.22, 0.34, 1, 5);
    stammGeo.translate(0, 0.5, 0);
    const kroneGeo = new THREE.IcosahedronGeometry(1, 0);
    const stamm = new THREE.InstancedMesh(stammGeo, new THREE.MeshLambertMaterial({ color: 0x241c14 }), baeume.length);
    const krone = new THREE.InstancedMesh(kroneGeo, new THREE.MeshLambertMaterial({}), baeume.length);
    stamm.castShadow = true; krone.castShadow = true;
    const farbe = new THREE.Color();
    baeume.forEach((e, i) => {
      const tot = e.ch === '3';
      const h = 4.5 + e.h * 4;
      dummy.position.set(px(e), 0, pz(e)); dummy.scale.set(1, h, 1); dummy.rotation.set(0,0,0);
      dummy.updateMatrix(); stamm.setMatrixAt(i, dummy.matrix);
      dummy.position.set(px(e), tot ? -30 : h * 0.95, pz(e));
      const r = e.ch === 'P' ? 2.6 : 1.8 + e.h * 1.4;
      dummy.scale.set(r, r * (e.ch === '1' ? 1.5 : 0.9), r);
      dummy.rotation.set(0, e.h * 6.28, 0);
      dummy.updateMatrix(); krone.setMatrixAt(i, dummy.matrix);
      const b = BIO[biomAt(e.tx, e.ty)];
      farbe.copy(e.ch === 'P' ? b.akzent : b.boden).multiplyScalar(e.ch === 'P' ? 0.8 : 0.35);
      krone.setColorAt(i, farbe);
    });
    scene.add(stamm, krone);
  }

  // Felsen
  {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const inst = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({}), felsen.length);
    const farbe = new THREE.Color();
    felsen.forEach((e, i) => {
      const r = e.ch === '4' ? 1.4 + e.h : 0.7 + e.h * 0.5;
      dummy.position.set(px(e), r * 0.55, pz(e));
      dummy.scale.set(r, r * 0.75, r);
      dummy.rotation.set(e.h * 2, e.h * 7, 0);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(1.5 + e.h * 0.5);
      inst.setColorAt(i, farbe);
    });
    scene.add(inst);
  }

  // Kristalle: das kalte Leuchten der Kaverne
  {
    const geo = new THREE.OctahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8f84e8, emissive: 0x9d92ff, emissiveIntensity: 0.9, roughness: 0.3 });
    const inst = new THREE.InstancedMesh(geo, mat, kristalle.length);
    kristalle.forEach((e, i) => {
      const h = 1.6 + e.h * 2.4;
      dummy.position.set(px(e), h * 0.6, pz(e));
      dummy.scale.set(0.8, h, 0.8);
      dummy.rotation.set(0, e.h * 6.28, (e.h - 0.5) * 0.4);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    });
    scene.add(inst);
    for (const e of kristalle) {
      if (e.h > 0.72) gluehen(px(e), 2.6, pz(e), 2.2, 0xb0a6ff, 0.6);
    }
  }

  // Kisten, Faesser, Karren, Wracks: niedrige Kuben
  {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const inst = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({}), kisten.length);
    const farbe = new THREE.Color();
    kisten.forEach((e, i) => {
      const regal = e.ch === 'b' || e.ch === 'J';
      const w = regal ? 3.4 : 1.6 + e.h * 1.4;
      const h = regal ? 2.5 : 1.4 + e.h * 1.6;
      dummy.position.set(px(e), 0, pz(e));
      dummy.scale.set(w, h, w);
      dummy.rotation.set(0, e.h * 1.5, 0);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(1.8);
      inst.setColorAt(i, farbe);
    });
    scene.add(inst);
  }

  // Stelen: schmale hohe Steine, leicht geneigt
  {
    const geo = new THREE.BoxGeometry(1, 1, 0.6);
    geo.translate(0, 0.5, 0);
    const inst = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({}), stelen.length);
    const farbe = new THREE.Color();
    stelen.forEach((e, i) => {
      const h = e.ch === 'F' ? 7 + e.h * 4 : e.ch === 'o' ? 5.5 : 2.6 + e.h * 2;
      dummy.position.set(px(e), 0, pz(e));
      dummy.scale.set(1.1, h, 1);
      dummy.rotation.set((e.h - 0.5) * 0.08, e.h * 6.28, (e.h - 0.5) * 0.08);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(2.2);
      inst.setColorAt(i, farbe);
    });
    scene.add(inst);
  }

  // Laternen: warme Punkte im Grau
  {
    const geo = new THREE.CylinderGeometry(0.09, 0.12, 3.4, 5);
    geo.translate(0, 1.7, 0);
    const inst = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0x2a2620 }), lampen.length);
    lampen.forEach((e, i) => {
      dummy.position.set(px(e), 0, pz(e)); dummy.scale.set(1, 1, 1); dummy.rotation.set(0,0,0);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      gluehen(px(e), 3.5, pz(e), 1.5, 0xffc878, 0.55);
    });
    scene.add(inst);
  }
}

// ------------------------------------------------------------
// Lichtschacht: ein sichtbarer Strahl im Dunst. Der Kegel leuchtet
// an seiner Silhouette, dadurch liest er sich als Volumen und nicht
// als Pappe. Genau das traegt die Bilder im Moodboard.
// ------------------------------------------------------------
function schachtMaterial(farbe, staerke) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, fog: false,
    uniforms: { farbe: { value: new THREE.Color(farbe) }, staerke: { value: staerke } },
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
        float oben = smoothstep(0.0, 0.28, vH);
        float unten = 1.0 - smoothstep(0.62, 1.0, vH);
        gl_FragColor = vec4(farbe, staerke * rim * rim * oben * unten);
      }`,
  });
}
function lichtschacht(x, z, hoehe, radius, farbe, staerke) {
  const g = new THREE.CylinderGeometry(radius * 0.3, radius, hoehe, 14, 1, true);
  g.translate(0, hoehe / 2, 0);
  const m = new THREE.Mesh(g, schachtMaterial(farbe, staerke));
  m.position.set(x, 0, z);
  m.renderOrder = 2;
  scene.add(m);
  return m;
}

// ------------------------------------------------------------
// Schwebende Betonplatten. Direkt aus dem Moodboard: Masse, die
// nicht faellt. Sie treiben langsam und drehen sich kaum merklich.
// ------------------------------------------------------------
let platten = null;
const plattenDaten = [];
function bauPlatten() {
  const rng = mulberry32(90210);
  const versuche = 700, ziel = 110;
  while (plattenDaten.length < ziel && plattenDaten.length < versuche) {
    const tx = 3 + Math.floor(rng() * (MAP.W - 6));
    const ty = 3 + Math.floor(rng() * (MAP.H - 6));
    if (fest(tx, ty)) continue;                       // nur ueber offenen Flaechen
    plattenDaten.push({
      x: (tx + 0.5) * T3, z: (ty + 0.5) * T3,
      y: 16 + rng() * 34,
      b: 3 + rng() * 12, d: 0.8 + rng() * 2.4, t: 3 + rng() * 10,
      dreh: rng() * 6.28, tempo: (rng() - 0.5) * 0.06,
      wippe: rng() * 6.28, hub: 0.6 + rng() * 1.8,
      ton: 1.4 + rng() * 1.4,
    });
  }
  const geo = new THREE.BoxGeometry(1, 1, 1);
  platten = new THREE.InstancedMesh(geo, MAT_WAND, plattenDaten.length);
  platten.castShadow = true;
  platten.frustumCulled = false;
  const farbe = new THREE.Color();
  plattenDaten.forEach((p, i) => {
    farbe.copy(BIO[biomAt(Math.floor(p.x / T3), Math.floor(p.z / T3))].wand).multiplyScalar(p.ton);
    platten.setColorAt(i, farbe);
  });
  scene.add(platten);
}
function bewegePlatten(t) {
  if (!platten) return;
  const d = new THREE.Object3D();
  plattenDaten.forEach((p, i) => {
    d.position.set(p.x, p.y + Math.sin(t * 0.25 + p.wippe) * p.hub, p.z);
    d.rotation.set(Math.sin(t * 0.1 + p.wippe) * 0.04, p.dreh + t * p.tempo, 0);
    d.scale.set(p.b, p.d, p.t);
    d.updateMatrix();
    platten.setMatrixAt(i, d.matrix);
  });
  platten.instanceMatrix.needsUpdate = true;
}

// Wahrzeichen: das Monolith-Portal aus dem Moodboard, eines je Region.
// Nicht blind auf die Regionsmitte: die liegt oft mitten im Gebaeude
// oder direkt auf dem Start. Wir suchen den naechsten freien Platz.
const portale = [];
function portalPlatz(r) {
  const sx = MAP.start[0] / 40, sz = MAP.start[1] / 40;
  for (let rad = 0; rad < 10; rad++) {
    for (let a = 0; a < Math.max(1, rad * 8); a++) {
      const w = a / Math.max(1, rad * 8) * Math.PI * 2;
      const tx = Math.round(r.x + Math.cos(w) * rad);
      const ty = Math.round(r.y + Math.sin(w) * rad);
      if (Math.hypot(tx - sx, ty - sz) < 5) continue;         // nie auf den Start
      let ok = true;
      for (let dy = -1; dy <= 1 && ok; dy++)
        for (let dx = -1; dx <= 1 && ok; dx++)
          if (fest(tx + dx, ty + dy)) ok = false;
      if (ok) return [tx, ty];
    }
  }
  return null;
}
function bauPortale() {
  for (const r of MAP.regions) {
    const platz = portalPlatz(r);
    if (!platz) continue;
    const x = (platz[0] + 0.5) * T3, z = (platz[1] + 0.5) * T3;
    // Die Kamera muss den Monolithen kennen
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const ix = platz[0] + dx, iy = platz[1] + dy;
        if (ix >= 0 && iy >= 0 && ix < MAP.W && iy < MAP.H)
          HOEHEN[iy * MAP.W + ix] = Math.max(HOEHEN[iy * MAP.W + ix], 30);
      }
    const grp = new THREE.Group();
    const b = BIO[biomAt(r.x, r.y)];
    const stein = new THREE.Mesh(
      new THREE.BoxGeometry(9, 44, 2.6),
      new THREE.MeshLambertMaterial({ map: TEX_WAND, color: b.wand.clone().multiplyScalar(2.6) }));
    stein.position.y = 22;
    stein.castShadow = true;
    const tuer = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 15),
      new THREE.MeshBasicMaterial({ color: 0xfff2dc }));
    tuer.position.set(0, 8.6, 1.25);
    grp.add(stein, tuer);
    gluehen(x, 9, z + 2.2, 7, 0xffe8c0, 0.6);
    grp.position.set(x, 0, z);
    scene.add(grp);
    portale.push({ x, z, name: r.name });
    // Der Strahl macht das Portal schon von weitem sichtbar
    lichtschacht(x, z, 70, 11, 0xffe6bc, 0.19);
    for (let dx = -1; dx <= 1; dx++) extraFest.add((platz[0] + dx) + ',' + platz[1]);
  }
}

// ------------------------------------------------------------
// Interaktive Dinge: Fragmente, Inschriften, Figuren, Schreine
// ------------------------------------------------------------
const dinge = [];         // { art, x, z, mesh, idx, aktiv }
let fragInst = null;      // alle Wissensscherben in einem Zeichenaufruf
function bauDinge() {
  // Fragmente: schwebende warmweisse Scherben
  const fragGeo = new THREE.TetrahedronGeometry(0.6, 0);
  const fragMat = new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffdca0, emissiveIntensity: 1.4, roughness: 0.2 });
  // Alle Scherben in einem InstancedMesh. 95 Einzelmeshes waeren
  // 95 Zeichenaufrufe fuer ein paar Dreiecke.
  fragInst = new THREE.InstancedMesh(fragGeo, fragMat, MAP.frag.length);
  fragInst.frustumCulled = false;
  scene.add(fragInst);
  MAP.frag.forEach(([tx, ty], i) => {
    const x = (tx + 0.5) * T3, z = (ty + 0.5) * T3;
    const gi = gluehen(x, 1.6, z, 1.8, 0xffe0b0, 0.7);
    dinge.push({ art: 'frag', x, z, mesh: null, inst: i, gluehIdx: gi, idx: i, aktiv: true });
  });
  // Inschriften: flache Tafeln
  const inGeo = new THREE.BoxGeometry(1.8, 2.4, 0.4);
  inGeo.translate(0, 1.2, 0);
  MAP.insch.forEach(([tx, ty], i) => {
    const m = new THREE.Mesh(inGeo, new THREE.MeshLambertMaterial({ color: 0x3d4450 }));
    m.position.set((tx + 0.5) * T3, 0, (ty + 0.5) * T3);
    m.rotation.y = hash2(tx, ty) * 6.28;
    scene.add(m);
    dinge.push({ art: 'insch', x: m.position.x, z: m.position.z, mesh: m, idx: i, aktiv: true });
  });
  // Figuren: graue Gestalten des Index und der Sucher
  MAP.npc.forEach(([tx, ty], i) => {
    const grp = new THREE.Group();
    const leib = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.5, 3, 8),
      new THREE.MeshLambertMaterial({ color: 0x565e6a }));
    leib.position.y = 1.35;
    const kopf = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x6a7482 }));
    kopf.position.y = 2.65;
    grp.add(leib, kopf);
    grp.position.set((tx + 0.5) * T3, 0, (ty + 0.5) * T3);
    scene.add(grp);
    dinge.push({ art: 'npc', x: grp.position.x, z: grp.position.z, mesh: grp, idx: i, aktiv: true });
  });
  // Schreine: kleine Monolithe mit Puls
  MAP.shrine.forEach(([tx, ty], i) => {
    const grp = new THREE.Group();
    const st = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x4a5260 }));
    st.position.y = 2.5;
    const auge = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.4),
      new THREE.MeshBasicMaterial({ color: 0xfff2dc }));
    auge.position.set(0, 2.4, 0.65);
    grp.add(st, auge);
    gluehen((tx + 0.5) * T3, 2.6, (ty + 0.5) * T3 + 1, 3, 0xffe8c0, 0.6);
    grp.position.set((tx + 0.5) * T3, 0, (ty + 0.5) * T3);
    scene.add(grp);
    dinge.push({ art: 'schrein', x: grp.position.x, z: grp.position.z, mesh: grp, idx: i, aktiv: true });
  });
}

// ------------------------------------------------------------
// Die Figur. Bevorzugt das gerigte Higgsfield-Modell mit echter
// Laufanimation. Nur wenn das fehlt oder nicht laedt, springt die
// prozedurale Klotzfigur ein, damit das Spiel nie schwarz bleibt.
// ------------------------------------------------------------
let mixer = null, laufClip = null, ruheClip = null, modellGeladen = false;

function ladeHeldModell(fallback) {
  const loader = new GLTFLoader();
  loader.load('./assets/held_v2.glb', (gltf) => {
    const wurzel = gltf.scene;
    wurzel.updateWorldMatrix(true, true);

    // Hoehe messen. Bei gerigten Modellen liefert Box3 oft Unsinn, weil die
    // Geometrie in Bindepose in einem winzigen lokalen Raum liegt. Verlaesslich
    // ist die Spannweite der Knochen in Weltkoordinaten.
    let minY = Infinity, maxY = -Infinity, knochen = 0;
    wurzel.traverse((o) => {
      if (!o.isBone) return;
      knochen++;
      const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    let hoehe = maxY - minY;
    let bodenY = minY;
    if (!Number.isFinite(hoehe) || hoehe <= 0.01) {
      // Kein Skelett gefunden: auf die Geometrie zurueckfallen
      const box = new THREE.Box3().setFromObject(wurzel);
      hoehe = box.max.y - box.min.y;
      bodenY = box.min.y;
    }
    // Knochen enden am Hals, der Kopf sitzt darueber. Aufschlag von 12 Prozent.
    if (knochen > 0) hoehe *= 1.12;
    if (!Number.isFinite(hoehe) || hoehe <= 0.01) { hoehe = 1.78; bodenY = 0; }
    const s2 = 2.15 / hoehe;
    wurzel.scale.setScalar(s2);
    wurzel.position.y = -bodenY * s2;
    document.body.dataset.modell = JSON.stringify({
      knochen, hoehe: +hoehe.toFixed(3), skalierung: +s2.toFixed(3),
      bodenY: +bodenY.toFixed(3), clips: gltf.animations.map((a) => a.name),
    });
    wurzel.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        m.side = THREE.DoubleSide;          // duenne Stoffteile von hinten
        m.transparent = false; m.depthWrite = true;
        m.envMapIntensity = 0.6;
      }
    });
    const halter = new THREE.Group();
    halter.add(wurzel);
    scene.add(halter);
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(wurzel);
      laufClip = mixer.clipAction(gltf.animations[0]);
      laufClip.play(); laufClip.weight = 0;
      // Ruhepose separat nachladen, damit die Figur im Stehen nicht
      // in einem halben Schritt einfriert
      new GLTFLoader().load('./assets/held_ruhe_v6.glb', (g2) => {
        if (!g2.animations || !g2.animations.length) return;
        ruheClip = mixer.clipAction(g2.animations[0]);
        ruheClip.play(); ruheClip.weight = 1;
      }, undefined, () => { /* ohne Ruheclip laeuft es auch */ });
    }
    // Klotzfigur verschwindet, das echte Modell uebernimmt
    scene.remove(fallback.grp);
    spieler.grp = halter;
    spieler.teile = null;
    modellGeladen = true;
  }, undefined, () => {
    // Kein Modell da: die Klotzfigur bleibt einfach stehen
    modellGeladen = false;
  });
}

function bauSpieler() {
  const grp = new THREE.Group();
  const stoff = new THREE.MeshLambertMaterial({ color: 0xc4652a });
  const stoffHell = new THREE.MeshLambertMaterial({ color: 0xe8813f });
  const haut = new THREE.MeshLambertMaterial({ color: 0xd8a878 });
  const hose = new THREE.MeshLambertMaterial({ color: 0x3a4048 });

  const teile = {};
  const mk = (name, geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); grp.add(m); teile[name] = m; return m;
  };
  mk('beinL', new THREE.BoxGeometry(0.24, 0.8, 0.28), hose, -0.16, 0.4, 0);
  mk('beinR', new THREE.BoxGeometry(0.24, 0.8, 0.28), hose, 0.16, 0.4, 0);
  teile.beinL.geometry.translate(0, -0.4, 0); teile.beinL.position.y = 0.8;
  teile.beinR.geometry.translate(0, -0.4, 0); teile.beinR.position.y = 0.8;
  mk('leib', new THREE.BoxGeometry(0.62, 0.72, 0.4), stoff, 0, 1.16, 0);
  mk('brust', new THREE.BoxGeometry(0.5, 0.3, 0.42), stoffHell, 0, 1.34, 0.01);
  mk('armL', new THREE.BoxGeometry(0.16, 0.62, 0.2), stoff, -0.4, 1.5, 0);
  mk('armR', new THREE.BoxGeometry(0.16, 0.62, 0.2), stoff, 0.4, 1.5, 0);
  teile.armL.geometry.translate(0, -0.31, 0); teile.armR.geometry.translate(0, -0.31, 0);
  mk('kopf', new THREE.BoxGeometry(0.36, 0.36, 0.34), haut, 0, 1.74, 0);
  // Kapuze
  mk('kapuze', new THREE.ConeGeometry(0.34, 0.5, 6), stoffHell, 0, 1.98, -0.04);
  teile.kapuze.rotation.x = -0.25;
  scene.add(grp);
  return { grp, teile };
}

// ------------------------------------------------------------
// Steuerung
// ------------------------------------------------------------
const eingabe = { x: 0, y: 0, ok: false };
const tasten = {};
// Physische Codes zuerst, key-Namen als Rueckfall: manche Umgebungen
// liefern kein e.code
const KEYMAP = { w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD',
  W: 'KeyW', A: 'KeyA', S: 'KeyS', D: 'KeyD',
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
  Enter: 'Enter', ' ': 'Space', e: 'KeyE', E: 'KeyE', Shift: 'ShiftLeft' };
const keyVon = (e) => e.code || KEYMAP[e.key] || '';
addEventListener('keydown', (e) => {
  const k = keyVon(e);
  if (!k) return;
  tasten[k] = true;
  if (k === 'Enter' || k === 'KeyE') { eingabe.ok = true; e.preventDefault(); }
  if (k === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => { const k = keyVon(e); if (k) tasten[k] = false; });

// Maus wie in Minecraft: Klick ins Spiel sperrt den Zeiger,
// Bewegung dreht die Kamera, Escape gibt ihn frei
const maus = { yaw: 0, pitch: 0.16, aktiv: false };
canvas.addEventListener('click', () => {
  if (!IST_MOBIL && S && !dialog && !fragOffen && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});
document.addEventListener('pointerlockchange', () => {
  maus.aktiv = document.pointerLockElement === canvas;
  const h = $('mausHinweis');
  if (h && maus.aktiv) h.remove();
});
addEventListener('mousemove', (e) => {
  if (!maus.aktiv) return;
  maus.yaw -= e.movementX * 0.0028;
  maus.pitch = Math.min(1.35, Math.max(-0.62, maus.pitch + e.movementY * 0.0022));
});
// Am Handy: zweiter Finger auf der rechten Haelfte dreht die Kamera
let drehId = null, drehX = 0, drehY = 0;
addEventListener('touchstart', (e) => {
  for (const t of e.changedTouches) {
    if (t.clientX > innerWidth * 0.55 && drehId === null
        && !(t.target.closest && t.target.closest('button, .overlay, #dlg, #frag'))) {
      drehId = t.identifier; drehX = t.clientX; drehY = t.clientY;
    }
  }
}, { passive: true });
addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier !== drehId) continue;
    maus.yaw -= (t.clientX - drehX) * 0.006;
    maus.pitch = Math.min(1.35, Math.max(-0.62, maus.pitch + (t.clientY - drehY) * 0.005));
    drehX = t.clientX; drehY = t.clientY;
  }
}, { passive: true });
addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) if (t.identifier === drehId) drehId = null;
}, { passive: true });

const stickEl = $('stick'), knobEl = $('knob');
const stick = { id: null, cx: 0, cy: 0 };
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
addEventListener('touchstart', (e) => {
  for (const t of e.changedTouches) {
    if (t.clientX > innerWidth * 0.55 || stick.id !== null) continue;
    if (t.target.closest && t.target.closest('button, .overlay, #dlg, #frag')) continue;
    stick.id = t.identifier; stick.cx = t.clientX; stick.cy = t.clientY;
    stickEl.style.display = 'block';
    stickEl.style.left = (stick.cx - 62) + 'px';
    stickEl.style.top = (stick.cy - 62) + 'px';
    knobEl.style.transform = 'translate(0,0)';
  }
}, { passive: true });
addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier !== stick.id) continue;
    let dx = t.clientX - stick.cx, dy = t.clientY - stick.cy;
    const l = Math.hypot(dx, dy), max = 48;
    if (l > max) { dx = dx / l * max; dy = dy / l * max; }
    eingabe.x = dx / max; eingabe.y = dy / max;
    knobEl.style.transform = `translate(${dx}px,${dy}px)`;
  }
}, { passive: true });
addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier !== stick.id) continue;
    stick.id = null; eingabe.x = 0; eingabe.y = 0;
    stickEl.style.display = 'none';
  }
}, { passive: true });
$('ok').addEventListener('click', () => { eingabe.ok = true; });

function richtung() {
  let x = eingabe.x, y = eingabe.y;
  if (tasten.KeyA || tasten.ArrowLeft) x -= 1;
  if (tasten.KeyD || tasten.ArrowRight) x += 1;
  if (tasten.KeyW || tasten.ArrowUp) y -= 1;
  if (tasten.KeyS || tasten.ArrowDown) y += 1;
  // Pfeile sollen nie die Seite scrollen
  const l = Math.hypot(x, y);
  return l > 1 ? { x: x / l, y: y / l } : { x, y };
}

// ------------------------------------------------------------
// Kollision: Kreis gegen das Kachelraster, mit Eckenhilfe
// ------------------------------------------------------------
const RADIUS = 0.32;             // Spielerkreis in Kacheln

// Wie viel von seiner Kachel ein Objekt wirklich verstellt, als Radius
// um die Kachelmitte in Kacheleinheiten. Was hier nicht steht, blockiert
// die ganze Kachel (Mauern, Fels, Fenster). Ohne diese Tabelle sperrte
// jede Laterne 4 mal 4 Meter, das waren die unsichtbaren Waende.
const KOLL_RADIUS = {
  L: 0.14, f: 0.14,               // Laterne, Fackel: ein Pfosten
  '1': 0.22, '2': 0.24, '6': 0.30, 'P': 0.30, '3': 0.14, 'T': 0.26,  // Baeume: der Stamm
  '4': 0.40, 'H': 0.26, 'F': 0.32, 'S': 0.36, x: 0.30, o: 0.24, M: 0.34,
  '7': 0.28, '8': 0.36, C: 0.38, A: 0.42, '0': 0.38, U: 0.40, J: 0.42,
  K: 0.38, c: 0.38, Q: 0.30,
};

function punktBlockiert(x, z) {
  const tx = Math.floor(x), tz = Math.floor(z);
  if (tx < 0 || tz < 0 || tx >= MAP.W || tz >= MAP.H) return true;
  if (extraFest.has(tx + ',' + tz)) return true;
  const ch = at(tx, tz);
  if (!SOLID[ch]) return false;
  const r = KOLL_RADIUS[ch];
  if (r === undefined) return true;               // volle Kachel
  return Math.hypot(x - (tx + 0.5), z - (tz + 0.5)) < r;
}

function stehtFrei(tx, tz) {
  if (ort === 'atrium') {
    // Im Atrium in Weltmassen pruefen, das Kachelraster gilt dort nicht
    const R = 0.30 * T3;
    const wx = tx * T3, wz = tz * T3;
    for (const [ox, oz] of [[0,0],[R,0],[-R,0],[0,R],[0,-R],[R*0.7,R*0.7],[-R*0.7,R*0.7],[R*0.7,-R*0.7],[-R*0.7,-R*0.7]]) {
      if (atriumBlockiert(wx + ox, wz + oz)) return false;
    }
    return true;
  }
  // Acht Punkte auf dem Spielerkreis plus die Mitte, damit auch ein
  // duenner Pfosten nicht zwischen zwei Messpunkten durchrutscht
  for (const [ox, oz] of [[0,0],[RADIUS,0],[-RADIUS,0],[0,RADIUS],[0,-RADIUS],[RADIUS*0.7,RADIUS*0.7],[-RADIUS*0.7,RADIUS*0.7],[RADIUS*0.7,-RADIUS*0.7],[-RADIUS*0.7,-RADIUS*0.7]]) {
    if (punktBlockiert(tx + ox, tz + oz)) return false;
  }
  return true;
}
function bewege(p, dx, dz) {
  const nx = p.x + dx, nz = p.z + dz;
  if (stehtFrei(nx, p.z)) p.x = nx;
  else {
    for (let k = 0.05; k <= 0.4; k += 0.05) {
      if (stehtFrei(nx, p.z + k)) { p.x = nx; p.z += Math.min(k, 0.1); break; }
      if (stehtFrei(nx, p.z - k)) { p.x = nx; p.z -= Math.min(k, 0.1); break; }
    }
  }
  if (stehtFrei(p.x, nz)) p.z = nz;
  else {
    for (let k = 0.05; k <= 0.4; k += 0.05) {
      if (stehtFrei(p.x + k, nz)) { p.z = nz; p.x += Math.min(k, 0.1); break; }
      if (stehtFrei(p.x - k, nz)) { p.z = nz; p.x -= Math.min(k, 0.1); break; }
    }
  }
}

// ------------------------------------------------------------
// Dialog und Karten (HTML-Overlays), mit Stimme
// ------------------------------------------------------------
let sprichAn = false;
const sprichEl = $('sprich');
sprichEl.addEventListener('click', () => {
  sprichAn = !sprichAn;
  sprichEl.textContent = sprichAn ? '🔊 TON AN' : '🔊 TON AUS';
  sprichEl.classList.toggle('an', sprichAn);
  klangStumm(!sprichAn);
  if (!sprichAn) speechSynthesis.cancel();
  else if (ort === 'atrium') raumton(true);
});
function sprich(text) {
  if (!sprichAn || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[▸·]/g, ''));
  u.lang = 'de-DE'; u.rate = 0.95; u.pitch = 0.9;
  speechSynthesis.speak(u);
}

let dialog = null;                // { zeilen, i, wer }
const dlgEl = $('dlg');
// Dialogbox selbst tippt sich weiter, auf jedem Geraet
dlgEl.addEventListener('click', () => { eingabe.ok = true; });
dlgEl.addEventListener('touchend', (e) => { eingabe.ok = true; e.preventDefault(); });
function zeigeDialog(wer, zeilen) {
  dialog = { zeilen, i: 0, wer };
  dlgEl.classList.remove('hidden');
  dlgEl.querySelector('.wer').textContent = wer || '';
  dlgEl.querySelector('.text').textContent = zeilen[0];
  sprich(zeilen[0]);
}
function dialogWeiter() {
  if (!dialog) return;
  dialog.i++;
  if (dialog.i >= dialog.zeilen.length) {
    dialog = null; dlgEl.classList.add('hidden'); speechSynthesis.cancel(); return;
  }
  dlgEl.querySelector('.text').textContent = dialog.zeilen[dialog.i];
  sprich(dialog.zeilen[dialog.i]);
}

// Figurendialog wie im 2D-Spiel: Region -> Figur -> Stufe nach Fortschritt
function npcZeilen(idx) {
  const reg = MAP.npcRegions[idx] || 'Aschenstadt';
  const kand = (STORY.figurOrte && STORY.figurOrte[reg]) || ['wache'];
  const fig = STORY.figuren[kand[idx % kand.length]];
  if (!fig) return { wer: '', zeilen: ['...'] };
  const n = S.fragmente.length;
  let stufe = fig.stufen[0];
  for (const st of fig.stufen) if (n >= st.ab) stufe = st;
  const zeilen = [...stufe.zeilen];
  if (fig.haltung && S.stats.geglaubt + S.stats.geprueft >= 4) {
    const h = S.stats.geprueft > S.stats.geglaubt * 1.3 ? 'zweifel'
      : S.stats.geglaubt > S.stats.geprueft * 1.3 ? 'glaube' : 'gleichgewicht';
    if (fig.haltung[h]) zeilen.push(fig.haltung[h]);
  }
  return { wer: fig.name + ' · ' + fig.rolle, zeilen };
}

function inschrift(idx) {
  const reg = MAP.inschRegions[idx] || 'Aschenstadt';
  const st = STORY.storyByName[reg];
  if (st && st.inschriften && st.inschriften.length) {
    const it = st.inschriften[idx % st.inschriften.length];
    return { wer: it.titel, zeilen: [it.text] };
  }
  return { wer: 'Verwitterter Stein', zeilen: ['Die Zeichen sind nicht mehr zu lesen.'] };
}

// Fragmentkarte mit persoenlicher Deutung und Wahl
const fragEl = $('frag');
let fragOffen = null;
function fragmentFuer(idx) {
  const rf = mulberry32(S.sig.seed + idx * 7919);
  return STORY.fragments[Math.floor(rf() * STORY.fragments.length)];
}
function deutungFuer(f) {
  const d = STORY.deutung && STORY.deutung[f.modul];
  if (!d) return null;
  const achse = ['element', 'zahl', 'phase'][hashStr(f.id) % 3];
  let kern = '';
  if (achse === 'element') kern = d.element[S.sig.element];
  else if (achse === 'zahl') kern = d.zahl[S.sig.zahl];
  else kern = d.phase[S.sig.saturn.name];
  if (!kern) kern = d.element[S.sig.element] || '';
  return { intro: (d.intro || '').replace(/\{name\}/g, S.sig.name), kern };
}
function zeigeFragment(ding) {
  const f = fragmentFuer(ding.idx);
  const deu = deutungFuer(f);
  fragOffen = ding;
  fragEl.classList.remove('hidden');
  fragEl.innerHTML = `<div class="karte">
    <div class="modul">FRAGMENT · ${(f.modul || '').replace(/_/g, ' ').replace(/^\d+\s*/, '')}</div>
    <div class="titel">${f.titel || 'Ein Wissensfragment'}</div>
    <div>${f.text || ''}</div>
    ${deu ? `<div class="modul" style="margin-top:16px">FÜR DICH, ${S.sig.name.toUpperCase()}</div><div>${deu.kern}</div>` : ''}
    <div class="wahl">
      <div id="w-glaube">ICH GLAUBE ES</div>
      <div id="w-pruefe">ICH PRÜFE ES</div>
    </div>
  </div>`;
  sprich((f.titel || '') + '. ' + (f.text || ''));
  const schliesse = (was) => {
    klangFragment();
    S.stats[was]++;
    S.fragmente.push(ding.idx);
    ding.aktiv = false;
    if (ding.mesh) scene.remove(ding.mesh);
    if (ding.inst !== undefined) {
      const d0 = new THREE.Object3D(); d0.scale.setScalar(0); d0.updateMatrix();
      fragInst.setMatrixAt(ding.inst, d0.matrix);
      fragInst.instanceMatrix.needsUpdate = true;
      loescheGluehen(ding.gluehIdx);
    }
    fragEl.classList.add('hidden');
    fragOffen = null;
    speechSynthesis.cancel();
    $('zaehler').textContent = '✦ ' + S.fragmente.length;
    speichern();
  };
  fragEl.querySelector('#w-glaube').addEventListener('click', () => schliesse('geglaubt'));
  fragEl.querySelector('#w-pruefe').addEventListener('click', () => schliesse('geprueft'));
}

function zeigeSchrein() {
  const gb = STORY.gesamtbild;
  const n = S.fragmente.length, tot = STORY.fragments.length;
  const stufe = n >= tot * 0.5 ? 'viel' : n >= tot * 0.2 ? 'mittel' : 'wenig';
  const zeilen = [
    `${S.sig.name}. ${S.sig.sym} ${S.sig.zeichen} · ${S.sig.element} · Namenszahl ${S.sig.zahl} · ${S.sig.saturn.name}.`,
    gb.eroeffnung[stufe] || gb.eroeffnung.wenig,
    gb.element[S.sig.element],
  ];
  if (S.stats.geglaubt + S.stats.geprueft > 0) {
    zeilen.push(S.stats.geprueft > S.stats.geglaubt
      ? 'Du prüfst mehr, als du glaubst. Das schützt dich vor Täuschung. Pass auf, dass es dich nicht vor Wundern schützt.'
      : 'Du glaubst mehr, als du prüfst. Das öffnet dir Türen. Pass auf, wer sie gebaut hat.');
  }
  zeigeDialog('DER SPIEGEL', zeilen.filter(Boolean));
}

// ------------------------------------------------------------
// Der Beam. Wer den Lichtfleck in der Mitte betritt, wird langsam
// nach oben getragen, so wie die anderen im Raum. Am Ende der Fahrt
// steht man in Arkana.
// ------------------------------------------------------------
const blende = document.createElement('div');
blende.style.cssText = 'position:fixed;inset:0;z-index:29;background:#fff;'
  + 'opacity:0;pointer-events:none;transition:none';
document.body.appendChild(blende);

function starteBeam() {
  if (beam) return;
  beam = { t: 0, phase: 'hoch' };
  sprich('');
  klangBeam();
  zeigeDialog('', ['Der Boden lässt dich los.']);
}

function pruefeBeam(dt, wx, wz) {
  if (!beam) {
    const d = Math.hypot(wx - ATRIUM.mitte.x, wz - ATRIUM.mitte.z);
    if (d < ATRIUM.mitteRadius) starteBeam();
    return;
  }
  beam.t += dt;
  // Erst langsam anheben, dann schneller. 9 Sekunden bis zur Blende.
  const p = Math.min(1, beam.t / 9);
  beamHoehe = Math.pow(p, 2.2) * 42;
  // Kamera weicht zurueck und kippt nach oben mit
  maus.pitch = Math.max(-0.5, 0.20 - p * 0.7);
  bloom.strength = 0.42 + p * 1.5;
  renderer.toneMappingExposure = 1.28 + p * 1.1;
  blende.style.opacity = String(Math.max(0, (beam.t - 7.6) / 1.6));
  if (beam.t > 9.4 && beam.phase === 'hoch') {
    beam.phase = 'ankunft';
    // Umschalten nach Arkana, waehrend das Bild weiss ist
    setzeOrt('arkana');
    beamHoehe = 0; bodenY = 0;
    const sp = findeSpawn();
    pos.x = sp[0]; pos.z = sp[1];
    camYaw = blick = zielBlick = maus.yaw = 0;
    maus.pitch = 0.16;
    cam.x = pos.x * T3; cam.z = pos.z * T3 + 6; cam.y = 3.3;
    speichern();
  }
  if (beam.phase === 'ankunft') {
    blende.style.opacity = String(Math.max(0, 1 - (beam.t - 9.6) / 2.2));
    bloom.strength = Math.max(0.42, 1.92 - (beam.t - 9.6));
    renderer.toneMappingExposure = Math.max(1.28, 2.38 - (beam.t - 9.6) * 0.6);
    if (beam.t > 12) {
      beam = null;
      blende.style.opacity = '0';
      bloom.strength = 0.42;
      renderer.toneMappingExposure = 1.28;
      zeigeDialog('', [
        'Du stehst in Arkana.',
        `${S.sig.name}. ${S.sig.element}. Die ${S.sig.zahl}. ${S.sig.saturn.name}.`,
        'Sammle die Fragmente des verbrannten Archivs. Jedes sagt etwas über die Welt. Und etwas über dich.',
      ]);
    }
  }
}

// ------------------------------------------------------------
// Start und Hauptschleife
// ------------------------------------------------------------
// Alles, was die Weltbauer jetzt hinzufuegen, gehoert zu Arkana und
// wird anschliessend in eine Gruppe gehoben. So laesst sich die ganze
// Welt mit einem Schalter ausblenden, waehrend das Atrium laeuft.
const vorWelt = scene.children.length;
bauBoden(); bauWelt(); bauPortale(); bauDinge(); bauPlatten(); baueGluehWolke();
const ARKANA_GRUPPE = new THREE.Group();
ARKANA_GRUPPE.name = 'arkana';
for (const kind of scene.children.slice(vorWelt)) ARKANA_GRUPPE.add(kind);
scene.add(ARKANA_GRUPPE);

const atrium = baueAtrium(MAT_WAND, MAT_BODEN, GLOW, IST_MOBIL);
scene.add(atrium.gruppe);

let ort = 'atrium';             // wo der Spieler gerade ist
function setzeOrt(neu) {
  ort = neu;
  const imAtrium = neu === 'atrium';
  atrium.gruppe.visible = imAtrium;
  ARKANA_GRUPPE.visible = !imAtrium;
  // Die Sonne von Arkana wuerde im Atrium durch die Decke scheinen
  sonne.visible = !imAtrium;
  tragelicht.intensity = imAtrium ? 3 : 16;
  hemi.intensity = imAtrium ? 1.5 : 2.6;
  fog.density = imAtrium ? 0.021 : 0.0125;
  if (S) S.ort = neu;
}
const spieler = bauSpieler();
ladeHeldModell(spieler);
$('lade').remove();

// Titel und Signatur
const zEl = $('zodiac');
WELT.zodiac.forEach((z, i) => {
  const d = document.createElement('div');
  d.textContent = z.sym + ' ' + z.name;
  d.addEventListener('click', () => {
    zEl.querySelectorAll('div').forEach((e) => e.classList.remove('on'));
    d.classList.add('on'); zEl.dataset.wahl = i;
  });
  zEl.appendChild(d);
});
$('start').addEventListener('click', () => {
  klangStart();                  // Browser erlauben Ton erst nach einer Eingabe
  $('titel').classList.add('hidden');
  const alt = laden();
  if (alt) { S = alt; spielStart(); }
  else $('sig').classList.remove('hidden');
});
$('los').addEventListener('click', () => {
  const name = $('name').value.trim();
  const zi = +(zEl.dataset.wahl ?? -1);
  const alter = +$('alter').value;
  if (!name || zi < 0 || !alter) return;
  S = neuerStand(makeSignatur(name, zi, alter));
  speichern();
  $('sig').classList.add('hidden');
  spielStart();
  // Der Ankunftstext kommt erst nach dem Beam. Hier steht man noch
  // auf der Schwelle, und dort spricht der Erzaehler.
  if (ort !== 'atrium') {
    zeigeDialog('', [
      'Der Bildschirm hat dich genommen. Du stehst in Arkana.',
      `${S.sig.name}. ${S.sig.element}. Die ${S.sig.zahl}. ${S.sig.saturn.name}.`,
    ]);
  }
});

// In 3D startet man im Freien. Der 2D-Start liegt in einem engen
// Innenraum, das funktioniert mit einer Verfolgerkamera nicht.
function findeSpawn() {
  const sx = MAP.start[0] / 40, sz = MAP.start[1] / 40;
  let best = null, bd = 1e9;
  for (let ty = 2; ty < MAP.H - 2; ty++) {
    for (let tx = 2; tx < MAP.W - 2; tx++) {
      if (at(tx, ty) !== ':') continue;
      let offen = true;
      for (let dy = -1; dy <= 1 && offen; dy++)
        for (let dx = -1; dx <= 1 && offen; dx++)
          if (fest(tx + dx, ty + dy)) offen = false;
      if (!offen) continue;
      const d = Math.hypot(tx - sx, ty - sz);
      if (d < bd) { bd = d; best = [tx + 0.5, ty + 0.5]; }
    }
  }
  return best || [sx, sz];
}

const pos = { x: 0, z: 0 };
let blick = 0;
let zielBlick = 0;               // letzte Laufrichtung, Drehziel
let camYaw = 0;
let laufzeit = 0;
let sprungY = 0, sprungV = 0;    // Sprunghoehe und -geschwindigkeit
let bodenY = 0;                  // Hoehe des Untergrunds, im Atrium mit Treppen
let beamHoehe = 0;               // wie weit die Figur schon hochgezogen ist
let beam = null;                 // laufende Beam-Sequenz
let letzterSchritt = -1;         // fuer den Schrittklang
const cam = { x: 0, y: 8, z: 10 };
let naechstes = null;

// Sichthoehe an einer Weltposition
function sichtHoehe(wx, wz) {
  if (ort === 'atrium') {
    // Im Atrium verdecken nur Waende und Staemme, und die sind hoch
    return atriumBlockiert(wx, wz) ? 40 : atriumBoden(wx, wz);
  }
  const tx = Math.floor(wx / T3), tz = Math.floor(wz / T3);
  if (tx < 0 || tz < 0 || tx >= MAP.W || tz >= MAP.H) return 999;
  return HOEHEN[tz * MAP.W + tx] || 0;
}

function spielStart() {
  setzeOrt(S.ort || 'atrium');
  if (ort === 'atrium') {
    // Auf der Kanzel unter dem Torrahmen, Blick in den Raum hinein
    pos.x = ATRIUM.start.x / T3; pos.z = ATRIUM.start.z / T3;
    camYaw = blick = zielBlick = maus.yaw = ATRIUM.startBlick;
    maus.pitch = 0.46;
    cam.x = pos.x * T3 - Math.sin(camYaw) * 5;
    cam.z = pos.z * T3 - Math.cos(camYaw) * 5;
    cam.y = atriumBoden(ATRIUM.start.x, ATRIUM.start.z) + 2.5;
    delete S.neu;
    $('hud').classList.remove('hidden');
    sprichEl.classList.remove('hidden');
    $('zaehler').textContent = '\u2726 ' + S.fragmente.length;
    musik('musik_atrium');
    raumton(true);
    // Die drei Saetze mit Luft dazwischen, waehrend man sich umsieht
    erzaehler(['erz1', 'erz2', 'erz3'], [2.5, 9.5, 8.5]);
    return;
  }
  pos.x = S.px; pos.z = S.py;
  if (S.neu || !stehtFrei(pos.x, pos.z)) {
    const sp = findeSpawn();
    pos.x = sp[0]; pos.z = sp[1];
    delete S.neu;
  }
  // Die Kamera sucht sich beim Start die freieste Blickrichtung
  let bester = 0, bestFrei = -1;
  for (let a = 0; a < 16; a++) {
    const yaw = a / 16 * Math.PI * 2;
    let f = 1;
    for (let d = 2; d <= 9; d += 1) {
      if (sichtHoehe(pos.x * T3 - Math.sin(yaw) * d, pos.z * T3 - Math.cos(yaw) * d) > 3.5) { f = d / 9; break; }
    }
    if (f > bestFrei) { bestFrei = f; bester = yaw; }
  }
  camYaw = blick = zielBlick = bester;
  maus.yaw = bester;
  cam.x = pos.x * T3 - Math.sin(camYaw) * 9;
  cam.z = pos.z * T3 - Math.cos(camYaw) * 9;
  cam.y = 3.3;
  $('hud').classList.remove('hidden');
  sprichEl.classList.remove('hidden');
  $('zaehler').textContent = '✦ ' + S.fragmente.length;
  cam.x = pos.x * T3; cam.z = pos.z * T3 + 10;
  musik('musik_arkana');
  raumton(false);
}

let letztes = performance.now();
let speicherTimer = 0;
const fogZiel = new THREE.Color(0x232c38);

function tick(now) {
  requestAnimationFrame(tick);
  try { tickInner(now); } catch (e) {
    document.body.dataset.err = String(e && e.stack || e).slice(0, 400);
  }
}
function tickInner(now) {
  const dt = Math.min(0.05, (now - letztes) / 1000);
  letztes = now;
  const t = now / 1000;

  if (S) {
    // ---- Bewegung, relativ zur Kamera wie in Minecraft ----
    // W laeuft dahin, wo die Kamera hinschaut. Der Rechts-Vektor ist das
    // Kreuzprodukt aus Oben und Blickrichtung, NICHT die um 90 Grad
    // gedrehte Blickrichtung. Vertauscht man das, sind A und D getauscht.
    const roh = (dialog || fragOffen || beam) ? { x: 0, y: 0 } : richtung();
    const vor = { x: Math.sin(maus.yaw), z: Math.cos(maus.yaw) };
    const rechts = { x: -vor.z, z: vor.x };
    const d = { x: vor.x * -roh.y + rechts.x * roh.x,
                y: vor.z * -roh.y + rechts.z * roh.x };
    // Gehen ist Standard, Shift rennt. Vorher waren 3.9 Kacheln pro
    // Sekunde fest verdrahtet, das sind 13 Meter pro Sekunde. Sprinttempo
    // als Dauerzustand.
    const rennt = tasten.ShiftLeft || tasten.ShiftRight;
    const tempo = rennt ? 3.2 : 1.9;
    const geht = Math.hypot(d.x, d.y) > 0.05;
    if (geht) {
      bewege(pos, d.x * tempo * dt, d.y * tempo * dt);
      laufzeit += dt * (1 + Math.hypot(d.x, d.y));
      zielBlick = Math.atan2(d.x, d.y);
    }
    // Der Koerper dreht mit fester Geschwindigkeit auf die letzte
    // Laufrichtung zu und fuehrt die Drehung auch nach dem Loslassen zu
    // Ende. Dann friert die Pose ein: wer nach rechts lief, steht nach
    // rechts. Die Kamera dreht ihn nie.
    {
      const diff = ((zielBlick - blick + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const schritt = 11 * dt;                      // Bogenmass pro Sekunde
      blick += Math.abs(diff) <= schritt ? diff : Math.sign(diff) * schritt;
    }
    // Sprung: Leertaste, einfache Schwerkraft
    if (tasten.Space && sprungY <= 0.001 && !dialog && !fragOffen) sprungV = 7.2;
    sprungV -= 20 * dt;
    sprungY = Math.max(0, sprungY + sprungV * dt);
    if (sprungY <= 0) sprungV = Math.max(0, sprungV);
    S.px = pos.x; S.py = pos.z;
    speicherTimer += dt;
    if (speicherTimer > 4) { speicherTimer = 0; speichern(); }

    // ---- Figur ----
    const wx = pos.x * T3, wz = pos.z * T3;
    // Im Atrium gibt es Treppen, der Boden liegt nicht ueberall auf null
    const zielBoden = ort === 'atrium' ? atriumBoden(wx, wz) : 0;
    bodenY += (zielBoden - bodenY) * Math.min(1, dt * 12);
    spieler.grp.position.set(wx, bodenY, wz);
    // Das Modell schaut in seinem eigenen Raum nach +Z, genau wie die
    // Ersatzfigur. rotation.y = blick richtet es also entlang der
    // Blickrichtung der Kamera aus, weg vom Betrachter. Ein Aufschlag
    // von 180 Grad drehte es frueher zum Spieler hin.
    spieler.grp.rotation.y = blick;
    const ph = laufzeit * 7;
    // Zwei Schritte pro Zyklus. Der Zaehler laeuft mit der Laufzeit,
    // also passt der Klang automatisch zu Gehen und Rennen.
    if (geht && !beam) {
      const schrittPhase = Math.floor(laufzeit * 2.6);
      if (schrittPhase !== letzterSchritt) { letzterSchritt = schrittPhase; klangSchritt(); }
    }
    const amp = geht ? 0.55 : 0;
    if (spieler.teile) {
      spieler.teile.beinL.rotation.x = Math.sin(ph) * amp;
      spieler.teile.beinR.rotation.x = Math.sin(ph + Math.PI) * amp;
      spieler.teile.armL.rotation.x = Math.sin(ph + Math.PI) * amp * 0.8;
      spieler.teile.armR.rotation.x = Math.sin(ph) * amp * 0.8;
    }
    if (mixer) {
      // Weich zwischen Ruhe und Gehen ueberblenden
      const ziel = geht ? 1 : 0;
      if (laufClip) {
        // Cliptempo folgt dem Bodentempo, sonst rutschen die Fuesse
        laufClip.timeScale = 0.55 * tempo;
        laufClip.weight += (ziel - laufClip.weight) * Math.min(1, dt * 8);
        if (!ruheClip) laufClip.paused = !geht && laufClip.weight < 0.02;
      }
      if (ruheClip) ruheClip.weight += ((1 - ziel) - ruheClip.weight) * Math.min(1, dt * 8);
      mixer.update(dt);
    }
    spieler.grp.position.y = bodenY + sprungY * 2.2 + beamHoehe
      + (modellGeladen ? 0 : (geht ? Math.abs(Math.sin(ph)) * 0.1 : Math.sin(t * 1.8) * 0.03));
    tragelicht.position.set(wx + Math.sin(blick) * 1.5, 4.2, wz + Math.cos(blick) * 1.5);
    sonne.position.set(wx + 60, 90, wz + 30);
    if (sonne.target) { sonne.target.position.set(wx, 0, wz); sonne.target.updateMatrixWorld(); }

    // ---- Kamera: Kugel-Orbit um den Kopf ----
    // Gier und Neigung kommen beide von der Maus. Neigung nach unten
    // hebt die Kamera und schaut herab, Neigung nach oben senkt sie fast
    // auf den Boden und schaut die Tuerme hinauf.
    camYaw = maus.yaw;
    const abst = 4.6;
    const kopf = bodenY + 1.8 + sprungY * T3 / 2 + beamHoehe;
    const cp = Math.cos(maus.pitch), sp = Math.sin(maus.pitch);
    let zx = wx - Math.sin(camYaw) * cp * abst;
    let zz = wz - Math.cos(camYaw) * cp * abst;
    let zy = kopf + sp * abst;
    // Sichtpruefung entlang der echten Sichtlinie Kopf -> Kamera
    let frei = 1;
    for (let f = 0.15; f <= 1; f += 0.05) {
      const sx = wx + (zx - wx) * f, sz = wz + (zz - wz) * f;
      const sy = kopf + (zy - kopf) * f;
      if (sy > 0.2 && sichtHoehe(sx, sz) > sy) { frei = Math.max(0.24, f - 0.06); break; }
    }
    zx = wx + (zx - wx) * frei;
    zz = wz + (zz - wz) * frei;
    zy = Math.max(0.35, kopf + (zy - kopf) * frei);
    cam.x += (zx - cam.x) * Math.min(1, dt * 5.5);
    cam.z += (zz - cam.z) * Math.min(1, dt * 5.5);
    cam.y = (cam.y || zy) + (zy - (cam.y || zy)) * Math.min(1, dt * 5.5);
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(wx, kopf, wz);

    // ---- Nebel folgt dem Biom ----
    const bio = BIO[biomAt(Math.floor(pos.x), Math.floor(pos.z))];
    fogZiel.copy(bio.nebel);
    fog.color.lerp(fogZiel, Math.min(1, dt * 1.5));
    // Die Kuppel wandert mit, sonst laeuft man aus ihr heraus
    himmel.position.copy(camera.position);
    himmelMat.uniforms.unten.value.lerp(fogZiel, Math.min(1, dt * 1.5));
    himmelMat.uniforms.oben.value.lerp(
      fogZiel.clone().multiplyScalar(0.32), Math.min(1, dt * 1.5));

    if (location.search.includes('debug')) {
      window.__mess = { spieler, camera, THREE, pos, maus, mixer, laufClip, ruheClip };
    }
    // ---- Debug (nur Entwicklung) ----
    if (location.search.includes('debug')) {
      $('region').textContent = pos.x.toFixed(1) + ',' + pos.z.toFixed(1)
        + ' yaw ' + camYaw.toFixed(2) + ' frei ' + frei.toFixed(2)
        + ' y ' + cam.y.toFixed(1)
        + ' T ' + Object.keys(tasten).filter(k => tasten[k]).join('+');
    }
    // ---- Region im HUD ----
    if (ort === 'atrium') {
      if (!location.search.includes('debug')) $('region').textContent = 'DIE SCHWELLE';
    } else {
    let best = null, bd = 1e9;
    for (const r of MAP.regions) {
      const dd = Math.hypot(pos.x - r.x, (pos.z - r.y) * 0.8);
      if (dd < bd) { bd = dd; best = r; }
    }
    if (best && !location.search.includes('debug')) $('region').textContent = best.name.toUpperCase();
    }

    // ---- Naechstes Interaktives ----
    naechstes = null; let nd = 2.2 * T3;
    for (const g of dinge) {
      if (!g.aktiv) continue;
      const dd = Math.hypot(g.x - wx, g.z - wz);
      if (dd < nd) { nd = dd; naechstes = g; }
    }
    $('ok').classList.toggle('puls', !!naechstes && !dialog && !fragOffen);

    // ---- OK gedrueckt ----
    if (eingabe.ok) {
      eingabe.ok = false;
      if (fragOffen) { /* Wahl erfolgt per Knopf auf der Karte */ }
      else if (dialog) dialogWeiter();
      else if (naechstes) {
        if (naechstes.art === 'frag') zeigeFragment(naechstes);
        else if (naechstes.art === 'insch') { const s = inschrift(naechstes.idx); zeigeDialog(s.wer, s.zeilen); }
        else if (naechstes.art === 'npc') { const s = npcZeilen(naechstes.idx); zeigeDialog(s.wer, s.zeilen); }
        else if (naechstes.art === 'schrein') zeigeSchrein();
      }
    }

    if (ort === 'atrium') { atrium.update(dt, t); pruefeBeam(dt, wx, wz); }
    else bewegePlatten(t);

    // ---- Fragmente drehen ----
    if (fragInst) {
      const d0 = new THREE.Object3D();
      for (const g of dinge) {
        if (g.art !== 'frag' || !g.aktiv) continue;
        d0.position.set(g.x, 1.6 + Math.sin(t * 2 + g.idx) * 0.25, g.z);
        d0.rotation.set(0, t * 1.2 + g.idx, 0.3);
        d0.scale.setScalar(1);
        d0.updateMatrix();
        fragInst.setMatrixAt(g.inst, d0.matrix);
      }
      fragInst.instanceMatrix.needsUpdate = true;
    }
  } else {
    eingabe.ok = false;
    // Titelkamera: langsame Fahrt ueber die Welt
    const a = t * 0.05;
    camera.position.set(MAP.W * T3 / 2 + Math.cos(a) * 60, 30, MAP.H * T3 / 2 + Math.sin(a) * 60);
    camera.lookAt(MAP.W * T3 / 2, 6, MAP.H * T3 / 2);
    himmel.position.copy(camera.position);
    bewegePlatten(t);
  }

  composer.render();
}
requestAnimationFrame(tick);
