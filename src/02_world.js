'use strict';
// ============================================================
// ARKANA World: 24px Tiles, organische Charakter-Animation
// ============================================================

const T = 40; // Tile-Größe, passt zu G.TILE

// ------------------------------------------------------------
// TILES für 40px. Prozedural gezeichnet, mehrere Schattierungen.
// ------------------------------------------------------------
function noise2(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

G.TILES = {
  // Leerer Grund mit feiner Körnung
  '.': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty);
    c.fillStyle = p.bgDeep;
    c.fillRect(x + Math.floor(n * 30), y + Math.floor((n * 61) % 34), 3, 2);
    c.fillRect(x + Math.floor((n * 91) % 32), y + Math.floor((n * 47) % 30) + 4, 2, 2);
    if (n < 0.18) { c.fillStyle = p.card; c.fillRect(x + 8, y + 24, 6, 2); }
    if (n > 0.86) { c.fillStyle = p.card; c.fillRect(x + 22, y + 11, 5, 2); }
  } },
  // Innenboden, Dielen
  ',': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty);
    c.fillStyle = p.bgDeep;
    c.fillRect(x, y + 13, T, 1); c.fillRect(x, y + 27, T, 1);
    c.fillRect(x + Math.floor(n * 24) + 6, y, 1, 13);
    c.fillRect(x + Math.floor((n * 53) % 26) + 6, y + 14, 1, 13);
    c.fillStyle = p.card;
    c.fillRect(x + 5 + Math.floor(n * 14), y + 6, 5, 1);
  } },
  // Mauer mit Steinfugen und Kantenlicht
  '#': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    const n = noise2(tx, ty);
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x, y, T, 4);
    c.fillStyle = p.cardHi; c.fillRect(x, y, T, 2);
    c.fillStyle = p.bgDeep; c.fillRect(x, y + T - 4, T, 4);
    c.fillStyle = p.bgDeep;
    // zwei Steinreihen, versetzt
    c.fillRect(x, y + 19, T, 2);
    const off = (ty % 2) * 20;
    c.fillRect(x + ((off + 19) % T), y + 4, 2, 15);
    c.fillRect(x + ((off + 9) % T), y + 21, 2, 15);
    c.fillStyle = p.cardLight;
    c.fillRect(x + 1, y + 21, T - 2, 1);
    if (n > 0.82) { c.fillStyle = p.cardHi; c.fillRect(x + 6, y + 26, 5, 3); }
    if (n < 0.15) { c.fillStyle = p.bgDeep; c.fillRect(x + 24, y + 8, 6, 4); }
  } },
  // Fenster, kaltes Flackern dahinter
  'W': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x, y, T, 3);
    c.fillStyle = p.bgVoid; c.fillRect(x + 6, y + 7, 28, 22);
    const flick = 0.22 + 0.18 * Math.sin(t * 3 + noise2(tx, ty) * 9);
    c.globalAlpha = flick; c.fillStyle = '#8fa8c8';
    c.fillRect(x + 8, y + 9, 24, 10);
    c.globalAlpha = flick * 0.5; c.fillRect(x + 8, y + 20, 24, 6);
    c.globalAlpha = 1;
    c.fillStyle = p.dim;
    c.fillRect(x + 6, y + 7, 28, 2); c.fillRect(x + 6, y + 28, 28, 2);
    c.fillRect(x + 19, y + 7, 2, 22);
  } },
  // Nebel und Wasser, animiert
  '~': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bgDeep; c.fillRect(x, y, T, T);
    const n = noise2(tx, ty) * 6;
    c.fillStyle = p.dim; c.globalAlpha = 0.55;
    const o1 = Math.sin(t * 1.2 + n) * 6, o2 = Math.cos(t * 0.9 + n) * 6;
    c.fillRect(x + 5 + o1, y + 9, 14, 2);
    c.fillRect(x + 18 + o2, y + 22, 12, 2);
    c.globalAlpha = 0.3;
    c.fillRect(x + 9 + o2, y + 32, 11, 2);
    c.fillRect(x + 22 + o1, y + 4, 9, 1);
    c.globalAlpha = 1;
  } },
  // Baum mit Krone und Stamm
  'T': { solid: true, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const sway = Math.sin(t * 0.8 + noise2(tx, ty) * 7) * 1.6;
    c.globalAlpha = 0.3; c.fillStyle = '#000';
    c.beginPath(); c.ellipse(x + 20, y + 36, 11, 3.5, 0, 0, 6.283); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = p.bgDeep; c.fillRect(x + 16, y + 24, 9, 13);
    c.fillStyle = p.dim; c.fillRect(x + 17, y + 23, 6, 13);
    c.fillStyle = p.card; c.fillRect(x + 5 + sway, y + 3, 30, 22);
    c.fillStyle = p.cardLight; c.fillRect(x + 8 + sway, y + 5, 24, 11);
    c.fillStyle = p.cardHi; c.fillRect(x + 12 + sway, y + 6, 13, 4);
    c.fillStyle = p.bgDeep;
    c.fillRect(x + 6 + sway, y + 21, 28, 3);
    c.fillRect(x + 5 + sway, y + 12, 4, 3);
  } },
  // Pflaster
  '=': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.card; c.fillRect(x, y, T, T);
    c.fillStyle = p.cardLight; c.fillRect(x + 2, y + 2, T - 4, 2);
    c.fillStyle = p.bg;
    c.fillRect(x, y + T - 2, T, 2); c.fillRect(x + T - 2, y, 2, T);
    c.fillRect(x, y + 19, T, 1); c.fillRect(x + 19, y, 1, T);
    if (noise2(tx, ty) > 0.7) { c.fillStyle = p.bgDeep; c.fillRect(x + 9, y + 24, 8, 3); }
  } },
  // Tür
  'D': { solid: false, draw: (c, x, y, p, t) => {
    c.fillStyle = p.bgVoid; c.fillRect(x, y, T, T);
    c.fillStyle = p.dim;
    c.fillRect(x + 3, y, 3, T); c.fillRect(x + T - 6, y, 3, T); c.fillRect(x + 3, y, T - 6, 3);
    const a = 0.14 + 0.11 * Math.sin(t * 2);
    c.globalAlpha = a; c.fillStyle = p.main; c.fillRect(x + 6, y + 3, T - 12, T - 3);
    c.globalAlpha = 1;
    c.fillStyle = p.glow; c.fillRect(x + T - 12, y + 20, 3, 3);
  } },
  // Leylinie
  '*': { solid: false, draw: (c, x, y, p, t, tx, ty) => {
    c.fillStyle = p.bg; c.fillRect(x, y, T, T);
    const pulse = 0.35 + 0.3 * Math.sin(t * 2.5 - (tx + ty) * 0.5);
    c.globalAlpha = pulse * 0.35; c.fillStyle = p.main; c.fillRect(x + 9, y, 22, T);
    c.globalAlpha = pulse * 0.8; c.fillStyle = p.glow; c.fillRect(x + 16, y, 8, T);
    c.globalAlpha = pulse; c.fillStyle = p.textBright; c.fillRect(x + 19, y, 2, T);
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

// --- Erweiterte Kacheln für die verschiedenen Habitate ---

// Fels, unregelmäßiger als die Mauer, für Höhlen
G.TILES['R'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.card; c.fillRect(x,y,T,T);
  c.fillStyle = p.cardLight;
  c.fillRect(x+2, y+1, T-6, 4); c.fillRect(x+1, y+8, 8, 5);
  c.fillStyle = p.cardHi; c.fillRect(x+4+Math.floor(n*8), y+2, 7, 2);
  c.fillStyle = p.bgDeep;
  c.fillRect(x+Math.floor(n*20), y+18, 9, 4);
  c.fillRect(x+3, y+T-5, T-8, 5);
  c.fillRect(x+22, y+9, 5, 7);
} };

// Kristall, leuchtet und pulsiert
G.TILES['c'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty), pu = 0.5+0.4*Math.sin(t*1.6+n*8);
  c.fillStyle = p.bgDeep; c.fillRect(x,y,T,T);
  c.globalAlpha = pu*0.22; c.fillStyle = p.glow;
  c.beginPath(); c.arc(x+20,y+20,19,0,6.283); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = p.dim;
  c.beginPath(); c.moveTo(x+20,y+3); c.lineTo(x+32,y+22); c.lineTo(x+20,y+36); c.lineTo(x+8,y+22); c.closePath(); c.fill();
  c.fillStyle = p.main;
  c.beginPath(); c.moveTo(x+20,y+7); c.lineTo(x+28,y+22); c.lineTo(x+20,y+32); c.lineTo(x+13,y+22); c.closePath(); c.fill();
  c.globalAlpha = pu; c.fillStyle = p.bright;
  c.beginPath(); c.moveTo(x+20,y+11); c.lineTo(x+24,y+22); c.lineTo(x+20,y+28); c.closePath(); c.fill();
  c.globalAlpha = 1;
} };

