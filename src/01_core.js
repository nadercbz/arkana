'use strict';
// ============================================================
// ARKANA Core: 9:16 Hochformat, DPR-scharfes Rendering,
// Input, Engine, Partikel, Text
// ============================================================
const G = {};

// --- Auflösung ---
// Breite fest 360. Spielfeld immer 15x22 Tiles à 24px, damit alle
// Spieler exakt gleich viel sehen. Die Höhe wächst mit dem Gerät:
// auf langen Handys (19.5:9) wird der HUD-Bereich größer, statt
// schwarze Balken zu lassen. Basis bleibt 9:16.
G.W = 360;
G.H_BASE = 640;          // 9:16 Referenz
G.H = G.H_BASE;
G.TILE = 40;             // groessere Kacheln = naeher dran
G.ROOM_W = 9; G.ROOM_H = 14;
G.FIELD_H = G.ROOM_H * G.TILE; // 560
G.HUD_Y = G.FIELD_H;
G.HUD_H = G.H - G.FIELD_H;
G.SAFE_Y = 0;            // Offset, um Vollbild-Menüs vertikal zu zentrieren

// --- Paletten ---
G.PAL = {
  amber: {
    bg: '#1a0d05', bgDeep: '#0d0602', bgVoid: '#050301',
    card: '#2d1b0e', cardLight: '#3d2817', cardHi: '#4d3420',
    main: '#ff8c00', bright: '#ffa500', glow: '#ffb347', dim: '#cc6600',
    text: '#ffd580', textBright: '#ffe8c2', textDim: '#ad6e21',
    accent: '#7ec97e', danger: '#d96a6a',
  },
  gray: {
    bg: '#15161a', bgDeep: '#0b0c0e', bgVoid: '#050506',
    card: '#22242a', cardLight: '#2e3138', cardHi: '#3a3e46',
    main: '#8b8f99', bright: '#a8adb8', glow: '#c0c5d0', dim: '#565a63',
    text: '#9aa0ac', textBright: '#c7ccd6', textDim: '#5c616b',
    accent: '#7a86a0', danger: '#8a6a6a',
  },
};
G.pal = G.PAL.gray;

// Element-Färbung des Spielers, kommt aus dem Sternzeichen
G.ELEMENT_COLORS = {
  Feuer: { robe: '#c4502a', robeHi: '#e8703f', robeDark: '#6b2a16', trim: '#ffb347', core: '#ff8c00' },
  Wasser: { robe: '#2a5f7a', robeHi: '#3f86a8', robeDark: '#163544', trim: '#9fd8e8', core: '#7ec8e8' },
  Erde: { robe: '#4a5a2a', robeHi: '#6b803f', robeDark: '#283016', trim: '#c4d88a', core: '#a8c060' },
  Luft: { robe: '#5a4a7a', robeHi: '#7f6ba8', robeDark: '#312844', trim: '#d8c8f0', core: '#b89ee8' },
};

