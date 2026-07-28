'use strict';
// ============================================================
// ARKANA World: 24px Tiles, organische Charakter-Animation
// ============================================================

const T = 24; // Tile-Größe

// ------------------------------------------------------------
// TILES. Prozedural gezeichnet, mehrere Schattierungen pro Tile.
// ------------------------------------------------------------
function noise2(x, y) { // deterministisches Pseudo-Rauschen pro Tile
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

G.TILES = {
  // Leerer Grund
  '.': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty);
    if (n > 0.72) { c.fillStyle = p.bgDeep; c.fillRect(x + Math.floor(n * 18), y + Math.floor((n * 37) % 20), 2, 1); }
    if (n < 0.12) { c.fillStyle = p.card; c.fillRect(x + 5, y + 14, 3, 1); }
  } },
  // Boden mit Struktur
  ',': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty);
    c.fillStyle = p.bgDeep;
    c.fillRect(x + 3 + Math.floor(n * 10), y + 5, 3, 1);
    c.fillRect(x + 14, y + 12 + Math.floor(n * 6), 2, 1);
    c.fillRect(x + 8, y + 19, 4, 1);
  } },
  // Mauer, mit Fugen und Kantenlicht
  '#': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    const n = noise2(tx, ty);
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x, y, T, 3);
    c.fillStyle = p.cardHi; c.fillRect(x, y, T, 1);
    c.fillStyle = p.bgDeep; c.fillRect(x, y + T - 3, T, 3);
    // Steinfugen, versetzt je Reihe
    c.fillStyle = p.bgDeep;
    const off = (ty % 2) * 12;
    c.fillRect(x + ((off + 11) % T), y + 3, 1, 9);
    c.fillRect(x, y + 11, T, 1);
    c.fillRect(x + ((off + 5) % T), y + 12, 1, 9);
    if (n > 0.8) { c.fillStyle = p.cardHi; c.fillRect(x + 4, y + 15, 3, 2); }
  } },
  // Fenster / toter Bildschirm
  'W': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x, y, T, 2);
    c.fillStyle = p.bgVoid; c.fillRect(x + 4, y + 4, 16, 13);
    const flick = 0.25 + 0.2 * Math.sin(t * 3 + noise2(tx, ty) * 9);
    c.globalAlpha = flick; c.fillStyle = p.glow; c.fillRect(x + 5, y + 5, 14, 5); c.globalAlpha = 1;
    c.fillStyle = p.dim; c.fillRect(x + 4, y + 17, 16, 1);
  } },
  // Nebel / Wasser, animiert
  '~': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bgDeep; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty) * 6;
    c.fillStyle = p.dim; c.globalAlpha = 0.6;
    const o1 = Math.sin(t * 1.2 + n) * 4, o2 = Math.cos(t * 0.9 + n) * 4;
    c.fillRect(x + 3 + o1, y + 6, 8, 1);
    c.fillRect(x + 11 + o2, y + 14, 7, 1);
    c.globalAlpha = 0.3; c.fillRect(x + 6 + o2, y + 19, 6, 1);
    c.globalAlpha = 1;
  } },
  // Baum / Pfeiler mit Krone
  'T': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const sway = Math.sin(t * 0.8 + noise2(tx, ty) * 7) * 1.2;
    c.fillStyle = p.bgDeep; c.fillRect(x + 9, y + 15, 6, 9);        // Stamm-Schatten
    c.fillStyle = p.dim; c.fillRect(x + 10, y + 14, 4, 10);          // Stamm
    c.fillStyle = p.card; c.fillRect(x + 3 + sway, y + 2, 18, 13);   // Krone
    c.fillStyle = p.cardLight; c.fillRect(x + 5 + sway, y + 3, 14, 6);
    c.fillStyle = p.cardHi; c.fillRect(x + 7 + sway, y + 4, 8, 2);
    c.fillStyle = p.bgDeep; c.fillRect(x + 4 + sway, y + 12, 16, 2);
  } },
  // Pflaster / Weg
  '=': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x + 1, y + 1, T - 2, 1);
    c.fillStyle = p.bg; c.fillRect(x, y + T - 1, T, 1); c.fillRect(x + T - 1, y, 1, T);
    if (noise2(tx, ty) > 0.75) { c.fillStyle = p.bgDeep; c.fillRect(x + 6, y + 9, 5, 2); }
  } },
  // Tür, begehbar
  'D': { solid: false, draw: (c, x, y, p, t) => {
    c.fillStyle = p.bgVoid; c.fillRect(x, y, T, T);
    c.fillStyle = p.dim; c.fillRect(x + 2, y, 2, T); c.fillRect(x + T - 4, y, 2, T); c.fillRect(x + 2, y, T - 4, 2);
    const a = 0.15 + 0.12 * Math.sin(t * 2);
    c.globalAlpha = a; c.fillStyle = p.main; c.fillRect(x + 4, y + 2, T - 8, T - 2); c.globalAlpha = 1;
  } },
  // Leylinie, pulsierender Pfad
  '*': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const pulse = 0.35 + 0.3 * Math.sin(t * 2.5 - (tx + ty) * 0.5);
    c.globalAlpha = pulse * 0.4; c.fillStyle = p.main; c.fillRect(x + 6, y, 12, T);
    c.globalAlpha = pulse; c.fillStyle = p.glow; c.fillRect(x + 10, y, 4, T);
    c.globalAlpha = 1;
  } },
};