// Sand, hell und weich
G.TILES['s'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.card; c.fillRect(x,y,T,T);
  c.fillStyle = p.cardLight;
  c.fillRect(x, y+Math.floor(n*14)+3, T, 2);
  c.fillRect(x, y+Math.floor(n*16)+21, T, 2);
  c.fillStyle = p.cardHi;
  c.fillRect(x+Math.floor(n*24), y+Math.floor(n*30), 4, 1);
} };

// Gras und Kräuter
G.TILES['g'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.fillStyle = p.card;
  for (let i=0;i<5;i++) {
    const gx = x+3+((i*13+Math.floor(n*20))%34), gy = y+8+((i*9+Math.floor(n*17))%26);
    const sway = Math.sin(t*1.4+gx*0.3)*1.2;
    c.fillRect(Math.round(gx+sway), gy, 1, 5);
    c.fillRect(Math.round(gx+sway*1.4), gy-2, 1, 3);
  }
  c.fillStyle = p.dim;
  if (n>0.6) { const sw = Math.sin(t*1.1+tx)*1.5; c.fillRect(Math.round(x+18+sw), y+14, 2, 8); }
} };

// Blühende Pflanze
G.TILES['p'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty), sw = Math.sin(t*1.2+n*7)*1.8;
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.fillStyle = p.dim; c.fillRect(Math.round(x+19+sw*0.4), y+18, 2, 14);
  c.fillStyle = p.card; c.fillRect(Math.round(x+14+sw*0.6), y+22, 5, 2); c.fillRect(Math.round(x+21+sw*0.6), y+26, 5, 2);
  const bx = Math.round(x+16+sw), by = y+10;
  c.fillStyle = p.main; c.fillRect(bx, by, 8, 8);
  c.fillStyle = p.bright; c.fillRect(bx+2, by+2, 4, 4);
  c.globalAlpha = 0.4+0.3*Math.sin(t*2+n*5); c.fillStyle = p.glow;
  c.fillRect(bx+3, by+3, 2, 2); c.globalAlpha = 1;
} };

// Säule
G.TILES['o'] = { solid: true, draw: (c,x,y,p,t) => {
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x+20,y+35,11,3.5,0,0,6.283); c.fill(); c.globalAlpha = 1;
  c.fillStyle = p.card; c.fillRect(x+11, y+4, 18, 30);
  c.fillStyle = p.cardLight; c.fillRect(x+13, y+4, 5, 30);
  c.fillStyle = p.cardHi; c.fillRect(x+8, y+2, 24, 5); c.fillRect(x+9, y+30, 22, 5);
  c.fillStyle = p.bgDeep; c.fillRect(x+22, y+8, 2, 22);
} };