// --- Biome: jede Region hat eine eigene Farbwelt ---
// Erben von der Amber-Basis, überschreiben nur was anders sein soll.
G.BIOMES = {
  // Leitregel: begehbarer Boden ist deutlich HELLER als alles Feste.
  // bg = Boden, card/cardLight/cardHi = Waende und Gebaeude, dunkel.
  asche:   { bg:'#4a3520', bgDeep:'#33240f', bgVoid:'#0d0803',
             card:'#1e1409', cardLight:'#2c1e10', cardHi:'#3d2b18',
             main:'#ff9a1f', bright:'#ffb84d', glow:'#ffd08a', dim:'#a86a1a',
             text:'#ffd580', textBright:'#fff0d0', textDim:'#c08840' },
  sumpf:   { bg:'#2c4a38', bgDeep:'#1c3325', bgVoid:'#070d0a',
             card:'#0f1f16', cardLight:'#182e20', cardHi:'#25412e',
             main:'#5fd98f', bright:'#8aeeb0', glow:'#b4ffd0', dim:'#3a9a62',
             text:'#b8e8c8', textBright:'#dcffe8', textDim:'#5f9a76' },
  kristall:{ bg:'#332e5c', bgDeep:'#241f45', bgVoid:'#0a0814',
             card:'#141028', cardLight:'#1f1a3d', cardHi:'#2e2757',
             main:'#9d92ff', bright:'#bdb2ff', glow:'#d8d0ff', dim:'#6a5fcc',
             text:'#cac4f5', textBright:'#ece8ff', textDim:'#7a70b8' },
  wueste:  { bg:'#7a5c30', bgDeep:'#5c4322', bgVoid:'#140e06',
             card:'#33240f', cardLight:'#472f14', cardHi:'#5e401d',
             main:'#ffc44d', bright:'#ffd980', glow:'#ffeab0', dim:'#b88a2e',
             text:'#f5dda0', textBright:'#fff3d0', textDim:'#b89a5c' },
  sternen: { bg:'#26375c', bgDeep:'#182644', bgVoid:'#050a14',
             card:'#0d1628', cardLight:'#15223d', cardHi:'#213257',
             main:'#6fb8ff', bright:'#9ad2ff', glow:'#c4e6ff', dim:'#3f7fc4',
             text:'#b4d4f5', textBright:'#dcf0ff', textDim:'#6a8fb8' },
  bibliothek:{ bg:'#54401f', bgDeep:'#3d2d13', bgVoid:'#100b05',
             card:'#241804', cardLight:'#33240c', cardHi:'#473315',
             main:'#e8a955', bright:'#ffc47a', glow:'#ffdba8', dim:'#a8762f',
             text:'#f0d0a0', textBright:'#ffecc8', textDim:'#b8925c' },
  mond:    { bg:'#3d4557', bgDeep:'#2a3140', bgVoid:'#080a0f',
             card:'#151a24', cardLight:'#1f2633', cardHi:'#2e3747',
             main:'#cfdcf0', bright:'#e8f0ff', glow:'#ffffff', dim:'#8896aa',
             text:'#d4dfec', textBright:'#f4f8ff', textDim:'#8a94a4' },
  unterwelt:{ bg:'#4d2420', bgDeep:'#361714', bgVoid:'#0d0403',
             card:'#1e0b09', cardLight:'#2c110e', cardHi:'#3f1c16',
             main:'#ff6b52', bright:'#ff8f78', glow:'#ffb8a4', dim:'#b0402f',
             text:'#f0b0a0', textBright:'#ffdccc', textDim:'#b06a58' },
  hain:    { bg:'#3a4a24', bgDeep:'#293517', bgVoid:'#080b04',
             card:'#151d0c', cardLight:'#212c13', cardHi:'#32421d',
             main:'#b0e85f', bright:'#cdf58a', glow:'#e4ffb8', dim:'#75a838',
             text:'#d0eca8', textBright:'#eeffd4', textDim:'#87a860' },
  // Die graue Stadt: Strasse hell, Gebaeude dunkel, klarer Unterschied
  grau:    { bg:'#4a4e57', bgDeep:'#383b42', bgVoid:'#0a0b0d',
             card:'#16181c', cardLight:'#212429', cardHi:'#2f333a',
             main:'#a8aeba', bright:'#c8ced8', glow:'#e0e6f0', dim:'#6a707c',
             text:'#b4bac6', textBright:'#dde2ea', textDim:'#7a808c' },
};
// Fehlende Schlüssel aus Amber ergänzen, damit nichts undefined ist
for (const b of Object.values(G.BIOMES)) {
  for (const k in G.PAL.amber) if (b[k] === undefined) b[k] = G.PAL.amber[k];
}