// ------------------------------------------------------------
// CHARAKTER: organische Animation mit Feder-Physik
// ------------------------------------------------------------
// Ein Zustandsobjekt pro Figur. Die Animation entsteht aus
// überlagerten Schwingungen plus nachlaufenden Federn, nicht aus
// festen Einzelbildern. Dadurch wirkt die Bewegung weich.
G.newAnim = () => ({
  phase: 0,        // Laufzyklus 0..1
  speed: 0,        // aktuelle Geschwindigkeit 0..1
  dir: 'down',
  facing: 0,       // weicher Richtungswert für Drehung
  vx: 0, vy: 0,
  cloakX: 0, cloakY: 0, cloakVX: 0, cloakVY: 0, // Umhang, Feder
  hoodX: 0, hoodVX: 0,                          // Kapuze, Feder
  squash: 0, squashV: 0,                        // Stauchen beim Anlaufen/Stoppen
  breathe: Math.random() * 6.28,
  blink: 2 + Math.random() * 3,
  blinking: 0,
  stepFlash: 0,
});

// Federschritt: zieht "val" zu "target", mit Dämpfung
function spring(val, vel, target, stiff, damp, dt) {
  const a = (target - val) * stiff - vel * damp;
  vel += a * dt;
  val += vel * dt;
  return [val, vel];
}

G.updateAnim = (an, dt, vx, vy, moving) => {
  const sp = Math.hypot(vx, vy);
  an.vx = vx; an.vy = vy;

  // Geschwindigkeit weich nachziehen, das killt das Ruckeln beim Start
  const targetSpeed = moving ? Math.min(1, sp / 90) : 0;
  an.speed += (targetSpeed - an.speed) * Math.min(1, dt * 9);

  // Laufzyklus. Frequenz skaliert mit Tempo.
  if (an.speed > 0.02) an.phase = (an.phase + dt * (1.7 + an.speed * 2.1)) % 1;
  else an.phase += (0 - (an.phase % 1)) * Math.min(1, dt * 4); // sanft in Ruhepose

  // Blickrichtung
  if (moving && sp > 4) {
    if (Math.abs(vx) > Math.abs(vy)) an.dir = vx < 0 ? 'left' : 'right';
    else an.dir = vy < 0 ? 'up' : 'down';
  }
  const facingTarget = an.dir === 'left' ? -1 : an.dir === 'right' ? 1 : 0;
  an.facing += (facingTarget - an.facing) * Math.min(1, dt * 12);

  // Umhang läuft der Bewegung hinterher (Sekundäranimation)
  const cloakTargetX = -vx * 0.075, cloakTargetY = -vy * 0.055;
  [an.cloakX, an.cloakVX] = spring(an.cloakX, an.cloakVX, cloakTargetX, 130, 13, dt);
  [an.cloakY, an.cloakVY] = spring(an.cloakY, an.cloakVY, cloakTargetY, 130, 13, dt);

  // Kapuze schwingt leicht gegenläufig
  [an.hoodX, an.hoodVX] = spring(an.hoodX, an.hoodVX, -vx * 0.028, 190, 16, dt);

  // Squash beim Beschleunigen und Abbremsen
  const accel = targetSpeed - an.speed;
  [an.squash, an.squashV] = spring(an.squash, an.squashV, accel * 1.4, 210, 15, dt);

  // Atmen im Stand
  an.breathe += dt * (1.5 + an.speed * 1.2);

  // Blinzeln
  an.blink -= dt;
  if (an.blink <= 0) { an.blinking = 0.11; an.blink = 2.4 + Math.random() * 3.4; }
  if (an.blinking > 0) an.blinking -= dt;

  // Schrittmarker für Staubpartikel
  const st = Math.sin(an.phase * Math.PI * 2);
  const wasDown = an.stepFlash;
  an.stepFlash = (st < -0.9 && an.speed > 0.35) ? 1 : 0;
  return an.stepFlash && !wasDown;
};