// Bücherregal
G.TILES['b'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.bgDeep; c.fillRect(x,y,T,T);
  c.fillStyle = p.card; c.fillRect(x+1,y+1,T-2,T-2);
  c.fillStyle = p.cardHi; c.fillRect(x+1,y+1,T-2,2);
  for (let row=0; row<3; row++) {
    const ry = y+5+row*11;
    c.fillStyle = p.bgDeep; c.fillRect(x+2, ry+8, T-4, 2);
    for (let b=0; b<5; b++) {
      const h = 5 + ((Math.floor(n*100)+b*7+row*3)%4);
      c.fillStyle = [p.dim, p.main, p.cardLight, p.textDim][(b+row)%4];
      c.fillRect(x+3+b*7, ry+8-h, 5, h);
    }
  }
} };

// Statue
G.TILES['x'] = { solid: true, draw: (c,x,y,p,t) => {
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x+20,y+36,12,3.5,0,0,6.283); c.fill(); c.globalAlpha = 1;
  c.fillStyle = p.cardLight; c.fillRect(x+8, y+31, 24, 6);
  c.fillStyle = p.card; c.fillRect(x+13, y+13, 14, 19);
  c.fillStyle = p.cardHi; c.fillRect(x+15, y+15, 4, 16);
  c.fillRect(x+15, y+5, 10, 9);
  c.fillStyle = p.bgDeep; c.fillRect(x+17, y+8, 2, 3); c.fillRect(x+22, y+8, 2, 3);
  c.fillStyle = p.card; c.fillRect(x+9, y+16, 4, 11); c.fillRect(x+27, y+16, 4, 11);
} };

// Fackel, wirft Licht
G.TILES['f'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty), fl = 0.6+0.4*Math.sin(t*7+n*9);
  c.fillStyle = p.card; c.fillRect(x,y,T,T);
  c.fillStyle = p.bgDeep; c.fillRect(x,y+T-3,T,3);
  c.globalAlpha = fl*0.25; c.fillStyle = p.glow;
  c.beginPath(); c.arc(x+20,y+14,22,0,6.283); c.fill(); c.globalAlpha = 1;
  c.fillStyle = p.dim; c.fillRect(x+18, y+16, 4, 16);
  c.fillStyle = p.main; c.fillRect(x+16, y+8+Math.sin(t*9+n)*1, 8, 9);
  c.fillStyle = p.bright; c.fillRect(x+18, y+5+Math.sin(t*11+n)*1.4, 4, 8);
  c.globalAlpha = fl; c.fillStyle = p.textBright; c.fillRect(x+19, y+7, 2, 4); c.globalAlpha = 1;
} };

// Abgrund, nicht begehbar
G.TILES['v'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  c.fillStyle = p.bgVoid; c.fillRect(x,y,T,T);
  const n = noise2(tx,ty);
  c.globalAlpha = 0.3+0.2*Math.sin(t*0.7+n*6); c.fillStyle = p.dim;
  c.fillRect(x+Math.floor(n*30), y+Math.floor(n*34), 2, 2);
  c.fillRect(x+Math.floor((n*71)%34), y+Math.floor((n*53)%36), 1, 1);
  c.globalAlpha = 1;
  c.fillStyle = p.bgDeep;
  c.fillRect(x, y, T, 2); c.fillRect(x, y+T-2, T, 2);
} };

// Brücke über den Abgrund
G.TILES['B'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  c.fillStyle = p.bgVoid; c.fillRect(x,y,T,T);
  c.fillStyle = p.card; c.fillRect(x, y+6, T, 28);
  c.fillStyle = p.cardLight; c.fillRect(x, y+6, T, 2);
  c.fillStyle = p.bgDeep;
  for (let i=0;i<4;i++) c.fillRect(x+2+i*10, y+8, 1, 24);
  c.fillRect(x, y+32, T, 2);
} };

// Flaches Wasser, begehbar
G.TILES['w'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.bgDeep; c.fillRect(x,y,T,T);
  c.globalAlpha = 0.5; c.fillStyle = p.dim;
  const o = Math.sin(t*1.5+n*6)*5;
  c.fillRect(x+4+o, y+11, 13, 2); c.fillRect(x+20-o, y+25, 11, 2);
  c.globalAlpha = 0.25; c.fillStyle = p.glow;
  c.fillRect(x+8-o, y+31, 9, 1); c.fillRect(x+24+o, y+6, 8, 1);
  c.globalAlpha = 1;
} };

// Eis
G.TILES['i'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.card; c.fillRect(x,y,T,T);
  c.fillStyle = p.cardLight; c.fillRect(x+1,y+1,T-2,T-2);
  c.fillStyle = p.cardHi;
  c.beginPath(); c.moveTo(x+6+n*12, y+3); c.lineTo(x+30, y+18+n*8); c.lineTo(x+12, y+34); c.closePath(); c.fill();
  c.globalAlpha = 0.4+0.2*Math.sin(t*1.2+n*7); c.fillStyle = p.bright;
  c.fillRect(x+7, y+6, 12, 1); c.fillRect(x+21, y+24, 9, 1);
  c.globalAlpha = 1;
} };

// Monolith mit eingraviertem Zeichen
G.TILES['M'] = { solid: true, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.globalAlpha = 0.32; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x+20,y+37,10,3,0,0,6.283); c.fill(); c.globalAlpha = 1;
  c.fillStyle = p.bgDeep; c.fillRect(x+11, y+2, 18, 36);
  c.fillStyle = p.card; c.fillRect(x+12, y+3, 15, 34);
  c.fillStyle = p.cardLight; c.fillRect(x+13, y+4, 4, 32);
  const glow = 0.4+0.35*Math.sin(t*1.3+n*8);
  c.globalAlpha = glow; c.fillStyle = p.main;
  c.fillRect(x+17, y+11, 6, 2); c.fillRect(x+19, y+13, 2, 8);
  c.fillRect(x+16, y+23, 8, 2);
  c.globalAlpha = 1;
} };