// --- Tageszeit ---
// Ein Spieltag dauert 12 Echtzeit-Minuten. Die Stimmung wird zwischen
// vier Stuetzstellen interpoliert und faerbt die ganze Welt. Das
// Umgebungslicht "amb" steuert gleichzeitig, wie stark Fackeln wirken.
G.DAY_KEYS = [
  { t: 0.00, col: [22, 34, 78],  a: 0.52, amb: 0.32 },  // Nacht
  { t: 0.22, col: [118, 84, 96], a: 0.28, amb: 0.68 },  // Daemmerung
  { t: 0.50, col: [255, 242, 214], a: 0.05, amb: 1.00 },// Mittag
  { t: 0.78, col: [196, 96, 44], a: 0.26, amb: 0.74 },  // Abend
];
G.dayPhase = () => {
  const cycle = 12 * 60 * 1000;
  return ((G.timeOffset || 0) + performance.now()) % cycle / cycle;
};
G.dayMood = () => {
  const p = G.dayPhase();
  const K = G.DAY_KEYS;
  let a = K[K.length - 1], b = K[0], span;
  for (let i = 0; i < K.length; i++) {
    const cur = K[i], nxt = K[(i + 1) % K.length];
    const hi = nxt.t > cur.t ? nxt.t : nxt.t + 1;
    if (p >= cur.t && p < hi) { a = cur; b = nxt; span = hi - cur.t; break; }
    if (i === K.length - 1) { a = cur; b = nxt; span = 1 - cur.t + nxt.t; }
  }
  let f = (p - a.t) / span;
  if (f < 0) f += 1 / span;
  f = Math.max(0, Math.min(1, f));
  const sm = f * f * (3 - 2 * f);   // weiche Blende
  return {
    r: Math.round(a.col[0] + (b.col[0] - a.col[0]) * sm),
    g: Math.round(a.col[1] + (b.col[1] - a.col[1]) * sm),
    b: Math.round(a.col[2] + (b.col[2] - a.col[2]) * sm),
    alpha: a.a + (b.a - a.a) * sm,
    amb: a.amb + (b.amb - a.amb) * sm,
    phase: p,
  };
};