// Zeichnet die Figur.
// Sprite-Box 20x30. Aufbau von hinten nach vorn:
// Schatten, Umhang, hinteres Bein, Torso, vorderes Bein, Arme, Kopf.
// Die Silhouette bleibt bewusst schmal, damit die Figur lesbar bleibt.
G.drawPlayer = (c, px, py, an, p, cols, glow) => {
  const R = Math.round;
  const w = Math.sin(an.phase * Math.PI * 2);   // Schrittschwingung
  const w2 = Math.sin(an.phase * Math.PI * 4);  // doppelte Frequenz
  const sp = an.speed;
  const side = (an.dir === 'left' || an.dir === 'right');
  const face = an.dir === 'left' ? -1 : 1;

  const bob = -Math.abs(w2) * 1.6 * sp;                    // Auf und Ab
  const breath = Math.sin(an.breathe) * 0.5 * (1 - sp);     // Atmen im Stand
  const sway = w * 0.9 * sp;                                // Wiegen
  const sq = an.squash;
  const sY = 1 - sq * 0.14, sX = 1 + sq * 0.10;

  const baseY = py + bob + breath;
  const cx = px + 10 + sway * 0.5;
  const footY = py + 29;

  const robe = cols.robe, robeHi = cols.robeHi, trim = cols.trim, core = cols.core;
  const robeDark = cols.robeDark || '#1a1410';
  const dark = '#090503';

  // --- Schatten ---
  c.globalAlpha = 0.34 - sp * 0.08;
  c.fillStyle = '#000';
  c.beginPath();
  c.ellipse(px + 10, footY, (6.5 + sp * 1.5) * sX, 2.4, 0, 0, 6.283);
  c.fill();
  c.globalAlpha = 1;

  // --- Schimmer im Prolog ---
  if (glow) {
    c.globalAlpha = 0.13 + 0.05 * Math.sin(an.breathe * 1.3);
    c.fillStyle = glow;
    c.beginPath(); c.ellipse(px + 10, baseY + 16, 13, 17, 0, 0, 6.283); c.fill();
    c.globalAlpha = 1;
  }

  // --- Umhang, hinter allem, kaum breiter als der Körper ---
  // Er weht entgegen der Laufrichtung und flattert am Saum.
  const clx = an.cloakX, cly = an.cloakY;
  const capeTop = baseY + 11, capeH = 15 * sY;
  c.fillStyle = robeDark;
  if (side) {
    // Seitlich: schmale Fahne, die knapp hinter der Schulter weg steht
    const back = -face;
    const drift = Math.max(-4, Math.min(4, clx * 0.55));
    c.beginPath();
    c.moveTo(R(cx + back * 1.5), R(capeTop));
    c.lineTo(R(cx + back * 3.5 + drift), R(capeTop + capeH * 0.65));
    c.lineTo(R(cx + back * 3 + drift), R(capeTop + capeH));
    c.lineTo(R(cx + back * 0.5), R(capeTop + capeH - 2));
    c.closePath(); c.fill();
  } else {
    const wob = w * 0.9 * sp;
    const drift = Math.max(-3, Math.min(3, clx * 0.7));
    c.beginPath();
    c.moveTo(R(cx - 4), R(capeTop));
    c.lineTo(R(cx - 6 + drift + wob), R(capeTop + capeH));
    c.lineTo(R(cx + 6 + drift + wob), R(capeTop + capeH));
    c.lineTo(R(cx + 4), R(capeTop));
    c.closePath(); c.fill();
  }
  // Saum, flattert leicht nach
  c.fillStyle = robe;
  for (let i = 0; i < 3; i++) {
    const fx = cx - 4 + i * 3.5 + Math.max(-3, Math.min(3, clx * 0.7));
    const fy = capeTop + capeH - 2 + Math.sin(an.phase * 6.283 + i * 1.3) * 1.2 * sp;
    c.fillRect(R(fx), R(fy), 3, 2);
  }

  // --- Beine ---
  // In Robenfarbe, damit sie gegen den dunklen Boden lesbar bleiben.
  const legA = w * 2.4 * sp;      // vorderes Bein
  const legB = -w * 2.4 * sp;     // hinteres Bein
  const liftA = Math.max(0, w) * 1.7 * sp;
  const liftB = Math.max(0, -w) * 1.7 * sp;
  const legTop = baseY + 21;
  const legH = 8;
  function leg(offX, lift, shade) {
    const lx = R(cx + offX), ly = R(legTop - lift), lh = R(legH - lift * 0.6);
    c.fillStyle = shade; c.fillRect(lx, ly, 3, lh);
    c.fillStyle = dark; c.fillRect(lx, ly + lh - 2, 3, 2); // Stiefel
  }
  // hinteres Bein zuerst, etwas dunkler
  leg(side ? -1.5 + legB * face : 1.5, liftB, robe);

  // --- Torso ---
  const bodyW = R(11 * sX), bodyH = R(13 * sY);
  const bodyX = R(cx - bodyW / 2), bodyY = R(baseY + 11);
  c.fillStyle = robe; c.fillRect(bodyX, bodyY, bodyW, bodyH);
  c.fillStyle = robeHi; c.fillRect(bodyX + 1, bodyY + 1, bodyW - 2, 4);
  c.fillStyle = dark; c.fillRect(bodyX, bodyY + bodyH - 1, bodyW, 1);
  // Gürtel, nur ein kurzer Akzent
  c.fillStyle = trim; c.fillRect(bodyX + 2, bodyY + 8, bodyW - 4, 1);

  // --- Leuchtender Kern in der Brust ---
  const pulse = 0.5 + 0.5 * Math.sin(an.breathe * 1.7);
  c.globalAlpha = pulse * 0.35; c.fillStyle = core;
  c.fillRect(bodyX + R(bodyW / 2) - 2, bodyY + 3, 4, 4);
  c.globalAlpha = pulse; c.fillRect(bodyX + R(bodyW / 2) - 1, bodyY + 4, 2, 2);
  c.globalAlpha = 1;

  // --- vorderes Bein, heller als das hintere ---
  leg(side ? -1.5 + legA * face : -4.5, liftA, robeHi);

  // --- Arme ---
  // Bei Frontansicht liegen sie eng am Körper, sonst wirken sie wie Stummel.
  const armS = -w * 2.0 * sp;
  if (side) {
    c.fillStyle = robeHi;
    c.fillRect(R(cx - 1 + armS * face), R(baseY + 13), 3, 7);
    c.fillStyle = trim; c.fillRect(R(cx - 1 + armS * face), R(baseY + 19), 3, 1);
  } else {
    c.fillStyle = dark;
    c.fillRect(R(bodyX - 1), R(baseY + 13 + armS * 0.5), 2, 8);
    c.fillRect(R(bodyX + bodyW - 1), R(baseY + 13 - armS * 0.5), 2, 8);
    c.fillStyle = robeHi;
    c.fillRect(R(bodyX - 1), R(baseY + 13 + armS * 0.5), 1, 7);
    c.fillRect(R(bodyX + bodyW), R(baseY + 13 - armS * 0.5), 1, 7);
  }

  // --- Kopf mit Kapuze ---
  const hx = R(cx - 4 + an.hoodX + an.facing * 0.8);
  const hy = R(baseY + 2 + bob * 0.2);
  // Kapuze als Silhouette
  c.fillStyle = robe;
  c.fillRect(hx - 1, hy + 1, 10, 8);
  c.fillRect(hx, hy, 8, 2);
  c.fillStyle = robeHi; c.fillRect(hx + 1, hy, 6, 2);
  // Gesichtsöffnung
  c.fillStyle = dark;
  if (an.dir === 'up') {
    c.fillRect(hx, hy + 2, 8, 5);   // Rückansicht, keine Öffnung
  } else if (side) {
    c.fillRect(hx + (face > 0 ? 3 : 1), hy + 3, 5, 4);
  } else {
    c.fillRect(hx + 1, hy + 3, 6, 4);
  }
  // Augen
  if (an.dir !== 'up' && an.blinking <= 0) {
    c.fillStyle = core; c.globalAlpha = 0.95;
    if (side) c.fillRect(hx + (face > 0 ? 5 : 2), hy + 4, 2, 2);
    else { c.fillRect(hx + 2, hy + 4, 2, 2); c.fillRect(hx + 5, hy + 4, 2, 2); }
    c.globalAlpha = 1;
  }
  // Kapuzenzipfel hinten
  c.fillStyle = robe;
  if (side) c.fillRect(R(hx + (face > 0 ? -2 : 8)), hy + 2, 2, 4);
};