// Treppe
G.TILES['^'] = { solid: false, draw: (c,x,y,p,t) => {
  c.fillStyle = p.bgDeep; c.fillRect(x,y,T,T);
  for (let i=0;i<4;i++) {
    c.fillStyle = i%2 ? p.card : p.cardLight;
    c.fillRect(x+i*2, y+i*10, T-i*4, 9);
    c.fillStyle = p.bgDeep; c.fillRect(x+i*2, y+i*10+9, T-i*4, 1);
  }
} };

// Wurzelwerk, begehbar aber dicht
G.TILES['r'] = { solid: false, draw: (c,x,y,p,t,tx,ty) => {
  const n = noise2(tx,ty);
  c.fillStyle = p.bg; c.fillRect(x,y,T,T);
  c.strokeStyle = p.card; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x, y+8+n*12); c.quadraticCurveTo(x+20, y+20+n*8, x+T, y+14+n*10);
  c.stroke();
  c.beginPath();
  c.moveTo(x+6+n*10, y); c.quadraticCurveTo(x+18, y+22, x+12+n*14, y+T);
  c.stroke();
  c.strokeStyle = p.cardLight; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x, y+9+n*12); c.quadraticCurveTo(x+20, y+21+n*8, x+T, y+15+n*10); c.stroke();
} };


// ------------------------------------------------------------
// MENSCH. Sprite-Box 26 breit, 42 hoch. Füße bei py+40.
// Aufbau: Haar, Kopf, Hals, Rumpf, Arme, Beine, Stiefel.
// Die Bewegung entsteht aus einem echten Gehzyklus: jeder Fuß
// steht eine halbe Periode am Boden und schwingt eine halbe
// Periode durch die Luft. Daraus werden Knie, Hüfte, Schultern
// und Kopf abgeleitet. Nichts davon sind feste Einzelbilder.
// ------------------------------------------------------------

// Fußposition im Gehzyklus. t läuft 0..1.
// Rückgabe: x seitlicher Versatz, y Höhe über dem Boden (negativ = angehoben)
function footCycle(t, stride, lift) {
  t = ((t % 1) + 1) % 1;
  if (t < 0.5) {
    // Standphase: Fuß klebt am Boden und wandert nach hinten
    const k = t / 0.5;
    return { x: stride * (1 - 2 * k), y: 0, planted: true };
  }
  // Schwungphase: Fuß hebt ab, zieht nach vorn, setzt wieder auf
  const k = (t - 0.5) / 0.5;
  return { x: stride * (-1 + 2 * k), y: -lift * Math.sin(k * Math.PI), planted: false };
}