// --- Wolkenschatten: einmal gebacken, dann nur noch gekachelt ---
G.cloudTex = null;
G.buildClouds = () => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const cc = cv.getContext('2d');
  const rng = G.mulberry32(9182);
  for (let i = 0; i < 26; i++) {
    const x = rng() * 256, y = rng() * 256, r = 40 + rng() * 70;
    const gr = cc.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(0,0,0,${(0.05 + rng() * 0.07).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    cc.fillStyle = gr; cc.fillRect(x - r, y - r, r * 2, r * 2);
    // Ueber den Rand wiederholen, damit die Kachelung nahtlos bleibt
    for (const [ox, oy] of [[256,0],[-256,0],[0,256],[0,-256]]) {
      const g2 = cc.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      g2.addColorStop(0, `rgba(0,0,0,${(0.05 + rng() * 0.07).toFixed(3)})`);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      cc.fillStyle = g2; cc.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
  G.cloudTex = cv;
};

// Biome, ueber denen Wolken ziehen, mit Staerke
G.CLOUD_STRENGTH = { wueste: 1.0, hain: 0.85, asche: 0.7, mond: 0.5, sumpf: 0.6,
                     sternen: 0.3, bibliothek: 0.25, kristall: 0, unterwelt: 0, grau: 0.55 };

// --- Einstellungen ---
G.settings = { crt: true, partikel: true };

// --- Canvas, DPR-bewusst ---
G.canvas = document.getElementById('game');
G.ctx = G.canvas.getContext('2d', { alpha: false });
G.ctx.imageSmoothingEnabled = false;

function fitCanvas() {
  const vw = window.innerWidth, vh = window.innerHeight;

  // Interne Höhe an das Geräteverhältnis anpassen, damit der Bildschirm
  // ohne Balken gefüllt wird. Das Spielfeld bleibt konstant, nur das
  // HUD wächst. Begrenzt, damit das Layout nicht auseinanderfällt.
  const wanted = Math.round(G.W * (vh / vw) / 2) * 2;
  G.H = Math.max(G.H_BASE, Math.min(wanted, 860));
  G.HUD_H = G.H - G.FIELD_H;
  G.SAFE_Y = Math.round((G.H - G.H_BASE) / 2);

  const scale = Math.min(vw / G.W, vh / G.H);
  const cssW = Math.round(G.W * scale), cssH = Math.round(G.H * scale);
  G.canvas.style.width = cssW + 'px';
  G.canvas.style.height = cssH + 'px';

  // Backing-Store an das physische Pixelraster koppeln: scharfe Kanten
  // auch auf Retina, ohne dass der Browser weichzeichnet.
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const bw = Math.round(cssW * dpr), bh = Math.round(cssH * dpr);
  if (G.canvas.width !== bw || G.canvas.height !== bh) {
    G.canvas.width = bw; G.canvas.height = bh;
  }
  G.renderScale = bw / G.W;
  G.ctx.imageSmoothingEnabled = false;

  const sl = document.getElementById('scanlines');
  const r = G.canvas.getBoundingClientRect();
  sl.style.left = r.left + 'px'; sl.style.top = r.top + 'px';
  sl.style.width = cssW + 'px'; sl.style.height = cssH + 'px';
  sl.style.display = G.settings.crt ? 'block' : 'none';
  // Scanline-Dichte an die Skalierung koppeln, sonst moiriert es
  const period = Math.max(2, Math.round(scale * 2));
  sl.style.backgroundImage = `repeating-linear-gradient(0deg, rgba(0,0,0,0.20) 0px, rgba(0,0,0,0.20) ${period / 2}px, transparent ${period / 2}px, transparent ${period}px)`;
}
window.addEventListener('resize', () => fitCanvas());
window.addEventListener('orientationchange', () => setTimeout(fitCanvas, 100));

// --- Input: Tastatur, Touch-Pad, Wischen ---
G.input = (() => {
  const held = {}; const pressed = {};
  // Analoger Richtungsvektor, damit die Figur weich beschleunigt
  const vec = { x: 0, y: 0 };
  const map = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
    Enter: 'action', ' ': 'action', e: 'action', E: 'action',
    Escape: 'cancel', q: 'cancel', Q: 'cancel',
  };
  window.addEventListener('keydown', (e) => {
    const k = map[e.key];
    if (!k) return;
    e.preventDefault();
    if (!held[k]) pressed[k] = true;
    held[k] = true;
  });
  window.addEventListener('keyup', (e) => { const k = map[e.key]; if (k) held[k] = false; });

  function bindBtn(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const on = (e) => { e.preventDefault(); if (!held[key]) pressed[key] = true; held[key] = true; el.classList.add('on'); };
    const off = (e) => { e.preventDefault(); held[key] = false; el.classList.remove('on'); };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', off);
  }
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
  ['up', 'down', 'left', 'right'].forEach((d) => bindBtn('p-' + d, d));
  bindBtn('p-a', 'action'); bindBtn('p-b', 'cancel');

  // Virtueller Stick: Daumen irgendwo auf der linken Bildhälfte aufsetzen
  const stick = { active: false, id: null, cx: 0, cy: 0, dx: 0, dy: 0 };
  const stickEl = document.getElementById('stick');
  const knobEl = document.getElementById('stick-knob');
  function stickStart(e) {
    for (const t of e.changedTouches) {
      if (t.clientX > window.innerWidth * 0.55) continue; // rechte Hälfte = Aktionen
      stick.active = true; stick.id = t.identifier;
      stick.cx = t.clientX; stick.cy = t.clientY;
      stickEl.style.display = 'block';
      stickEl.style.left = (stick.cx - 60) + 'px';
      stickEl.style.top = (stick.cy - 60) + 'px';
      knobEl.style.transform = 'translate(0px,0px)';
      e.preventDefault();
      break;
    }
  }
  function stickMove(e) {
    if (!stick.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== stick.id) continue;
      let dx = t.clientX - stick.cx, dy = t.clientY - stick.cy;
      const len = Math.hypot(dx, dy), max = 46;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      stick.dx = dx / max; stick.dy = dy / max;
      knobEl.style.transform = `translate(${dx}px,${dy}px)`;
      e.preventDefault();
      break;
    }
  }
  function stickEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier !== stick.id) continue;
      stick.active = false; stick.dx = 0; stick.dy = 0;
      stickEl.style.display = 'none';
      break;
    }
  }
  const zone = document.getElementById('touchzone');
  if (zone) {
    zone.addEventListener('touchstart', stickStart, { passive: false });
    zone.addEventListener('touchmove', stickMove, { passive: false });
    zone.addEventListener('touchend', stickEnd, { passive: false });
    zone.addEventListener('touchcancel', stickEnd, { passive: false });
  }

  return {
    held: (k) => !!held[k],
    pressed: (k) => !!pressed[k],
    // Richtungsvektor aus Stick oder Tasten, normalisiert
    dir() {
      if (stick.active && (Math.abs(stick.dx) > 0.15 || Math.abs(stick.dy) > 0.15)) {
        return { x: stick.dx, y: stick.dy };
      }
      let x = 0, y = 0;
      if (held.left) x -= 1; if (held.right) x += 1;
      if (held.up) y -= 1; if (held.down) y += 1;
      const l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      return { x, y };
    },
    endFrame: () => { for (const k in pressed) delete pressed[k]; },
    clearAll: () => { for (const k in held) held[k] = false; for (const k in pressed) delete pressed[k]; stick.active = false; stick.dx = 0; stick.dy = 0; if (stickEl) stickEl.style.display = 'none'; },
  };
})();

