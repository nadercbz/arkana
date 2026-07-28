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
  asche:   { bg:'#1a0d05', bgDeep:'#0d0602', bgVoid:'#050301', card:'#2d1b0e', cardLight:'#3d2817', cardHi:'#4d3420',
             main:'#ff8c00', bright:'#ffa500', glow:'#ffb347', dim:'#cc6600', text:'#ffd580', textBright:'#ffe8c2', textDim:'#ad6e21' },
  sumpf:   { bg:'#0d1a12', bgDeep:'#061009', bgVoid:'#030805', card:'#1a2d20', cardLight:'#26402e', cardHi:'#33543d',
             main:'#4fbf7f', bright:'#6fd99a', glow:'#8fe8b4', dim:'#2f8f5a', text:'#a8e0c0', textBright:'#d0f0dd', textDim:'#4a8f68' },
  kristall:{ bg:'#0f0d20', bgDeep:'#080614', bgVoid:'#04030a', card:'#1e1a3a', cardLight:'#2c2652', cardHi:'#3d356e',
             main:'#8a7fff', bright:'#a99cff', glow:'#c4baff', dim:'#5a4fbf', text:'#c0b8f0', textBright:'#e0dcff', textDim:'#6a5fa0' },
  wueste:  { bg:'#241a0e', bgDeep:'#160f07', bgVoid:'#0a0704', card:'#3d2d17', cardLight:'#54401f', cardHi:'#6e552b',
             main:'#e8b040', bright:'#ffc960', glow:'#ffdb8f', dim:'#a87c28', text:'#f0d89a', textBright:'#fff0c8', textDim:'#a08850' },
  sternen: { bg:'#08101f', bgDeep:'#040914', bgVoid:'#02050a', card:'#12203a', cardLight:'#1b2e52', cardHi:'#264070',
             main:'#5fa8ff', bright:'#8ac4ff', glow:'#b4dcff', dim:'#3a6fb0', text:'#a8ccf0', textBright:'#d8ecff', textDim:'#5a7fa8' },
  bibliothek:{ bg:'#1c1208', bgDeep:'#100a05', bgVoid:'#070402', card:'#33230f', cardLight:'#4a3418', cardHi:'#664824',
             main:'#d99a4a', bright:'#f0b468', glow:'#ffcd90', dim:'#996b30', text:'#e8c895', textBright:'#ffe4c0', textDim:'#9a7a50' },
  mond:    { bg:'#101420', bgDeep:'#080b14', bgVoid:'#040609', card:'#1e2436', cardLight:'#2c344c', cardHi:'#3d4766',
             main:'#c0d0e8', bright:'#dce6f5', glow:'#f0f5ff', dim:'#7f8fa8', text:'#c8d4e4', textBright:'#eaf0fa', textDim:'#7a8496' },
  unterwelt:{ bg:'#1a0808', bgDeep:'#100404', bgVoid:'#080202', card:'#2e1212', cardLight:'#421c1a', cardHi:'#5c2824',
             main:'#e0503f', bright:'#f5705a', glow:'#ff9480', dim:'#a03428', text:'#e8a898', textBright:'#ffd0c4', textDim:'#9a5a4c' },
  hain:    { bg:'#12180c', bgDeep:'#0a0f07', bgVoid:'#050803', card:'#22301a', cardLight:'#324528', cardHi:'#455e36',
             main:'#9fd94f', bright:'#bce870', glow:'#d6f79a', dim:'#6a9a33', text:'#c8e4a0', textBright:'#e8f8cc', textDim:'#7a9a58' },
  grau:    { bg:'#15161a', bgDeep:'#0b0c0e', bgVoid:'#050506', card:'#22242a', cardLight:'#2e3138', cardHi:'#3a3e46',
             main:'#8b8f99', bright:'#a8adb8', glow:'#c0c5d0', dim:'#565a63', text:'#9aa0ac', textBright:'#c7ccd6', textDim:'#5c616b' },
};
// Fehlende Schlüssel aus Amber ergänzen, damit nichts undefined ist
for (const b of Object.values(G.BIOMES)) {
  for (const k in G.PAL.amber) if (b[k] === undefined) b[k] = G.PAL.amber[k];
}

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
G.vignette = (c, strength = 0.55) => {
  const g = c.createRadialGradient(G.W / 2, G.FIELD_H / 2, G.W * 0.28, G.W / 2, G.FIELD_H / 2, G.W * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
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