G.drawPlayer = (c, px, py, an, p, cols, glow) => {
  const R = Math.round;
  const sp = an.speed;
  const side = (an.dir === 'left' || an.dir === 'right');
  const face = an.dir === 'left' ? -1 : 1;
  const back = (an.dir === 'up');

  // Hautton, bewusst neutral gehalten
  const skin = '#c98f63', skinSh = '#9c6b45', skinHi = '#e0ab7d';
  const hair = '#3a2418', hairHi = '#57351f';
  const shirt = cols.robe, shirtHi = cols.robeHi, shirtDark = cols.robeDark || '#1a1410';
  const trim = cols.trim, core = cols.core;
  const pants = '#2e2a33', pantsHi = '#413c48';
  const boot = '#1a1512';

  // --- Gehzyklus ---
  const stride = 4.2 * sp;
  const lift = 3.4 * sp;
  const fA = footCycle(an.phase, stride, lift);          // vorderes/linkes Bein
  const fB = footCycle(an.phase + 0.5, stride, lift);    // hinteres/rechtes Bein

  // Körper sinkt bei jedem Aufsetzen leicht ein, steigt in der Mitte
  const bob = -Math.abs(Math.sin(an.phase * Math.PI * 2)) * 1.5 * sp + 0.8 * sp;
  const breath = Math.sin(an.breathe) * 0.6 * (1 - sp);
  // Gewichtsverlagerung im Stand
  const idleShift = Math.sin(an.breathe * 0.5) * 0.7 * (1 - sp);
  // Hüfte kippt zur Standbeinseite, Schultern gegenläufig
  const hipTilt = Math.sin(an.phase * Math.PI * 2) * 1.3 * sp;
  const shoulderTilt = -hipTilt * 0.75;

  const sq = an.squash;
  const sY = 1 - sq * 0.12, sX = 1 + sq * 0.09;

  const baseY = py + bob + breath;
  const cx = px + 13 + idleShift;
  const footY = py + 40;

  // --- Schatten ---
  c.globalAlpha = 0.36 - sp * 0.08;
  c.fillStyle = '#000';
  c.beginPath();
  c.ellipse(px + 13, footY + 1, (8 + sp * 2) * sX, 3, 0, 0, 6.283);
  c.fill();
  c.globalAlpha = 1;

  // --- Schimmer im Prolog ---
  if (glow) {
    c.globalAlpha = 0.13 + 0.05 * Math.sin(an.breathe * 1.3);
    c.fillStyle = glow;
    c.beginPath(); c.ellipse(px + 13, baseY + 22, 16, 23, 0, 0, 6.283); c.fill();
    c.globalAlpha = 1;
  }

  // Ein Bein zeichnen: Oberschenkel, Knie, Unterschenkel, Stiefel
  function drawLeg(f, hipX, shade, shadeHi) {
    const hipY = baseY + 25 + hipTilt * (hipX > 0 ? 1 : -1) * 0.5;
    const fx = cx + hipX + (side ? f.x * face : f.x * 0.35);
    const fy = footY + f.y;
    // Knie liegt zwischen Hüfte und Fuß, wird beim Anheben nach vorn gedrückt
    const kneeX = (cx + hipX) * 0.45 + fx * 0.55 + (side ? -f.y * 0.35 * face : 0);
    const kneeY = (hipY + fy) / 2 - Math.max(0, -f.y) * 0.3;
    c.strokeStyle = shade; c.lineWidth = 5; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(R(cx + hipX), R(hipY)); c.lineTo(R(kneeX), R(kneeY)); c.stroke();
    c.strokeStyle = shadeHi; c.lineWidth = 4;
    c.beginPath(); c.moveTo(R(kneeX), R(kneeY)); c.lineTo(R(fx), R(fy - 2)); c.stroke();
    // Stiefel
    c.fillStyle = boot;
    c.fillRect(R(fx - 3), R(fy - 3), side ? 7 : 6, 4);
    if (side) c.fillRect(R(fx - 3 + (face > 0 ? 3 : -2)), R(fy - 2), 3, 3);
  }

  // Einen Arm zeichnen: Oberarm, Ellbogen, Unterarm, Hand
  function drawArm(swing, shX, sleeve, skinTone) {
    const shY = baseY + 18 + shoulderTilt * (shX > 0 ? 1 : -1) * 0.4;
    const handX = cx + shX + (side ? swing * face * 1.1 : swing * 0.5);
    const handY = shY + 12 - Math.abs(swing) * 0.25;
    const elbowX = (cx + shX) * 0.5 + handX * 0.5 + (side ? -swing * 0.25 * face : 0);
    const elbowY = shY + 6.5;
    c.strokeStyle = sleeve; c.lineWidth = 4;
    c.beginPath(); c.moveTo(R(cx + shX), R(shY)); c.lineTo(R(elbowX), R(elbowY)); c.stroke();
    c.strokeStyle = skinTone; c.lineWidth = 3;
    c.beginPath(); c.moveTo(R(elbowX), R(elbowY)); c.lineTo(R(handX), R(handY)); c.stroke();
    c.fillStyle = skinTone; c.fillRect(R(handX - 1.5), R(handY - 1), 3, 3);
  }

  const armSwing = -Math.sin(an.phase * Math.PI * 2) * 4.6 * sp;

  // ---- Hinteres Bein und hinterer Arm zuerst (verdeckt) ----
  if (side) {
    drawLeg(fB, -1, '#221f26', '#2e2a33');
    drawArm(-armSwing, -1, shirtDark, skinSh);
  } else {
    drawLeg(fB, 4, pants, pantsHi);
    drawArm(-armSwing, 7, shirtDark, skinSh);
  }

  // ---- Rumpf ----
  const bodyW = R(15 * sX), bodyH = R(12 * sY);
  const bodyX = R(cx - bodyW / 2 + shoulderTilt * 0.3), bodyY = R(baseY + 15);
  c.fillStyle = shirt; c.fillRect(bodyX, bodyY, bodyW, bodyH);
  // Schulterpartie heller
  c.fillStyle = shirtHi; c.fillRect(bodyX + 1, bodyY + 1, bodyW - 2, 5);
  // Seitenschatten
  c.fillStyle = shirtDark;
  c.fillRect(bodyX, bodyY, 2, bodyH);
  c.fillRect(bodyX + bodyW - 2, bodyY, 2, bodyH);
  // Gürtel, schmal und dunkel. Nur die Schnalle setzt einen Akzent.
  c.fillStyle = '#241c14'; c.fillRect(bodyX, bodyY + bodyH - 2, bodyW, 2);
  if (!back) { c.fillStyle = trim; c.fillRect(R(cx - 2), bodyY + bodyH - 2, 4, 2); }

  // Anhänger mit dem leuchtenden Kern (die Signatur)
  if (!back) {
    const pulse = 0.5 + 0.5 * Math.sin(an.breathe * 1.7);
    c.globalAlpha = pulse * 0.32; c.fillStyle = core;
    c.fillRect(R(cx - 3), bodyY + 3, 6, 6);
    c.globalAlpha = pulse; c.fillStyle = core;
    c.fillRect(R(cx - 1), bodyY + 5, 2, 3);
    c.globalAlpha = 1;
  }

  // ---- Vorderes Bein und vorderer Arm ----
  if (side) {
    drawLeg(fA, 1, pants, pantsHi);
    drawArm(armSwing, 1, shirt, skin);
  } else {
    drawLeg(fA, -4, pants, pantsHi);
    drawArm(armSwing, -7, shirt, skin);
  }

  // ---- Hals ----
  c.fillStyle = skinSh; c.fillRect(R(cx - 2), R(baseY + 13), 4, 3);

  // ---- Kopf ----
  // Der Kopf hängt der Bewegung minimal nach, das wirkt lebendig.
  const hx = R(cx - 6 + an.hoodX * 0.8 + an.facing * 1.2);
  const hy = R(baseY + 2 + bob * 0.3);
  // Gesicht
  c.fillStyle = skin; c.fillRect(hx + 1, hy + 3, 11, 10);
  c.fillStyle = skinHi; c.fillRect(hx + 2, hy + 4, 9, 3);
  c.fillStyle = skinSh; c.fillRect(hx + 1, hy + 11, 11, 2);
  // Ohren
  if (!back) {
    c.fillStyle = skinSh;
    if (side) { c.fillRect(R(hx + (face > 0 ? 3 : 8)), hy + 7, 2, 3); }
    else { c.fillRect(hx, hy + 7, 2, 3); c.fillRect(hx + 11, hy + 7, 2, 3); }
  }

  // Haar mit Federbewegung: es schwingt beim Laufen mit
  const hairSway = an.hoodX * 1.6;
  c.fillStyle = hair;
  c.fillRect(hx, hy, 13, 5);                               // Deckhaar
  c.fillRect(hx - 1, hy + 2, 3, 7);                        // Seite links
  c.fillRect(hx + 11, hy + 2, 3, 7);                       // Seite rechts
  c.fillStyle = hairHi; c.fillRect(hx + 2, hy + 1, 8, 2);  // Glanz
  // Hinterkopf-Schopf, folgt verzögert
  c.fillStyle = hair;
  if (side) c.fillRect(R(hx + (face > 0 ? -2 : 12) + hairSway * 0.5), hy + 3, 3, 6);
  else c.fillRect(R(hx + 3 + hairSway), hy - 1, 7, 3);

  if (back) {
    // Rückansicht: nur Hinterkopf, kein Gesicht
    c.fillStyle = hair; c.fillRect(hx + 1, hy + 3, 11, 8);
    c.fillStyle = hairHi; c.fillRect(hx + 3, hy + 4, 7, 2);
  } else if (an.blinking <= 0) {
    // Augen
    c.fillStyle = '#1a1008';
    if (side) {
      c.fillRect(R(hx + (face > 0 ? 8 : 3)), hy + 7, 2, 2);
    } else {
      c.fillRect(hx + 3, hy + 7, 2, 2);
      c.fillRect(hx + 8, hy + 7, 2, 2);
    }
    // Lichtpunkt in den Augen, in der Elementfarbe
    c.globalAlpha = 0.55; c.fillStyle = core;
    if (side) c.fillRect(R(hx + (face > 0 ? 8 : 3)), hy + 7, 1, 1);
    else { c.fillRect(hx + 3, hy + 7, 1, 1); c.fillRect(hx + 8, hy + 7, 1, 1); }
    c.globalAlpha = 1;
  } else {
    // Blinzeln
    c.fillStyle = skinSh;
    if (side) c.fillRect(R(hx + (face > 0 ? 8 : 3)), hy + 8, 2, 1);
    else { c.fillRect(hx + 3, hy + 8, 2, 1); c.fillRect(hx + 8, hy + 8, 2, 1); }
  }

  // Mund, nur in der Frontansicht angedeutet
  if (an.dir === 'down') { c.fillStyle = skinSh; c.fillRect(hx + 5, hy + 10, 3, 1); }
};

