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
    fragmente: [], gelesen: {}, stats: { geglaubt: 0, geprueft: 0 } };
}
function speichern() { try { localStorage.setItem('arkana3d', JSON.stringify(S)); } catch (e) { /* egal */ } }
function laden() {
  try {
    const s = JSON.parse(localStorage.getItem('arkana3d'));
    if (s && s.sig && Number.isFinite(s.px)) return s;
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
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

// Nebel traegt den Look. Farbe wandert mit dem Biom.
const fog = new THREE.FogExp2(0x232c38, 0.016);
scene.fog = fog;
scene.background = new THREE.Color(0x232c38);

const hemi = new THREE.HemisphereLight(0x9fb8d8, 0x2b3440, 2.1);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0x55637a, 1.35));
const sonne = new THREE.DirectionalLight(0xdce8ff, 1.8);
sonne.position.set(60, 90, 30);
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
const tragelicht = new THREE.PointLight(0xffb864, 11, 30, 1.9);
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
addEventListener('resize', resize); resize();

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
    farben[i * 3] = tmp.r; farben[i * 3 + 1] = tmp.g; farben[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(farben, 3));
  // Textur mal Vertexfarbe: die Betonplatten liegen unter allem,
  // die Biomfarbe toent sie ein
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: TEX_BODEN });
  const m = new THREE.Mesh(geo, mat);
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

  // Architektur: jede Wandkachel ein Monolith, Hoehe variiert stark.
  // Das ergibt die Skyline aus dem Moodboard.
  {
    const geo = new THREE.BoxGeometry(T3, 1, T3);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ map: TEX_WAND });
    const inst = new THREE.InstancedMesh(geo, mat, waende.length);
    inst.castShadow = true; inst.receiveShadow = true;
    const farbe = new THREE.Color();
    waende.forEach((e, i) => {
      // Innen hoeher als am Rand einer Wandflaeche, wie gewachsene Bauten
      const nachbarn = [[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b]) => fest(e.tx+a, e.ty+b)).length;
      const h = 6 + e.h * 10 + nachbarn * 2.5;
      HOEHEN[e.ty * MAP.W + e.tx] = h;
      dummy.position.set(px(e), 0, pz(e));
      dummy.scale.set(1, h, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      farbe.copy(BIO[biomAt(e.tx, e.ty)].wand).multiplyScalar(2.2 + e.h * 0.8);
      inst.setColorAt(i, farbe);
    });
    scene.add(inst);
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
      if (e.h > 0.72) { const g = glowSprite(7, 0xb0a6ff); g.position.set(px(e), 2.6, pz(e)); scene.add(g); }
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
      const g = glowSprite(5, 0xffc878); g.position.set(px(e), 3.5, pz(e)); scene.add(g);
    });
    scene.add(inst);
  }
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
      new THREE.BoxGeometry(9, 30, 2.4),
      new THREE.MeshLambertMaterial({ map: TEX_WAND, color: b.wand.clone().multiplyScalar(2.6) }));
    stein.position.y = 15;
    stein.castShadow = true;
    const tuer = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 15),
      new THREE.MeshBasicMaterial({ color: 0xfff2dc }));
    tuer.position.set(0, 8.6, 1.25);
    const g = glowSprite(26, 0xffe8c0); g.position.set(0, 9, 2.2);
    grp.add(stein, tuer, g);
    grp.position.set(x, 0, z);
    scene.add(grp);
    portale.push({ x, z, name: r.name });
    for (let dx = -1; dx <= 1; dx++) extraFest.add((platz[0] + dx) + ',' + platz[1]);
  }
}