// --- Szenen-Stack ---
G.scenes = [];
G.pushScene = (s) => { G.scenes.push(s); if (s.enter) s.enter(); };
G.popScene = () => { const s = G.scenes.pop(); if (s && s.exit) s.exit(); };
G.replaceScene = (s) => { while (G.scenes.length) G.popScene(); G.pushScene(s); };
G.topScene = () => G.scenes[G.scenes.length - 1];

// --- Partikel-System (Asche, Funken, Staub) ---
G.particles = [];
G.spawnParticle = (p) => { if (G.settings.partikel && G.particles.length < 220) G.particles.push(p); };
G.updateParticles = (dt) => {
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const p = G.particles[i];
    p.life -= dt;
    if (p.life <= 0) { G.particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.drift) p.x += Math.sin(p.life * p.drift) * 6 * dt;
    if (p.grav) p.vy += p.grav * dt;
  }
};
G.drawParticles = (c) => {
  for (const p of G.particles) {
    const a = Math.min(1, p.life / (p.fade || 1));
    c.globalAlpha = a * (p.alpha || 1);
    c.fillStyle = p.color;
    const s = p.size || 2;
    c.fillRect(Math.round(p.x), Math.round(p.y), s, s);
  }
  c.globalAlpha = 1;
};

// --- Bildschirm-Erschütterung ---
G.shake = { t: 0, mag: 0 };
G.doShake = (mag, dur) => { G.shake.mag = mag; G.shake.t = dur; };

// --- Game Loop (fester Timestep, rAF plus Fallback) ---
(() => {
  let last = performance.now(); let acc = 0; let lastTick = 0;
  const STEP = 1000 / 60;
  function tick() {
    const now = performance.now();
    lastTick = now;
    acc += Math.min(now - last, 100); last = now;
    let steps = 0;
    while (acc >= STEP && steps < 5) {
      const s = G.topScene();
      if (s) s.update(STEP / 1000);
      G.updateParticles(STEP / 1000);
      if (G.shake.t > 0) G.shake.t -= STEP / 1000;
      G.input.endFrame();
      acc -= STEP; steps++;
    }
    if (acc > STEP * 5) acc = 0;

    const ctx = G.ctx;
    ctx.save();
    ctx.scale(G.renderScale || 1, G.renderScale || 1);
    ctx.fillStyle = G.pal.bgVoid;
    ctx.fillRect(0, 0, G.W, G.H);
    if (G.shake.t > 0) {
      const m = G.shake.mag * (G.shake.t);
      ctx.translate(Math.round((Math.random() - 0.5) * m), Math.round((Math.random() - 0.5) * m));
    }
    const s = G.topScene();
    if (s) {
      if (s.translucent && G.scenes.length > 1) G.scenes[G.scenes.length - 2].draw(ctx);
      s.draw(ctx);
    }
    ctx.restore();
  }
  function frame() {
    // Eine Exception darf die rAF-Kette nicht abreissen, sonst friert
    // das Bild dauerhaft ein und man kommt nicht mal ins Menue zurueck.
    try { tick(); } catch (e) { console.error('Frame-Fehler:', e); }
    finally { requestAnimationFrame(frame); }
  }
  requestAnimationFrame(frame);
  setInterval(() => { try { if (performance.now() - lastTick > 50) tick(); } catch (e) { /* siehe oben */ } }, 33);
  G._tick = tick;
})();