// ------------------------------------------------------------
// NPC: menschlich, ruhigere Animation
// ------------------------------------------------------------
G.drawNpc = (c, px, py, p, variant, t, seed) => {
  const R = Math.round;
  const ph = t * 1.1 + (seed || 0) * 2.3;
  const breath = Math.sin(ph) * 0.8;
  const shift = Math.sin(ph * 0.4) * 0.8;
  const skin = '#b0805a', skinSh = '#8a6244';
  const hairs = ['#2e2018', '#4a3524', '#1f1a16', '#5c4632'];
  const shirts = [p.textDim, p.dim, p.card, p.accent];
  const hair = hairs[variant % hairs.length];
  const shirt = shirts[variant % shirts.length];

  c.globalAlpha = 0.32; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(px + 13, py + 41, 8, 3, 0, 0, 6.283); c.fill();
  c.globalAlpha = 1;

  const by = py + breath, cx = px + 13 + shift;
  // Beine
  c.strokeStyle = '#2a262f'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(R(cx - 4), R(by + 27)); c.lineTo(R(cx - 4), R(by + 38)); c.stroke();
  c.beginPath(); c.moveTo(R(cx + 4), R(by + 27)); c.lineTo(R(cx + 4), R(by + 38)); c.stroke();
  c.fillStyle = '#17130f';
  c.fillRect(R(cx - 7), R(by + 37), 6, 4); c.fillRect(R(cx + 1), R(by + 37), 6, 4);
  // Arme
  c.strokeStyle = shirt; c.lineWidth = 4;
  c.beginPath(); c.moveTo(R(cx - 7), R(by + 17)); c.lineTo(R(cx - 8), R(by + 27)); c.stroke();
  c.beginPath(); c.moveTo(R(cx + 7), R(by + 17)); c.lineTo(R(cx + 8), R(by + 27)); c.stroke();
  c.fillStyle = skin;
  c.fillRect(R(cx - 9), R(by + 26), 3, 3); c.fillRect(R(cx + 7), R(by + 26), 3, 3);
  // Rumpf
  c.fillStyle = shirt; c.fillRect(R(cx - 7), R(by + 15), 14, 14);
  c.fillStyle = p.cardLight; c.fillRect(R(cx - 6), R(by + 16), 12, 4);
  // Kopf
  const hx = R(cx - 6), hy = R(by + 3);
  c.fillStyle = skinSh; c.fillRect(R(cx - 2), R(by + 13), 4, 3);
  c.fillStyle = skin; c.fillRect(hx + 1, hy + 3, 11, 10);
  c.fillStyle = hair;
  c.fillRect(hx, hy, 13, 5); c.fillRect(hx - 1, hy + 2, 3, 7); c.fillRect(hx + 11, hy + 2, 3, 7);
  c.fillStyle = '#1a1008'; c.fillRect(hx + 3, hy + 7, 2, 2); c.fillRect(hx + 8, hy + 7, 2, 2);

  // Variante 0 starrt auf einen Bildschirm
  if (variant === 0) {
    const f = 0.4 + 0.35 * Math.sin(t * 9 + (seed || 0));
    c.globalAlpha = f; c.fillStyle = '#8fa8c8';
    c.fillRect(R(cx - 5), R(by + 20), 10, 7);
    c.globalAlpha = f * 0.35; c.fillRect(hx, hy + 2, 13, 10);
    c.globalAlpha = 1;
  }
};