// ------------------------------------------------------------
// NPC: eigene, ruhigere Animation
// ------------------------------------------------------------
G.drawNpc = (c, px, py, p, variant, t, seed) => {
  const x = Math.round(px), y = Math.round(py);
  const ph = t * 1.1 + (seed || 0) * 2.3;
  const breath = Math.sin(ph) * 0.7;
  const tones = [p.textDim, p.dim, p.text, p.accent];
  const tone = tones[variant % tones.length];

  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x + 10, y + 28, 7, 2.5, 0, 0, 6.283); c.fill();
  c.globalAlpha = 1;

  const by = y + breath;
  c.fillStyle = '#0a0604'; c.fillRect(x + 5, by + 22, 4, 6); c.fillRect(x + 12, by + 22, 4, 6);
  c.fillStyle = tone; c.fillRect(x + 4, by + 9, 13, 14);
  c.fillStyle = p.cardLight; c.fillRect(x + 5, by + 10, 11, 4);
  c.fillStyle = p.textDim; c.fillRect(x + 5, by + 1, 11, 9);
  c.fillStyle = '#0a0604'; c.fillRect(x + 6, by + 4, 9, 5);

  // Variante 0 starrt auf einen Bildschirm: kaltes Flackern vorm Gesicht
  if (variant === 0) {
    const f = 0.4 + 0.35 * Math.sin(t * 9 + (seed || 0));
    c.globalAlpha = f; c.fillStyle = '#8fa8c8';
    c.fillRect(x + 6, by + 12, 9, 6);
    c.globalAlpha = f * 0.4; c.fillRect(x + 4, by + 3, 13, 8);
    c.globalAlpha = 1;
  }
};