// ------------------------------------------------------------
// Interaktive Dinge: Fragmente, Inschriften, Figuren, Schreine
// ------------------------------------------------------------
const dinge = [];         // { art, x, z, mesh, idx, aktiv }
function bauDinge() {
  // Fragmente: schwebende warmweisse Scherben
  const fragGeo = new THREE.TetrahedronGeometry(0.6, 0);
  const fragMat = new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffdca0, emissiveIntensity: 1.4, roughness: 0.2 });
  MAP.frag.forEach(([tx, ty], i) => {
    const m = new THREE.Mesh(fragGeo, fragMat);
    m.position.set((tx + 0.5) * T3, 1.6, (ty + 0.5) * T3);
    const g = glowSprite(4.5, 0xffe0b0); m.add(g);
    scene.add(m);
    dinge.push({ art: 'frag', x: m.position.x, z: m.position.z, mesh: m, idx: i, aktiv: true });
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
    const g = glowSprite(9, 0xffe8c0); g.position.set(0, 2.6, 1);
    grp.add(st, auge, g);
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
  loader.load('./assets/held.glb', (gltf) => {
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
      new GLTFLoader().load('./assets/held_ruhe.glb', (g2) => {
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
  Enter: 'Enter', ' ': 'Space', e: 'KeyE', E: 'KeyE' };
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
const maus = { yaw: 0, pitch: 0.32, aktiv: false };
canvas.addEventListener('click', () => {
  if (!IST_MOBIL && S && !dialog && !fragOffen && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});
document.addEventListener('pointerlockchange', () => {
  maus.aktiv = document.pointerLockElement === canvas;
});
addEventListener('mousemove', (e) => {
  if (!maus.aktiv) return;
  maus.yaw -= e.movementX * 0.0028;
  maus.pitch = Math.min(1.25, Math.max(-0.15, maus.pitch + e.movementY * 0.0022));
});
// Am Handy: zweiter Finger auf der rechten Haelfte dreht die Kamera
let drehId = null, drehX = 0;
addEventListener('touchstart', (e) => {
  for (const t of e.changedTouches) {
    if (t.clientX > innerWidth * 0.55 && drehId === null
        && !(t.target.closest && t.target.closest('button, .overlay, #dlg, #frag'))) {
      drehId = t.identifier; drehX = t.clientX;
    }
  }
}, { passive: true });
addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier !== drehId) continue;
    maus.yaw -= (t.clientX - drehX) * 0.006;
    drehX = t.clientX;
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
const RADIUS = 0.32;             // in Kacheln
function stehtFrei(tx, tz) {
  for (const [ox, oz] of [[RADIUS,0],[-RADIUS,0],[0,RADIUS],[0,-RADIUS],[RADIUS*0.7,RADIUS*0.7],[-RADIUS*0.7,RADIUS*0.7],[RADIUS*0.7,-RADIUS*0.7],[-RADIUS*0.7,-RADIUS*0.7]]) {
    if (fest(Math.floor(tx + ox), Math.floor(tz + oz))) return false;
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
  sprichEl.textContent = sprichAn ? '🔊 STIMME AN' : '🔊 STIMME AUS';
  sprichEl.classList.toggle('an', sprichAn);
  if (!sprichAn) speechSynthesis.cancel();
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
    S.stats[was]++;
    S.fragmente.push(ding.idx);
    ding.aktiv = false;
    scene.remove(ding.mesh);
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
// Start und Hauptschleife
// ------------------------------------------------------------
bauBoden(); bauWelt(); bauPortale(); bauDinge();
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
  zeigeDialog('', [
    'Der Bildschirm hat dich genommen. Du stehst in Arkana.',
    `${S.sig.name}. ${S.sig.element}. Die ${S.sig.zahl}. ${S.sig.saturn.name}.`,
    'Sammle die Fragmente des verbrannten Archivs. Jedes sagt etwas über die Welt. Und etwas über dich.',
  ]);
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
let camYaw = 0;
let laufzeit = 0;
let sprungY = 0, sprungV = 0;    // Sprunghoehe und -geschwindigkeit
const cam = { x: 0, y: 8, z: 10 };
let naechstes = null;

// Sichthoehe an einer Weltposition
function sichtHoehe(wx, wz) {
  const tx = Math.floor(wx / T3), tz = Math.floor(wz / T3);
  if (tx < 0 || tz < 0 || tx >= MAP.W || tz >= MAP.H) return 999;
  return HOEHEN[tz * MAP.W + tx] || 0;
}

function spielStart() {
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
  camYaw = blick = bester;
  maus.yaw = bester;
  cam.x = pos.x * T3 - Math.sin(camYaw) * 9;
  cam.z = pos.z * T3 - Math.cos(camYaw) * 9;
  cam.y = 4.8;
  $('hud').classList.remove('hidden');
  sprichEl.classList.remove('hidden');
  $('zaehler').textContent = '✦ ' + S.fragmente.length;
  cam.x = pos.x * T3; cam.z = pos.z * T3 + 10;
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
    // ---- Bewegung: W ist immer die Blickrichtung der Kamera ----
    const roh = (dialog || fragOffen) ? { x: 0, y: 0 } : richtung();
    const vor = { x: Math.sin(maus.yaw), z: Math.cos(maus.yaw) };
    const rechts = { x: vor.z, z: -vor.x };
    const d = { x: vor.x * -roh.y + rechts.x * roh.x,
                y: vor.z * -roh.y + rechts.z * roh.x };
    const tempo = 3.9;             // Kacheln pro Sekunde
    const geht = Math.hypot(d.x, d.y) > 0.05;
    if (geht) {
      bewege(pos, d.x * tempo * dt, d.y * tempo * dt);
      blick += ((Math.atan2(d.x, d.y) - blick + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 12);
      laufzeit += dt * (1 + Math.hypot(d.x, d.y));
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
    spieler.grp.position.set(wx, 0, wz);
    spieler.grp.rotation.y = blick + (modellGeladen ? Math.PI : 0);
    const ph = laufzeit * 7;
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
        laufClip.timeScale = 1.25;
        laufClip.weight += (ziel - laufClip.weight) * Math.min(1, dt * 8);
        if (!ruheClip) laufClip.paused = !geht && laufClip.weight < 0.02;
      }
      if (ruheClip) ruheClip.weight += ((1 - ziel) - ruheClip.weight) * Math.min(1, dt * 8);
      mixer.update(dt);
    }
    spieler.grp.position.y = sprungY * 2.2
      + (modellGeladen ? 0 : (geht ? Math.abs(Math.sin(ph)) * 0.1 : Math.sin(t * 1.8) * 0.03));
    tragelicht.position.set(wx + Math.sin(blick) * 1.5, 4.2, wz + Math.cos(blick) * 1.5);
    sonne.position.set(wx + 60, 90, wz + 30);
    if (sonne.target) { sonne.target.position.set(wx, 0, wz); sonne.target.updateMatrixWorld(); }

    // ---- Kamera: Orbit um die Figur, Maus bestimmt den Winkel ----
    camYaw = maus.yaw;
    const abst = 8.5;
    const hoehe = 2 + Math.sin(maus.pitch) * abst;
    let zx = wx - Math.sin(camYaw) * Math.cos(maus.pitch) * abst;
    let zz = wz - Math.cos(camYaw) * Math.cos(maus.pitch) * abst;
    // Sichtpruefung: steht ein Monolith zwischen Figur und Kamera,
    // rueckt die Kamera davor, statt hineinzuschneiden
    let frei = 1;
    for (let f = 0.15; f <= 1; f += 0.05) {
      const sx = wx + (zx - wx) * f, sz = wz + (zz - wz) * f;
      const sy = 2 + (hoehe - 2) * f;
      if (sichtHoehe(sx, sz) > sy) { frei = Math.max(0.34, f - 0.08); break; }
    }
    zx = wx + (zx - wx) * frei;
    zz = wz + (zz - wz) * frei;
    // In der Enge steigt die Kamera und schaut herab, statt in Waende
    // zu schneiden. Draussen faehrt sie wieder hinter die Figur.
    const zy = 2 + (hoehe - 2) * frei + (1 - frei) * 7.5;
    cam.x += (zx - cam.x) * Math.min(1, dt * 4.5);
    cam.z += (zz - cam.z) * Math.min(1, dt * 4.5);
    cam.y = (cam.y || hoehe) + (zy - (cam.y || hoehe)) * Math.min(1, dt * 4.5);
    camera.position.set(cam.x, cam.y, cam.z);

    camera.lookAt(wx, 2 + sprungY * T3 / 2, wz);

    // ---- Nebel folgt dem Biom ----
    const bio = BIO[biomAt(Math.floor(pos.x), Math.floor(pos.z))];
    fogZiel.copy(bio.nebel);
    fog.color.lerp(fogZiel, Math.min(1, dt * 1.5));
    scene.background.lerp(fogZiel, Math.min(1, dt * 1.5));

    // ---- Debug (nur Entwicklung) ----
    if (location.search.includes('debug')) {
      $('region').textContent = pos.x.toFixed(1) + ',' + pos.z.toFixed(1)
        + ' yaw ' + camYaw.toFixed(2) + ' frei ' + frei.toFixed(2)
        + ' y ' + cam.y.toFixed(1)
        + ' T ' + Object.keys(tasten).filter(k => tasten[k]).join('+');
    }
    // ---- Region im HUD ----
    let best = null, bd = 1e9;
    for (const r of MAP.regions) {
      const dd = Math.hypot(pos.x - r.x, (pos.z - r.y) * 0.8);
      if (dd < bd) { bd = dd; best = r; }
    }
    if (best && !location.search.includes('debug')) $('region').textContent = best.name.toUpperCase();

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

    // ---- Fragmente drehen ----
    for (const g of dinge) {
      if (g.art === 'frag' && g.aktiv) {
        g.mesh.rotation.y = t * 1.2 + g.idx;
        g.mesh.position.y = 1.6 + Math.sin(t * 2 + g.idx) * 0.25;
      }
    }
  } else {
    eingabe.ok = false;
    // Titelkamera: langsame Fahrt ueber die Welt
    const a = t * 0.05;
    camera.position.set(MAP.W * T3 / 2 + Math.cos(a) * 60, 30, MAP.H * T3 / 2 + Math.sin(a) * 60);
    camera.lookAt(MAP.W * T3 / 2, 6, MAP.H * T3 / 2);
  }

  composer.render();
}
requestAnimationFrame(tick);