// ------------------------------------------------------------
// Begleiter-Geist
// ------------------------------------------------------------
G.drawSpirit = (c, px, py, p, t, color, trail) => {
  if (trail) {
    for (let i = trail.length - 1; i >= 0; i--) {
      c.globalAlpha = (i / trail.length) * 0.26;
      c.fillStyle = color;
      c.fillRect(Math.round(trail[i].x), Math.round(trail[i].y), 4, 4);
    }
  }
  const x = px + Math.sin(t * 1.9) * 4, y = py + Math.cos(t * 2.6) * 4.6;
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  c.globalAlpha = 0.15 * pulse; c.fillStyle = color;
  c.beginPath(); c.arc(x + 4, y + 4, 13, 0, 6.283); c.fill();
  c.globalAlpha = 0.42 * pulse;
  c.beginPath(); c.arc(x + 4, y + 4, 7, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  c.fillRect(Math.round(x + 1), Math.round(y + 1), 6, 6);
  c.globalAlpha = 0.85; c.fillStyle = '#fff';
  c.fillRect(Math.round(x + 3), Math.round(y + 3), 2, 2);
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// Fragment
// ------------------------------------------------------------
G.drawFragment = (c, px, py, p, t, seed) => {
  const x = px + 20, y = py + 20 + Math.sin(t * 1.6 + (seed || 0)) * 3.5;
  const a = 0.55 + 0.45 * Math.sin(t * 3 + (seed || 0) * 2);
  c.globalAlpha = a * 0.16; c.fillStyle = p.bright;
  c.beginPath(); c.arc(x, y, 20, 0, 6.283); c.fill();
  c.globalAlpha = a * 0.35;
  c.beginPath(); c.arc(x, y, 11, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  const r = t * 1.4 + (seed || 0);
  c.save(); c.translate(x, y); c.rotate(r);
  c.fillStyle = p.bright; c.fillRect(-3, -11, 6, 22); c.fillRect(-11, -3, 22, 6);
  c.fillStyle = p.textBright; c.fillRect(-3, -3, 6, 6);
  c.restore();
};

// ------------------------------------------------------------
// Spiegelschrein
// ------------------------------------------------------------
G.drawShrine = (c, px, py, p, t) => {
  const x = Math.round(px), y = Math.round(py);
  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x + 40, y + 76, 36, 8, 0, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = p.card; c.fillRect(x + 8, y + 40, 64, 36);
  c.fillStyle = p.cardLight; c.fillRect(x + 11, y + 43, 58, 5);
  c.fillStyle = p.bgDeep; c.fillRect(x + 17, y + 52, 46, 20);
  const a = 0.45 + 0.35 * Math.sin(t * 1.8);
  c.globalAlpha = a * 0.28; c.fillStyle = p.main;
  c.beginPath(); c.arc(x + 40, y + 24, 36, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  c.fillStyle = p.bgVoid; c.fillRect(x + 20, y + 4, 40, 40);
  c.fillStyle = p.dim;
  c.fillRect(x + 20, y + 4, 40, 3); c.fillRect(x + 20, y + 41, 40, 3);
  c.fillRect(x + 20, y + 4, 3, 40); c.fillRect(x + 57, y + 4, 3, 40);
  c.globalAlpha = a; c.fillStyle = p.glow; c.fillRect(x + 26, y + 10, 28, 28);
  c.globalAlpha = a * 0.7; c.fillStyle = p.textBright; c.fillRect(x + 33, y + 17, 14, 14);
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// LICHT: Fackeln, Kristalle und Leylinien werfen echtes Licht
// ------------------------------------------------------------
// Wird als weiches Overlay über den Raum gelegt. Die Lichtquellen
// stammen aus den Kacheln selbst, deshalb passt es immer zum Raum.
const LIGHT_TILES = { f: [46, 1.0], c: [40, 0.75], '*': [30, 0.55], M: [26, 0.5], D: [24, 0.4], p: [20, 0.35] };

G.drawLight = (c, room, p, t) => {
  const tiles = G.roomTiles(room);
  const src = [];
  for (let ty = 0; ty < G.ROOM_H; ty++) {
    const row = tiles[ty] || '';
    for (let tx = 0; tx < G.ROOM_W; tx++) {
      const L = LIGHT_TILES[row[tx]];
      if (L) src.push([tx * T + T / 2, ty * T + T / 2, L[0], L[1], noise2(tx, ty)]);
    }
  }
  if (!src.length) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const [x, y, r, i0, n] of src) {
    const flick = i0 * (0.82 + 0.18 * Math.sin(t * 6 + n * 9));
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    const col = p.glow;
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.16 * flick;
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  c.restore();
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// FAUNA: kleine Lebewesen je Habitat, rein dekorativ
// ------------------------------------------------------------
G.newFauna = (biome, seed) => {
  const rng = G.mulberry32(seed >>> 0);
  const kinds = {
    sumpf: { n: 5, art: 'fisch' }, mond: { n: 7, art: 'falter' },
    hain: { n: 8, art: 'gluehwurm' }, kristall: { n: 4, art: 'splitter' },
    unterwelt: { n: 5, art: 'funke' }, wueste: { n: 3, art: 'kaefer' },
    sternen: { n: 6, art: 'stern' }, bibliothek: { n: 4, art: 'blatt' },
    asche: { n: 4, art: 'krahe' },
  };
  const k = kinds[biome] || kinds.asche;
  const out = [];
  for (let i = 0; i < k.n; i++) {
    out.push({
      art: k.art,
      x: rng() * G.W, y: rng() * G.FIELD_H,
      vx: (rng() - 0.5) * 22, vy: (rng() - 0.5) * 18,
      ph: rng() * 6.28, sp: 0.6 + rng() * 0.9,
    });
  }
  return out;
};

G.updateFauna = (fa, dt, t, px, py) => {
  for (const f of fa) {
    if (f.art === 'gluehwurm' || f.art === 'falter' || f.art === 'funke') {
      // Schweben mit Eigenleben, weichen dem Spieler leicht aus
      f.x += (f.vx + Math.sin(t * f.sp + f.ph) * 12) * dt;
      f.y += (f.vy + Math.cos(t * f.sp * 1.3 + f.ph) * 10) * dt;
      const dx = f.x - px, dy = f.y - py, d = Math.hypot(dx, dy);
      if (d < 46 && d > 0.1) { f.x += (dx / d) * 26 * dt; f.y += (dy / d) * 26 * dt; }
    } else if (f.art === 'fisch') {
      f.x += f.vx * dt; f.y += Math.sin(t * 1.4 + f.ph) * 10 * dt;
    } else if (f.art === 'krahe' || f.art === 'blatt') {
      f.x += f.vx * dt * 1.4; f.y += (f.vy * 0.4 + Math.sin(t * 2 + f.ph) * 14) * dt;
    } else {
      f.x += f.vx * dt * 0.6; f.y += f.vy * dt * 0.6;
    }
    // Am Rand umkehren statt verschwinden
    if (f.x < 6) { f.x = 6; f.vx = Math.abs(f.vx); }
    if (f.x > G.W - 6) { f.x = G.W - 6; f.vx = -Math.abs(f.vx); }
    if (f.y < 6) { f.y = 6; f.vy = Math.abs(f.vy); }
    if (f.y > G.FIELD_H - 6) { f.y = G.FIELD_H - 6; f.vy = -Math.abs(f.vy); }
  }
};

G.drawFauna = (c, fa, p, t) => {
  for (const f of fa) {
    const x = Math.round(f.x), y = Math.round(f.y);
    const puls = 0.5 + 0.5 * Math.sin(t * 3 + f.ph);
    if (f.art === 'gluehwurm' || f.art === 'funke') {
      c.globalAlpha = 0.2 * puls; c.fillStyle = p.glow;
      c.beginPath(); c.arc(x, y, 6, 0, 6.283); c.fill();
      c.globalAlpha = 0.7 + 0.3 * puls; c.fillStyle = p.bright;
      c.fillRect(x - 1, y - 1, 2, 2);
    } else if (f.art === 'falter') {
      const w = Math.sin(t * 12 + f.ph) * 3;
      c.globalAlpha = 0.75; c.fillStyle = p.textBright;
      c.fillRect(x - 1, y - 1, 2, 3);
      c.fillStyle = p.text;
      c.fillRect(x - 1 - Math.abs(w), y - 1, Math.abs(w), 2);
      c.fillRect(x + 1, y - 1, Math.abs(w), 2);
    } else if (f.art === 'fisch') {
      c.globalAlpha = 0.4; c.fillStyle = p.main;
      const dir = f.vx > 0 ? 1 : -1;
      c.fillRect(x, y, 5, 2);
      c.fillRect(x - dir * 2, y - 1, 2, 4);
    } else if (f.art === 'krahe') {
      c.globalAlpha = 0.55; c.fillStyle = p.bgVoid;
      const flap = Math.sin(t * 8 + f.ph) * 2;
      c.fillRect(x - 4, y - flap, 4, 1);
      c.fillRect(x + 1, y + flap, 4, 1);
      c.fillRect(x - 1, y, 2, 2);
    } else if (f.art === 'blatt') {
      c.globalAlpha = 0.5; c.fillStyle = p.dim;
      c.save(); c.translate(x, y); c.rotate(t * 1.6 + f.ph);
      c.fillRect(-3, -1, 6, 2); c.restore();
    } else if (f.art === 'stern') {
      c.globalAlpha = 0.3 + 0.6 * puls; c.fillStyle = p.bright;
      c.fillRect(x, y, 2, 2);
      if (puls > 0.85) { c.fillRect(x - 2, y, 6, 1); c.fillRect(x, y - 2, 1, 6); }
    } else if (f.art === 'splitter') {
      c.globalAlpha = 0.35 + 0.4 * puls; c.fillStyle = p.glow;
      c.save(); c.translate(x, y); c.rotate(t + f.ph);
      c.fillRect(-2, -2, 4, 4); c.restore();
    } else {
      c.globalAlpha = 0.5; c.fillStyle = p.dim;
      c.fillRect(x, y, 3, 2);
    }
  }
  c.globalAlpha = 1;
};

// ------------------------------------------------------------
// Inschrift: ein lesbarer Stein, trägt die Story
// ------------------------------------------------------------
G.drawInschrift = (c, px, py, p, t, gelesen) => {
  const x = Math.round(px), y = Math.round(py);
  c.globalAlpha = 0.3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(x + 20, y + 33, 10, 3, 0, 0, 6.283); c.fill();
  c.globalAlpha = 1;
  // Stele
  c.fillStyle = p.bgDeep; c.fillRect(x + 11, y + 8, 18, 25);
  c.fillStyle = p.card; c.fillRect(x + 12, y + 9, 15, 23);
  c.fillStyle = p.cardLight; c.fillRect(x + 13, y + 10, 4, 21);
  c.fillStyle = p.cardHi; c.fillRect(x + 12, y + 8, 15, 2);
  // Eingeritzte Zeilen
  c.fillStyle = p.bgVoid;
  c.fillRect(x + 15, y + 14, 9, 1); c.fillRect(x + 15, y + 18, 7, 1);
  c.fillRect(x + 15, y + 22, 10, 1); c.fillRect(x + 15, y + 26, 6, 1);
  if (!gelesen) {
    const a = 0.35 + 0.35 * Math.sin(t * 2.2);
    c.globalAlpha = a * 0.5; c.fillStyle = p.main;
    c.beginPath(); c.arc(x + 20, y + 20, 17, 0, 6.283); c.fill();
    c.globalAlpha = a; c.fillStyle = p.bright;
    c.fillRect(x + 18, y + 3, 4, 4);
    c.globalAlpha = 1;
  }
};

// ------------------------------------------------------------
// Raum zeichnen
// ------------------------------------------------------------
G.roomTiles = (r) => (r && r.tiles) ? r.tiles : r;
G.roomPal = (r) => (r && r.biome && G.BIOMES[r.biome]) ? G.BIOMES[r.biome] : null;

G.drawRoom = (c, room, p, t) => {
  const tiles = G.roomTiles(room);
  p = G.roomPal(room) || p;
  for (let ty = 0; ty < G.ROOM_H; ty++) {
    const row = tiles[ty] || '';
    for (let tx = 0; tx < G.ROOM_W; tx++) {
      const ch = row[tx] || '.';
      (G.TILES[ch] || G.TILES['.']).draw(c, tx * T, ty * T, p, t, tx, ty);
    }
  }
};

G.isSolid = (room, px, py) => {
  const tiles = G.roomTiles(room);
  const tx = Math.floor(px / T), ty = Math.floor(py / T);
  if (tx < 0 || tx >= G.ROOM_W || ty < 0 || ty >= G.ROOM_H) return false;
  const ch = (tiles[ty] || '')[tx] || '.';
  const tile = G.TILES[ch];
  return tile ? tile.solid : false;
};