// ------------------------------------------------------------
// Begleiter-Geist: schwebt, zieht eine Spur
// ------------------------------------------------------------
G.drawSpirit = (c, px, py, p, t, color, trail) => {
  // Spur
  if (trail) {
    for (let i = trail.length - 1; i >= 0; i--) {
      const tr = trail[i];
      c.globalAlpha = (i / trail.length) * 0.28;
      c.fillStyle = color;
      c.fillRect(Math.round(tr.x), Math.round(tr.y), 3, 3);
    }
  }
  const x = px + Math.sin(t * 1.9) * 3.2;
  const y = py + Math.cos(t * 2.6) * 3.8;
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  c.globalAlpha = 0.16 * pulse; c.fillStyle = color;
  c.beginPath(); c.arc(x + 3, y + 3, 9, 0, 6.283); c.fill();
  c.globalAlpha = 0.45 * pulse;
  c.beginPath(); c.arc(x + 3, y + 3, 5, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  c.fillRect(Math.round(x + 1), Math.round(y + 1), 4, 4);
  c.fillStyle = '#fff'; c.globalAlpha = 0.8;
  c.fillRect(Math.round(x + 2), Math.round(y + 2), 2, 2);
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// Fragment: rotierender Splitter mit Lichthof
// ------------------------------------------------------------
G.drawFragment = (c, px, py, p, t, seed) => {
  const x = px + 12, y = py + 12 + Math.sin(t * 1.6 + (seed || 0)) * 2.5;
  const a = 0.55 + 0.45 * Math.sin(t * 3 + (seed || 0) * 2);
  c.globalAlpha = a * 0.18; c.fillStyle = p.bright;
  c.beginPath(); c.arc(x, y, 13, 0, 6.283); c.fill();
  c.globalAlpha = a * 0.4;
  c.beginPath(); c.arc(x, y, 7, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  // Rotierender Rhombus
  const r = t * 1.4 + (seed || 0);
  c.save(); c.translate(x, y); c.rotate(r);
  c.fillStyle = p.bright; c.fillRect(-2, -7, 4, 14); c.fillRect(-7, -2, 14, 4);
  c.fillStyle = p.textBright; c.fillRect(-2, -2, 4, 4);
  c.restore();
};

// ------------------------------------------------------------
// Spiegelschrein
// ------------------------------------------------------------
G.drawShrine = (c, px, py, p, t) => {
  const x = Math.round(px), y = Math.round(py);
  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x + 24, y + 46, 24, 6, 0, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  // Sockel
  c.fillStyle = p.card; c.fillRect(x + 4, y + 24, 40, 22);
  c.fillStyle = p.cardLight; c.fillRect(x + 6, y + 26, 36, 4);
  c.fillStyle = p.bgDeep; c.fillRect(x + 10, y + 32, 28, 12);
  // Spiegelfläche
  const a = 0.45 + 0.35 * Math.sin(t * 1.8);
  c.globalAlpha = a * 0.3; c.fillStyle = p.main;
  c.beginPath(); c.arc(x + 24, y + 14, 22, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = p.bgVoid; c.fillRect(x + 12, y + 2, 24, 24);
  c.fillStyle = p.dim; c.fillRect(x + 12, y + 2, 24, 2); c.fillRect(x + 12, y + 24, 24, 2);
  c.fillRect(x + 12, y + 2, 2, 24); c.fillRect(x + 34, y + 2, 2, 24);
  c.globalAlpha = a; c.fillStyle = p.glow;
  c.fillRect(x + 16, y + 6, 16, 16);
  c.globalAlpha = a * 0.7; c.fillStyle = p.textBright;
  c.fillRect(x + 20, y + 10, 8, 8);
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// Raum zeichnen
// ------------------------------------------------------------
G.drawRoom = (c, room, p, t) => {
  for (let ty = 0; ty < G.ROOM_H; ty++) {
    const row = room[ty] || '';
    for (let tx = 0; tx < G.ROOM_W; tx++) {
      const ch = row[tx] || '.';
      (G.TILES[ch] || G.TILES['.']).draw(c, tx * T, ty * T, p, t, tx, ty);
    }
  }
};

G.isSolid = (room, px, py) => {
  const tx = Math.floor(px / T), ty = Math.floor(py / T);
  if (tx < 0 || tx >= G.ROOM_W || ty < 0 || ty >= G.ROOM_H) return false;
  const ch = (room[ty] || '')[tx] || '.';
  const tile = G.TILES[ch];
  return tile ? tile.solid : false;
};