// --- Text ---
G.FONT = "'Courier New', ui-monospace, monospace";
G.text = (ctx, str, x, y, color, size = 14, align = 'left', weight = '') => {
  ctx.font = `${weight} ${size}px ${G.FONT}`.trim();
  ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
};
G.textGlow = (ctx, str, x, y, color, size = 14, align = 'center') => {
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = 8;
  G.text(ctx, str, x, y, color, size, align, 'bold');
  ctx.restore();
};
G.wrapText = (ctx, str, maxWidth, size = 14) => {
  ctx.font = `${size}px ${G.FONT}`;
  const words = str.split(' '); const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
};

// --- Vignette ---
// Distanznebel statt schwarzer Vignette: der Bildrand verliert Kontrast
// in der Farbe des Bioms. Der Gradient wird pro Biom einmal gebaut.
G.FOG = { wueste: 0.62, sumpf: 0.70, unterwelt: 0.58, kristall: 0.50,
          hain: 0.55, mond: 0.48, sternen: 0.42, bibliothek: 0.52,
          asche: 0.50, grau: 0.66 };
G._fogCache = {};
G.vignette = (c, strength = 0.55, biome) => {
  const pal = (biome && G.BIOMES[biome]) || G.pal;
  const s = (biome && G.FOG[biome] !== undefined) ? G.FOG[biome] : strength;
  const key = (biome || 'x') + '|' + Math.round(s * 20) + '|' + G.FIELD_H;
  let g = G._fogCache[key];
  if (!g) {
    const hex = pal.bgDeep.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16), gg = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    g = c.createRadialGradient(G.W / 2, G.FIELD_H / 2, G.W * 0.30, G.W / 2, G.FIELD_H / 2, G.W * 0.92);
    g.addColorStop(0, `rgba(${r},${gg},${b},0)`);
    g.addColorStop(0.6, `rgba(${r},${gg},${b},${(s * 0.35).toFixed(3)})`);
    g.addColorStop(1, `rgba(${r},${gg},${b},${s.toFixed(3)})`);
    G._fogCache[key] = g;
  }
  c.fillStyle = g;
  c.fillRect(0, 0, G.W, G.FIELD_H);
};

// --- Zufall mit Seed ---
G.mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
G.hashStr = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// --- Spielstand ---
G.state = null;
G.save = () => { try { localStorage.setItem('arkana_save', JSON.stringify(G.state)); } catch (e) { /* ignoriert */ } };
G.load = () => {
  // Spielstaende aus aelteren Versionen duerfen das Spiel nicht kaputt
  // machen. Deshalb gegen einen frischen Zustand mergen und pruefen.
  try {
    const raw = localStorage.getItem('arkana_save');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object') return null;
    if (!s.area) return null;
    const base = G.newState();
    const merged = {
      ...base, ...s,
      stats: { ...base.stats, ...(s.stats || {}) },
      fragmente: Array.isArray(s.fragmente) ? s.fragmente : [],
      gelesen: (s.gelesen && typeof s.gelesen === 'object') ? s.gelesen : {},
      flags: (s.flags && typeof s.flags === 'object') ? s.flags : {},
    };
    if (typeof merged.px !== 'number' || !Number.isFinite(merged.px)) merged.px = base.px;
    if (typeof merged.py !== 'number' || !Number.isFinite(merged.py)) merged.py = base.py;
    // In Arkana ohne Signatur waere der Zustand unbrauchbar
    if (merged.phase === 'arkana' && !merged.sig) return null;
    return merged;
  } catch (e) { return null; }
};
G.clearSave = () => { try { localStorage.removeItem('arkana_save'); } catch (e) { /* ignoriert */ } };
