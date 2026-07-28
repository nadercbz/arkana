'use strict';
// ============================================================
// ARKANA Scenes (Hochformat 360x640)
// ============================================================
const TT = 40;

// ------------------------------------------------------------
// Titel
// ------------------------------------------------------------
G.TitleScene = () => {
  let t = 0; let sel = 0;
  const hasSave = !!G.load();
  const opts = hasSave ? ['WEITERSPIELEN', 'NEUES SPIEL'] : ['NEUES SPIEL'];
  const stars = [];
  const rng = G.mulberry32(7);
  for (let i = 0; i < 90; i++) stars.push({ x: rng() * G.W, y: rng() * G.H, s: rng(), sz: rng() > 0.9 ? 2 : 1 });
  return {
    update(dt) {
      t += dt;
      if (G.input.pressed('up') || G.input.pressed('down')) sel = (sel + 1) % opts.length;
      if (G.input.pressed('action')) {
        if (opts[sel] === 'WEITERSPIELEN') {
          G.state = G.load();
          G.pal = G.state.phase === 'arkana' ? G.PAL.amber : G.PAL.gray;
          G.replaceScene(G.OverworldScene());
        } else {
          G.clearSave(); G.state = G.newState(); G.pal = G.PAL.gray;
          G.replaceScene(G.IntroScene());
        }
      }
    },
    draw(c) {
      const p = G.PAL.amber;
      c.fillStyle = p.bgVoid; c.fillRect(0, 0, G.W, G.H);
      for (const s of stars) {
        c.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(t * (0.4 + s.s) + s.x));
        c.fillStyle = p.text; c.fillRect(s.x, s.y, s.sz, s.sz);
      }
      c.globalAlpha = 1;
      // Ring aus Zeichen, dreht sich langsam
      c.save(); c.translate(G.W / 2, G.SAFE_Y + 210); c.rotate(t * 0.08);
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * 6.283;
        c.globalAlpha = 0.16 + 0.14 * Math.sin(t * 1.5 + i);
        c.fillStyle = p.main;
        c.fillRect(Math.cos(a) * 108 - 2, Math.sin(a) * 108 - 2, 4, 4);
      }
      c.restore(); c.globalAlpha = 1;

      const SY = G.SAFE_Y;
      G.textGlow(c, '⚡', G.W / 2, SY + 168, p.main, 34);
      G.textGlow(c, 'ARKANA', G.W / 2, SY + 226, p.bright, 46);
      G.text(c, 'D A S   V E R B O R G E N E   M U S T E R', G.W / 2, SY + 282, p.text, 18, 'center');

      opts.forEach((o, i) => {
        const y = SY + 400 + i * 40;
        const on = i === sel;
        if (on) {
          c.globalAlpha = 0.14 + 0.06 * Math.sin(t * 4);
          c.fillStyle = p.main; c.fillRect(50, y - 8, G.W - 100, 32); c.globalAlpha = 1;
          G.text(c, '▶', 62, y, p.main, 16);
        }
        G.text(c, o, G.W / 2, y, on ? p.textBright : p.textDim, 16, 'center');
      });
      G.text(c, 'Wischen oder Pfeiltasten zum Bewegen', G.W / 2, G.H - 62, p.textDim, 14, 'center');
      G.text(c, 'OK bestätigt · MENÜ öffnet den Codex', G.W / 2, G.H - 44, p.textDim, 14, 'center');
      G.vignette(c, 0.5);
    },
  };
};

// ------------------------------------------------------------
// Intro
// ------------------------------------------------------------
G.IntroScene = () => {
  const pages = [
    'Irgendwann in diesen Jahren.\n\nDie Welt hat sich verändert,\nseit damals.\n\nAlle spüren es.\nNiemand spricht es aus.',
    'Die Straßen sind voller Menschen\nund trotzdem leerer als früher.\n\nAlle schauen auf Bildschirme.\nKeiner schaut auf.',
    'Nur du siehst manchmal\ndieses Flackern.\n\nZahlen, die sich wiederholen.\nEin Muster unter allem.\n\nHeute Nacht ist es stärker\nals je zuvor.',
  ];
  let page = 0; let t = 0; let fade = 0;
  return {
    update(dt) {
      t += dt; fade = Math.min(1, fade + dt * 1.6);
      if (G.input.pressed('action')) {
        page++; fade = 0;
        if (page >= pages.length) G.replaceScene(G.OverworldScene());
      }
    },
    draw(c) {
      const p = G.PAL.gray;
      c.fillStyle = p.bgVoid; c.fillRect(0, 0, G.W, G.H);
      c.globalAlpha = fade;
      const lines = pages[Math.min(page, pages.length - 1)].split('\n');
      const startY = G.H / 2 - lines.length * 13;
      lines.forEach((l, i) => G.text(c, l, G.W / 2, startY + i * 26, p.textBright, 15, 'center'));
      c.globalAlpha = 1;
      if (fade >= 1 && Math.floor(t * 2) % 2 === 0) G.text(c, '[ OK ]', G.W / 2, G.H - 90, p.textDim, 16, 'center');
      G.vignette(c, 0.6);
    },
  };
};

// ------------------------------------------------------------
// Dialog
// ------------------------------------------------------------
G.DialogScene = (lines, onDone) => {
  let li = 0; let chars = 0; let t = 0;
  return {
    translucent: true,
    update(dt) {
      t += dt; chars += dt * 46;
      if (G.input.pressed('action')) {
        if (chars < lines[li].length) chars = lines[li].length;
        else { li++; chars = 0; if (li >= lines.length) { G.popScene(); if (onDone) onDone(); } }
      }
    },
    draw(c) {
      const p = G.pal;
      const BOX_H = 168, BOX_Y = G.H - 230;
      c.fillStyle = p.bgVoid; c.globalAlpha = 0.93;
      c.fillRect(14, BOX_Y, G.W - 28, BOX_H); c.globalAlpha = 1;
      c.strokeStyle = p.dim; c.lineWidth = 2;
      c.strokeRect(15, BOX_Y + 1, G.W - 30, BOX_H - 2);
      c.fillStyle = p.main;
      c.fillRect(14, BOX_Y, 4, BOX_H);
      if (li < lines.length) {
        const shown = lines[li].slice(0, Math.floor(chars));
        const wrapped = G.wrapText(c, shown, G.W - 64, 17);
        wrapped.slice(0, 6).forEach((l, i) => G.text(c, l, 32, BOX_Y + 20 + i * 24, p.textBright, 17));
        if (chars >= lines[li].length && Math.floor(t * 2) % 2 === 0) {
          G.text(c, '▼', G.W - 36, BOX_Y + BOX_H - 26, p.main, 14);
        }
      }
    },
  };
};

// ------------------------------------------------------------
// Persönliche Deutung: verbindet ein Fragment mit der Signatur
// ------------------------------------------------------------
G.deutungFor = (frag) => {
  const s = G.state && G.state.sig;
  const d = G.DEUTUNG && G.DEUTUNG[frag.modul];
  if (!s || !d) return null;
  // Welche Achse gezeigt wird, hängt am Fragment selbst. So bekommt
  // der Spieler über die Sammlung hinweg alle drei Blickwinkel.
  const achsen = ['element', 'zahl', 'phase'];
  const pick = achsen[G.hashStr(frag.id) % 3];
  let kern = '';
  if (pick === 'element') kern = d.element[s.element];
  else if (pick === 'zahl') kern = d.zahl[s.zahl];
  else kern = d.phase[s.saturn.name];
  if (!kern) kern = d.element[s.element] || d.zahl[s.zahl] || '';
  return {
    intro: (d.intro || '').replace(/\{name\}/g, s.name),
    kern,
    achse: pick,
    thema: d.thema || '',
  };
};

// Gesamtbild aus allen gesammelten Fragmenten
G.buildGesamtbild = () => {
  const s = G.state.sig, st = G.state.stats, GB = G.GESAMTBILD;
  const n = G.state.fragmente.length, total = G.FRAGMENTS.length;
  const anteil = total ? n / total : 0;
  const stufe = anteil >= 0.999 ? 'alle' : anteil >= 0.5 ? 'viel' : anteil >= 0.2 ? 'mittel' : 'wenig';
  const haltung = st.geprueft > st.geglaubt * 1.3 ? 'zweifel'
    : st.geglaubt > st.geprueft * 1.3 ? 'glaube' : 'gleichgewicht';
  const seiten = [];
  seiten.push(`${s.name.toUpperCase()}\n${s.sym} ${s.zeichen} · ${s.element} · ${s.planet}\nNamenszahl ${s.zahl} · ${s.gabe.name}\n${s.saturn.name}\n\nFragmente: ${n} von ${total}`);
  seiten.push(GB.eroeffnung[stufe]);
  seiten.push(GB.element[s.element]);
  seiten.push(GB.zahl[s.zahl] || GB.zahl[9]);
  seiten.push(GB.phase[s.saturn.name]);
  seiten.push(GB.haltung[haltung]);
  // Die gesammelten Themen als Spur der eigenen Reise
  const module = [...new Set(G.state.fragmente.map((id) => {
    const f = G.FRAGMENTS.find((x) => x.id === id); return f ? f.modul : null;
  }).filter(Boolean))];
  if (module.length) {
    const themen = module.map((m) => (G.DEUTUNG[m] && G.DEUTUNG[m].thema) || '').filter(Boolean);
    if (themen.length) seiten.push('Deine Spur führte durch:\n\n' + themen.join(', ') + '.');
  }
  seiten.push(GB.schluss);
  return seiten;
};

// ------------------------------------------------------------
// Fragment
// ------------------------------------------------------------
G.FragmentScene = (frag) => {
  let sel = 0; let stage = 0; let t = 0; let appear = 0;
  const deut = G.deutungFor(frag);
  return {
    translucent: true,
    enter() { G.doShake(2, 0.2); },
    update(dt) {
      t += dt; appear = Math.min(1, appear + dt * 3.5);
      if (stage === 0) { if (G.input.pressed('action')) stage = deut ? 1 : 2; }
      else if (stage === 1) { if (G.input.pressed('action')) stage = 2; }
      else {
        if (G.input.pressed('left') || G.input.pressed('right')) sel = 1 - sel;
        if (G.input.pressed('action')) {
          if (sel === 0) G.state.stats.geglaubt++; else G.state.stats.geprueft++;
          G.state.fragmente.push(frag.id);
          for (let i = 0; i < 16; i++) {
            G.spawnParticle({ x: G.W / 2, y: G.H / 2, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90,
              life: 0.8, fade: 0.8, color: G.pal.bright, size: 2 });
          }
          G.save(); G.popScene();
        }
      }
    },
    draw(c) {
      const p = G.pal;
      c.globalAlpha = 0.72 * appear; c.fillStyle = '#000'; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1;
      const h = 400, y0 = (G.H - h) / 2;
      c.globalAlpha = appear;
      c.fillStyle = p.bgVoid; c.fillRect(24, y0, G.W - 48, h);
      c.strokeStyle = p.main; c.lineWidth = 2; c.strokeRect(25, y0 + 1, G.W - 50, h - 2);
      // Ecken
      c.fillStyle = p.bright;
      [[26, y0 + 2], [G.W - 40, y0 + 2], [26, y0 + h - 16], [G.W - 40, y0 + h - 16]].forEach(([bx, by]) => {
        c.fillRect(bx, by, 14, 3); c.fillRect(bx, by, 3, 14);
      });
      G.textGlow(c, '✦', G.W / 2, y0 + 24, p.main, 26);
      if (stage <= 0) {
        G.text(c, 'WISSENSFRAGMENT', G.W / 2, y0 + 60, p.main, 15, 'center');
        const tl = G.wrapText(c, frag.titel, G.W - 80, 19);
        tl.slice(0, 2).forEach((l, i) => G.text(c, l, G.W / 2, y0 + 84 + i * 20, p.textBright, 16, 'center'));
        const wrapped = G.wrapText(c, frag.text, G.W - 76, 16);
        wrapped.slice(0, 11).forEach((l, i) => G.text(c, l, 38, y0 + 132 + i * 19, p.text, 16));
      } else {
        // Der persönliche Teil: was das Thema über den Spieler sagt
        const label = { element: 'DEIN ELEMENT', zahl: 'DEINE ZAHL', phase: 'DEINE PHASE' }[deut.achse];
        G.text(c, label, G.W / 2, y0 + 60, p.main, 15, 'center');
        const s2 = G.state.sig;
        const sub = { element: `${s2.element} · ${s2.sym} ${s2.zeichen}`, zahl: `${s2.zahl} · ${s2.gabe.name}`, phase: s2.saturn.name }[deut.achse];
        G.text(c, sub, G.W / 2, y0 + 84, p.textBright, 17, 'center');
        let yy = y0 + 122;
        G.wrapText(c, deut.intro, G.W - 76, 15).slice(0, 4).forEach((l) => { G.text(c, l, 38, yy, p.textDim, 15); yy += 19; });
        yy += 10;
        c.fillStyle = p.main; c.globalAlpha = 0.5 * appear; c.fillRect(38, yy - 6, G.W - 76, 1); c.globalAlpha = appear;
        yy += 8;
        G.wrapText(c, deut.kern, G.W - 76, 17).slice(0, 7).forEach((l) => { G.text(c, l, 38, yy, p.textBright, 17); yy += 22; });
      }
      if (stage <= 1) {
        if (Math.floor(t * 2) % 2 === 0) G.text(c, '[ OK ]', G.W / 2, y0 + h - 40, p.textDim, 16, 'center');
      } else {
        G.text(c, 'Wie gehst du damit um?', G.W / 2, y0 + h - 78, p.textBright, 19, 'center');
        const bw = 118;
        [['GLAUBEN', G.W / 2 - 66], ['PRÜFEN', G.W / 2 + 66]].forEach(([label, bx], i) => {
          const on = sel === i;
          if (on) { c.fillStyle = p.main; c.globalAlpha = 0.2; c.fillRect(bx - bw / 2, y0 + h - 52, bw, 30); c.globalAlpha = appear; }
          c.strokeStyle = on ? p.main : p.textDim; c.lineWidth = on ? 2 : 1;
          c.strokeRect(bx - bw / 2, y0 + h - 52, bw, 30);
          G.text(c, label, bx, y0 + h - 44, on ? p.textBright : p.textDim, 14, 'center');
        });
      }
      c.globalAlpha = 1;
    },
  };
};

// ------------------------------------------------------------
// Codex
// ------------------------------------------------------------
G.CodexScene = () => {
  let sel = 0; let reading = null; let tab = 0;
  const list = () => G.state.fragmente.map((id) => G.FRAGMENTS.find((f) => f.id === id)).filter(Boolean);
  return {
    translucent: true,
    update() {
      const items = list();
      if (reading) { if (G.input.pressed('action') || G.input.pressed('cancel')) reading = null; return; }
      if (G.input.pressed('cancel')) { G.popScene(); return; }
      if (G.input.pressed('up')) sel = Math.max(0, sel - 1);
      if (G.input.pressed('down')) sel = Math.min(Math.max(items.length - 1, 0), sel + 1);
      if ((G.input.pressed('left') || G.input.pressed('right')) && G.state.sig) tab = 1 - tab;
      if (G.input.pressed('action') && items.length && tab === 0) reading = items[sel];
    },
    draw(c) {
      const p = G.pal; const s = G.state.sig;
      c.globalAlpha = 0.9; c.fillStyle = p.bgVoid; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1;
      c.strokeStyle = p.dim; c.lineWidth = 2; c.strokeRect(13, 13, G.W - 26, G.H - 26);

      if (reading) {
        G.text(c, '✦', 30, G.SAFE_Y + 30, p.main, 18);
        const tl = G.wrapText(c, reading.titel, G.W - 80, 19);
        tl.slice(0, 2).forEach((l, i) => G.text(c, l, G.W / 2, G.SAFE_Y + 34 + i * 20, p.main, 16, 'center'));
        const wrapped = G.wrapText(c, reading.text, G.W - 70, 17);
        wrapped.slice(0, Math.floor((G.H - 200) / 22)).forEach((l, i) => G.text(c, l, 35, G.SAFE_Y + 100 + i * 22, p.text, 17));
        G.text(c, reading.modul.replace(/_/g, ' '), G.W / 2, G.H - 70, p.textDim, 14, 'center');
        G.text(c, '[ OK ] zurück', G.W / 2, G.H - 46, p.textDim, 15, 'center');
        return;
      }

      G.textGlow(c, '⚡ CODEX', G.W / 2, G.SAFE_Y + 30, p.main, 20);
      // Reiter
      ['FRAGMENTE', 'SIGNATUR'].forEach((label, i) => {
        const bx = 30 + i * 152, ty = G.SAFE_Y + 62;
        const on = tab === i;
        if (on) { c.fillStyle = p.main; c.globalAlpha = 0.2; c.fillRect(bx, ty, 144, 26); c.globalAlpha = 1; }
        c.strokeStyle = on ? p.main : p.textDim; c.lineWidth = 1; c.strokeRect(bx, ty, 144, 26);
        G.text(c, label, bx + 72, ty + 6, on ? p.textBright : p.textDim, 15, 'center');
      });

      if (tab === 1 && s) {
        const rows = [
          ['Name', s.name], ['Zeichen', `${s.sym} ${s.zeichen}`], ['Element', s.element],
          ['Herrscher', s.planet], ['Namenszahl', `${s.zahl} · ${s.gabe.name}`],
          ['Lebensphase', s.saturn.name], ['Begleiter', s.spirit.name],
          ['Licht', s.licht], ['Schatten', s.schatten],
        ];
        rows.forEach(([k, v], i) => {
          const y = G.SAFE_Y + 112 + i * 34;
          G.text(c, k.toUpperCase(), 34, y, p.textDim, 11);
          G.text(c, String(v), G.W - 34, y + 12, p.textBright, 15, 'right');
          c.fillStyle = p.card; c.fillRect(34, y + 30, G.W - 68, 1);
        });
        G.text(c, `Geglaubt ${G.state.stats.geglaubt} · Geprüft ${G.state.stats.geprueft}`, G.W / 2, G.H - 74, p.text, 18, 'center');
      } else {
        const items = list();
        G.text(c, `${items.length} von ${G.FRAGMENTS.length} Fragmenten`, G.W / 2, G.SAFE_Y + 100, p.text, 19, 'center');
        if (!items.length) {
          G.text(c, 'Noch nichts gesammelt.', G.W / 2, G.H / 2 - 20, p.textDim, 14, 'center');
        } else {
          const per = Math.max(8, Math.floor((G.H - 260) / 36)); const start = Math.max(0, Math.min(sel - 5, items.length - per));
          items.slice(start, start + per).forEach((f, i) => {
            const idx = start + i, y = G.SAFE_Y + 132 + i * 36;
            const on = idx === sel;
            if (on) { c.fillStyle = p.main; c.globalAlpha = 0.14; c.fillRect(26, y - 6, G.W - 52, 32); c.globalAlpha = 1; G.text(c, '▶', 32, y + 2, p.main, 13); }
            const short = f.titel.length > 26 ? f.titel.slice(0, 25) + '…' : f.titel;
            G.text(c, short, 50, y, on ? p.textBright : p.text, 14);
            G.text(c, f.modul.slice(0, 2), G.W - 34, y + 3, p.textDim, 10, 'right');
          });
        }
      }
      G.text(c, `[◀▶] Reiter   [MENÜ] schließen`, G.W / 2, G.H - 46, p.textDim, 14, 'center');
    },
  };
};

// ------------------------------------------------------------
// Spiegellesung
// ------------------------------------------------------------
G.buildReading = () => {
  const s = G.state.sig; const st = G.state.stats;
  const lines = [];
  lines.push(`Ich sehe dich, ${s.name}. Geboren im Zeichen ${s.zeichen}, unter der Führung von ${s.planet}.`);
  lines.push(`Deine Namenszahl ist die ${s.zahl}. ${s.gabe.text}`);
  lines.push(`${s.saturn.name}. ${s.saturn.text}`);
  if (st.geglaubt + st.geprueft > 0) {
    if (st.geprueft > st.geglaubt) lines.push('Du prüfst mehr, als du glaubst. Das schützt dich vor Täuschung. Pass auf, dass es dich nicht vor Wundern schützt.');
    else if (st.geglaubt > st.geprueft) lines.push('Du glaubst mehr, als du prüfst. Das öffnet dir Türen. Pass auf, wer sie gebaut hat.');
    else lines.push('Du hältst Glauben und Zweifel im Gleichgewicht. Das ist selten. Das ist der dritte Weg.');
  }
  lines.push(`Dein Licht ist ${s.licht}. Dein Schatten heißt ${s.schatten}. Beide gehören dir.`);
  lines.push('Geh weiter, Suchender. Das Muster ist noch nicht fertig mit dir.');
  lines.push('(Ende von Kapitel 1. Die Reise geht weiter.)');
  return lines;
};


// ------------------------------------------------------------
// Spiegelschrein: das Gesamtbild über die eigene Person
// ------------------------------------------------------------
G.SpiegelScene = () => {
  const seiten = G.buildGesamtbild();
  let i = 0, t = 0, fade = 0;
  return {
    translucent: true,
    enter() { G.doShake(3, 0.5); },
    update(dt) {
      t += dt; fade = Math.min(1, fade + dt * 2.2);
      if (G.input.pressed('action')) {
        i++; fade = 0;
        if (i >= seiten.length) { G.save(); G.popScene(); }
      }
      if (G.input.pressed('cancel')) { G.save(); G.popScene(); }
      if (Math.random() < 0.25) {
        G.spawnParticle({ x: Math.random() * G.W, y: G.H, vx: (Math.random() - 0.5) * 12,
          vy: -18 - Math.random() * 22, life: 5, fade: 2, color: G.pal.glow, size: 2, alpha: 0.4 });
      }
    },
    draw(c) {
      const p = G.pal;
      c.globalAlpha = 0.9; c.fillStyle = '#000'; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1;
      G.drawParticles(c);
      c.strokeStyle = p.dim; c.lineWidth = 2; c.strokeRect(16, 16, G.W - 32, G.H - 32);
      c.fillStyle = p.main;
      [[18, 18], [G.W - 44, 18], [18, G.H - 44], [G.W - 44, G.H - 44]].forEach(([bx, by]) => {
        c.fillRect(bx, by, 26, 3); c.fillRect(bx, by, 3, 26);
      });
      G.textGlow(c, '◈', G.W / 2, G.SAFE_Y + 44, p.main, 24);
      G.text(c, 'DER SPIEGEL', G.W / 2, G.SAFE_Y + 78, p.main, 15, 'center');

      c.globalAlpha = fade;
      const txt = seiten[Math.min(i, seiten.length - 1)];
      const blocks = txt.split('\n');
      let y = G.SAFE_Y + 150;
      for (const b of blocks) {
        if (!b.trim()) { y += 14; continue; }
        const big = i === 0 && b === blocks[0];
        const lines = G.wrapText(c, b, G.W - 84, big ? 24 : 17);
        for (const l of lines) {
          G.text(c, l, G.W / 2, y, big ? p.bright : p.textBright, big ? 24 : 17, 'center');
          y += big ? 32 : 25;
        }
      }
      c.globalAlpha = 1;

      // Fortschrittsanzeige
      const n = G.state.fragmente.length, tot = G.FRAGMENTS.length;
      const bw = G.W - 100, bx = 50, by = G.H - 84;
      c.fillStyle = p.card; c.fillRect(bx, by, bw, 5);
      c.fillStyle = p.main; c.fillRect(bx, by, Math.round(bw * (n / tot)), 5);
      G.text(c, `${n} von ${tot} Fragmenten`, G.W / 2, by + 12, p.textDim, 13, 'center');
      if (fade >= 1 && Math.floor(t * 2) % 2 === 0) {
        G.text(c, i < seiten.length - 1 ? '[ OK ]' : '[ OK ] schließen', G.W / 2, G.H - 48, p.textDim, 14, 'center');
      }
    },
  };
};

// ------------------------------------------------------------
// Inschrift lesen: trägt die Story
// ------------------------------------------------------------
G.InschriftScene = (ins) => {
  let t = 0, chars = 0;
  return {
    translucent: true,
    update(dt) {
      t += dt; chars += dt * 52;
      if (G.input.pressed('action') || G.input.pressed('cancel')) {
        if (chars < ins.text.length) chars = ins.text.length;
        else G.popScene();
      }
    },
    draw(c) {
      const p = G.pal;
      c.globalAlpha = 0.82; c.fillStyle = '#000'; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1;
      const h = 300, y0 = (G.H - h) / 2;
      c.fillStyle = p.bgVoid; c.fillRect(28, y0, G.W - 56, h);
      c.strokeStyle = p.dim; c.lineWidth = 2; c.strokeRect(29, y0 + 1, G.W - 58, h - 2);
      // Eingeritzte Ecken
      c.fillStyle = p.dim;
      c.fillRect(34, y0 + 6, 18, 2); c.fillRect(34, y0 + 6, 2, 18);
      c.fillRect(G.W - 52, y0 + h - 24, 18, 2); c.fillRect(G.W - 36, y0 + h - 24, 2, 18);

      G.text(c, '⌖ INSCHRIFT', G.W / 2, y0 + 26, p.textDim, 13, 'center');
      const tl = G.wrapText(c, ins.titel, G.W - 90, 18);
      tl.slice(0, 2).forEach((l, i) => G.text(c, l, G.W / 2, y0 + 52 + i * 22, p.main, 18, 'center'));
      const shown = ins.text.slice(0, Math.floor(chars));
      const wrapped = G.wrapText(c, shown, G.W - 84, 17);
      wrapped.slice(0, 8).forEach((l, i) => G.text(c, l, 42, y0 + 112 + i * 24, p.textBright, 17));
      if (chars >= ins.text.length && Math.floor(t * 2) % 2 === 0) {
        G.text(c, '[ OK ]', G.W / 2, y0 + h - 34, p.textDim, 14, 'center');
      }
    },
  };
};

// ------------------------------------------------------------
// Ortsname beim ersten Betreten, mit Ankunftstext
// ------------------------------------------------------------
G.OrtScene = (ort, text) => {
  let t = 0;
  return {
    translucent: true,
    update(dt) {
      t += dt;
      if (t > 4.5 || G.input.pressed('action') || G.input.pressed('cancel')) G.popScene();
    },
    draw(c) {
      const p = G.pal;
      const fade = t < 0.5 ? t / 0.5 : (t > 3.8 ? Math.max(0, (4.5 - t) / 0.7) : 1);
      c.globalAlpha = fade * 0.72; c.fillStyle = '#000';
      c.fillRect(0, G.FIELD_H / 2 - 92, G.W, 184);
      c.globalAlpha = fade;
      c.fillStyle = p.main;
      c.fillRect(40, G.FIELD_H / 2 - 92, G.W - 80, 2);
      c.fillRect(40, G.FIELD_H / 2 + 90, G.W - 80, 2);
      G.textGlow(c, ort.toUpperCase(), G.W / 2, G.FIELD_H / 2 - 72, p.bright, 21);
      const wrapped = G.wrapText(c, text, G.W - 76, 16);
      wrapped.slice(0, 5).forEach((l, i) => G.text(c, l, G.W / 2, G.FIELD_H / 2 - 32 + i * 24, p.text, 16, 'center'));
      c.globalAlpha = 1;
    },
  };
};

// ------------------------------------------------------------
// Oberwelt
// ------------------------------------------------------------
G.OverworldScene = () => {
  let t = 0;
  let transition = null;
  const anim = G.newAnim();
  let vx = 0, vy = 0;               // echte Geschwindigkeit, wird weich geführt
  const spiritPos = { x: 0, y: 0 };
  const spiritTrail = [];
  let ambientTimer = 0;
  let fauna = [];
  let faunaRoom = null;

  function ensureFauna() {
    if (faunaRoom === G.state.room) return;
    const r = room();
    fauna = G.newFauna((r && r.biome) || 'asche', G.hashStr(G.state.room + (r ? r.biome : '')));
    faunaRoom = G.state.room;
  }

  const area = () => G.MAPS[G.state.area];
  const room = () => area().rooms[G.state.room];

  function ensureFragments() {
    // Fragmente aus einem alten Spielstand koennen auf IDs zeigen, die es
    // nach einem Neubau der Knowledge Base nicht mehr gibt. Die fliegen raus.
    if (G.state.fragMap) {
      for (const rm in G.state.fragMap) {
        G.state.fragMap[rm] = G.state.fragMap[rm].filter(
          (e) => e && G.FRAGMENTS.some((f) => f.id === e.id));
      }
    }
    if (G.state.area !== 'asche' || G.state.fragMap || !G.state.sig) return;
    const rng = G.mulberry32(G.state.sig.seed);
    const pool = [...G.FRAGMENTS];
    const map = {};
    for (const [rm, spots] of Object.entries(area().fragSpots || {})) {
      map[rm] = spots.map(([tx, ty]) => {
        const i = Math.floor(rng() * pool.length);
        const f = pool.splice(i, 1)[0];
        return f ? { x: tx * TT, y: ty * TT, id: f.id } : null;
      }).filter(Boolean);
    }
    G.state.fragMap = map;
  }

  // Kollision nur ueber die Fussflaeche, damit Kopf und Schultern
  // vor Waenden liegen duerfen. Figur ist 26 breit, 42 hoch.
  function canStand(nx, ny) {
    const r = room();
    const pts = [[nx + 7, ny + 30], [nx + 19, ny + 30], [nx + 7, ny + 39], [nx + 19, ny + 39]];
    for (const [px, py] of pts) if (G.isSolid(r, px, py)) return false;
    return true;
  }

  // Wechselt nur, wenn der Zielraum an dieser Seite auch wirklich einen
  // Durchgang hat. Sonst laeuft man in eine Wand und steckt fest.
  function roomShift(dx, dy) {
    const [rx, ry] = G.state.room.split(',').map(Number);
    const key = `${rx + dx},${ry + dy}`;
    const dest = area().rooms[key];
    if (!dest) return false;
    const probe = { px: G.state.px, py: G.state.py };
    if (dx === 1) { probe.px = TT + 6; probe.py = clampVal(probe.py, 'y'); }
    else if (dx === -1) { probe.px = G.W - TT - 26; probe.py = clampVal(probe.py, 'y'); }
    else if (dy === 1) { probe.py = TT + 2; probe.px = clampVal(probe.px, 'x'); }
    else { probe.py = G.FIELD_H - TT - 44; probe.px = clampVal(probe.px, 'x'); }
    const pts = [[probe.px + 7, probe.py + 30], [probe.px + 19, probe.py + 30],
                 [probe.px + 7, probe.py + 39], [probe.px + 19, probe.py + 39]];
    if (pts.some(([x, y]) => G.isSolid(dest, x, y))) return false;
    transition = { dx, dy, prog: 0, from: G.state.room, to: key };
    return true;
  }

  // Klemmt einen Wert in den Durchgang der jeweiligen Kantenmitte.
  function clampVal(v, axis) {
    const mid = axis === 'y' ? Math.floor(G.ROOM_H / 2) : Math.floor(G.ROOM_W / 2);
    const lo = (mid - 1) * TT + 2;
    const hi = (mid + 1) * TT + TT - (axis === 'y' ? 30 : 28);
    return Math.max(lo, Math.min(hi, v));
  }
  function clampCross(axis) {
    if (axis === 'y') G.state.py = clampVal(G.state.py, 'y');
    else G.state.px = clampVal(G.state.px, 'x');
  }

  // Sicherheitsnetz: steht die Figur trotzdem in einer Wand, suche
  // spiralfoermig den naechsten begehbaren Punkt. Damit kann man
  // grundsaetzlich nicht mehr feststecken.
  function rescueIfStuck() {
    if (canStand(G.state.px, G.state.py)) return;
    for (let r = 4; r <= 140; r += 4) {
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * 6.283;
        const nx = G.state.px + Math.cos(ang) * r;
        const ny = G.state.py + Math.sin(ang) * r;
        if (nx < 0 || ny < 0 || nx > G.W - 26 || ny > G.FIELD_H - 42) continue;
        if (canStand(nx, ny)) { G.state.px = nx; G.state.py = ny; return; }
      }
    }
  }

  // Position eines NPC oder Schreins aus den generierten Plätzen holen
  function spotOf(list, idx) {
    const arr = (list || {})[G.state.room];
    if (!arr || !arr[idx || 0]) return null;
    return arr[idx || 0];
  }

  function nearest() {
    const px = G.state.px + 13, py = G.state.py + 32;
    for (const n of (area().npcs || {})[G.state.room] || []) {
      const sp = n.spot !== undefined ? spotOf(area().npcSpots, n.spot) : [n.x, n.y];
      if (!sp) continue;
      if (Math.hypot(px - (sp[0] * TT + 13), py - (sp[1] * TT + 32)) < 52) return { type: 'npc', npc: n };
    }
    // Inschriften tragen die Story
    const insch = (area().inschriftSpots || {})[G.state.room] || [];
    for (let i = 0; i < insch.length; i++) {
      const [tx, ty] = insch[i];
      if (Math.hypot(px - (tx * TT + 20), py - (ty * TT + 24)) < 46) return { type: 'inschrift', idx: i };
    }
    for (const f of (G.state.fragMap || {})[G.state.room] || []) {
      if (G.state.fragmente.includes(f.id)) continue;
      if (Math.hypot(px - (f.x + 20), py - (f.y + 20)) < 46) return { type: 'frag', frag: f };
    }
    const shDef = (area().shrines || {})[G.state.room];
    if (shDef) {
      const sp = spotOf(area().npcSpots, 0);
      const sx = sp ? sp[0] * TT : 3 * TT, sy = sp ? sp[1] * TT : 3 * TT;
      if (Math.hypot(px - (sx + 20), py - (sy + 24)) < 78) return { type: 'shrine' };
    }
    const tx = Math.floor(px / TT), ty = Math.floor(py / TT);
    for (const tr of (area().triggers || {})[G.state.room] || []) {
      if (tx >= tr.x1 - 1 && tx <= tr.x2 + 1 && ty >= tr.y1 - 1 && ty <= tr.y2 + 1) return { type: 'trigger', trigger: tr };
    }
    return null;
  }

  return {
    enter() {
      ensureFragments();
      ensureFauna();
      spiritPos.x = G.state.px - 24; spiritPos.y = G.state.py - 2;
    },
    update(dt) {
      t += dt;

      // Ambient-Partikel
      ambientTimer -= dt;
      if (ambientTimer <= 0) {
        ambientTimer = 0.09;
        const r0 = room();
        const bio = (r0 && r0.biome) || area().ambient;
        if (bio === 'sumpf') {
          G.spawnParticle({ x: Math.random() * G.W, y: G.FIELD_H + 4, vx: (Math.random()-0.5)*6, vy: -10 - Math.random()*14,
            life: 9, fade: 2.5, color: '#4fbf7f', size: 2, alpha: 0.28, drift: 1.4 });
        } else if (bio === 'kristall') {
          G.spawnParticle({ x: Math.random() * G.W, y: Math.random() * G.FIELD_H, vx: 0, vy: -6 - Math.random()*8,
            life: 4, fade: 1.6, color: '#c4baff', size: 2, alpha: 0.5 });
        } else if (bio === 'wueste') {
          G.spawnParticle({ x: -4, y: Math.random() * G.FIELD_H, vx: 70 + Math.random()*60, vy: 6,
            life: 5, fade: 1.2, color: '#e8b040', size: 1, alpha: 0.35 });
        } else if (bio === 'unterwelt') {
          G.spawnParticle({ x: Math.random() * G.W, y: G.FIELD_H + 4, vx: (Math.random()-0.5)*14, vy: -26 - Math.random()*20,
            life: 3.5, fade: 1.4, color: '#f5705a', size: 2, alpha: 0.6, drift: 2.2 });
        } else if (bio === 'sternen') {
          G.spawnParticle({ x: Math.random() * G.W, y: Math.random() * G.FIELD_H * 0.5, vx: 0, vy: 3,
            life: 6, fade: 2, color: '#b4dcff', size: 1, alpha: 0.7 });
        } else if (bio === 'mond') {
          G.spawnParticle({ x: Math.random() * G.W, y: -4, vx: (Math.random()-0.5)*10, vy: 9 + Math.random()*10,
            life: 8, fade: 2.4, color: '#dce6f5', size: 1, alpha: 0.4, drift: 1.8 });
        } else if (bio === 'hain') {
          G.spawnParticle({ x: Math.random() * G.W, y: -4, vx: (Math.random()-0.5)*18, vy: 14 + Math.random()*12,
            life: 7, fade: 2, color: '#bce870', size: 2, alpha: 0.35, drift: 2.6 });
        } else if (bio === 'bibliothek') {
          G.spawnParticle({ x: Math.random() * G.W, y: -4, vx: (Math.random()-0.5)*8, vy: 11 + Math.random()*9,
            life: 8, fade: 2.2, color: '#d99a4a', size: 1, alpha: 0.32, drift: 1.5 });
        } else if (bio === 'asche') {
          G.spawnParticle({ x: Math.random() * G.W, y: -4, vx: (Math.random() - 0.5) * 8, vy: 12 + Math.random() * 16,
            life: 8, fade: 2, color: G.PAL.amber.dim, size: 1, alpha: 0.5, drift: 2 });
        } else if (amb === 'regen') {
          G.spawnParticle({ x: Math.random() * G.W, y: -4, vx: -8, vy: 220 + Math.random() * 90,
            life: 2.6, fade: 1, color: '#48505c', size: 1, alpha: 0.45 });
        }
      }

      if (transition) {
        transition.prog += dt * 2.6;
        if (transition.prog >= 1) {
          const dx = transition.dx, dy = transition.dy;
          G.state.room = transition.to;
          // Sicher INNERHALB des Raums absetzen, nicht in der Randkachel.
          // Die Querachse wird in den Durchgang geklemmt, sonst bleibt
          // die Figur an der Ecke des Durchgangs haengen.
          if (dx === 1) { G.state.px = TT + 6; clampCross('y'); }
          if (dx === -1) { G.state.px = G.W - TT - 26; clampCross('y'); }
          if (dy === 1) { G.state.py = TT + 2; clampCross('x'); }
          if (dy === -1) { G.state.py = G.FIELD_H - TT - 44; clampCross('x'); }
          rescueIfStuck();
          vx = 0; vy = 0;          // Restgeschwindigkeit verwerfen
          transition = null; G.save();
          // Beim ersten Betreten den Ankunftstext zeigen
          const st = G.STORY && G.STORY[G.state.room];
          const key = 'ank:' + G.state.room;
          if (st && st.ankunft && !G.state.gelesen[key]) {
            G.state.gelesen[key] = 1; G.save();
            G.pushScene(G.OrtScene(st.ort || (room() && room().name) || '', st.ankunft));
          }
        }
        G.updateAnim(anim, dt, 0, 0, false);
        return;
      }

      // --- Bewegung mit Beschleunigung, das macht sie organisch ---
      const d = G.input.dir();
      const MAX = 108, ACC = 900, FRIC = 780;
      const tvx = d.x * MAX, tvy = d.y * MAX;
      const moving = Math.abs(d.x) > 0.01 || Math.abs(d.y) > 0.01;
      if (moving) {
        vx += Math.sign(tvx - vx) * Math.min(Math.abs(tvx - vx), ACC * dt);
        vy += Math.sign(tvy - vy) * Math.min(Math.abs(tvy - vy), ACC * dt);
      } else {
        const s = Math.hypot(vx, vy);
        if (s > 0) { const dec = Math.min(s, FRIC * dt); vx -= (vx / s) * dec; vy -= (vy / s) * dec; }
      }

      const nx = G.state.px + vx * dt, ny = G.state.py + vy * dt;
      // Steht die Figur bereits in einer Wand, Bewegung ungeprueft zulassen,
      // damit sie sich immer herausschieben kann.
      const trapped = !canStand(G.state.px, G.state.py);
      if (trapped) { G.state.px = nx; G.state.py = ny; }
      else {
        if (canStand(nx, G.state.py)) G.state.px = nx; else vx *= 0.2;
        if (canStand(G.state.px, ny)) G.state.py = ny; else vy *= 0.2;
      }

      ensureFauna();
      G.updateFauna(fauna, dt, t, G.state.px + 13, G.state.py + 26);
      const stepped = G.updateAnim(anim, dt, vx, vy, moving);
      if (stepped) {
        G.state.stats.schritte++;
        // Staub beim Aufsetzen
        for (let i = 0; i < 2; i++) {
          G.spawnParticle({ x: G.state.px + 9 + Math.random() * 8, y: G.state.py + 38,
            vx: (Math.random() - 0.5) * 26, vy: -8 - Math.random() * 12,
            life: 0.45, fade: 0.45, grav: 60, color: G.pal.dim, size: 1, alpha: 0.6 });
        }
      }

      // Begleiter folgt weich
      if (G.state.phase === 'arkana') {
        const tx = G.state.px - 26 - anim.facing * 8, ty = G.state.py - 4;
        spiritPos.x += (tx - spiritPos.x) * Math.min(1, dt * 3.4);
        spiritPos.y += (ty - spiritPos.y) * Math.min(1, dt * 3.0);
        if (Math.floor(t * 20) % 2 === 0) {
          spiritTrail.push({ x: spiritPos.x + 3, y: spiritPos.y + 3 });
          if (spiritTrail.length > 10) spiritTrail.shift();
        }
      }

      // Raumwechsel
      if (G.state.px < -8) { if (!roomShift(-1, 0)) { G.state.px = -8; vx = 0; } }
      if (G.state.px > G.W - 18) { if (!roomShift(1, 0)) { G.state.px = G.W - 18; vx = 0; } }
      if (G.state.py < -14) { if (!roomShift(0, -1)) { G.state.py = -14; vy = 0; } }
      if (G.state.py > G.FIELD_H - 34) { if (!roomShift(0, 1)) { G.state.py = G.FIELD_H - 34; vy = 0; } }

      if (G.input.pressed('action')) {
        const it = nearest();
        if (it) {
          if (it.type === 'npc') { G.state.stats.dialoge++; G.pushScene(G.DialogScene(G.DIALOGE[it.npc.dlg] || ['...'])); }
          else if (it.type === 'inschrift') {
            const st = G.STORY && G.STORY[G.state.room];
            const ins = st && st.inschriften && st.inschriften[it.idx % st.inschriften.length];
            const key = G.state.room + ':' + it.idx;
            if (!G.state.gelesen[key]) { G.state.gelesen[key] = 1; G.state.stats.inschriften = (G.state.stats.inschriften || 0) + 1; G.save(); }
            G.pushScene(G.InschriftScene(ins || { titel: 'Verwitterter Stein', text: 'Die Zeichen sind nicht mehr zu lesen.' }));
          }
          else if (it.type === 'frag') { const f = G.FRAGMENTS.find((x) => x.id === it.frag.id); if (f) G.pushScene(G.FragmentScene(f)); }
          else if (it.type === 'shrine') { G.pushScene(G.SpiegelScene()); }
          else if (it.type === 'trigger' && it.trigger.event === 'laden') { G.replaceScene(G.TerminalScene()); }
        }
      }
      else if (G.input.pressed('cancel')) G.pushScene(G.CodexScene());
    },

    draw(c) {
      // Die Palette kommt aus dem Biom des aktuellen Raums
      const rp = G.roomPal(room());
      const p = rp || G.pal;
      c.fillStyle = p.bgDeep; c.fillRect(0, 0, G.W, G.FIELD_H);

      if (transition) {
        const pr = transition.prog < 0.5
          ? 2 * transition.prog * transition.prog
          : 1 - Math.pow(-2 * transition.prog + 2, 2) / 2; // ease in out
        const ox = -transition.dx * G.W * pr, oy = -transition.dy * G.FIELD_H * pr;
        c.save();
        c.beginPath(); c.rect(0, 0, G.W, G.FIELD_H); c.clip();
        c.translate(Math.round(ox), Math.round(oy));
        G.drawRoom(c, area().rooms[transition.from], p, t);
        c.translate(Math.round(transition.dx * G.W), Math.round(transition.dy * G.FIELD_H));
        G.drawRoom(c, area().rooms[transition.to], p, t);
        c.restore();
      } else {
        c.save();
        c.beginPath(); c.rect(0, 0, G.W, G.FIELD_H); c.clip();
        G.drawRoom(c, room(), p, t);

        // Fragmente
        (G.state.fragMap || {})[G.state.room]?.forEach((f, i) => {
          if (!G.state.fragmente.includes(f.id)) G.drawFragment(c, f.x, f.y, p, t, i * 1.7);
        });
        // Schrein
        if ((area().shrines || {})[G.state.room]) {
          const sp = spotOf(area().npcSpots, 0);
          if (sp) G.drawShrine(c, sp[0] * TT - 20, sp[1] * TT - 20, p, t);
        }
        // NPCs
        ((area().npcs || {})[G.state.room] || []).forEach((n, i) => {
          const sp = n.spot !== undefined ? spotOf(area().npcSpots, n.spot) : [n.x, n.y];
          if (sp) G.drawNpc(c, sp[0] * TT, sp[1] * TT, p, n.v, t, i);
        });
        // Inschriften
        ((area().inschriftSpots || {})[G.state.room] || []).forEach(([tx, ty], i) => {
          const key = G.state.room + ':' + i;
          G.drawInschrift(c, tx * TT, ty * TT, p, t, !!G.state.gelesen[key]);
        });

        // Ladenflackern
        if (G.state.area === 'stadt' && G.state.room === '1,2' && Math.sin(t * 6.5) > 0.55) {
          c.globalAlpha = 0.3; c.fillStyle = G.PAL.amber.main;
          c.fillRect(5 * TT, 9 * TT, 5 * TT, 3 * TT); c.globalAlpha = 1;
        }

        G.drawParticles(c);
        G.drawFauna(c, fauna, p, t);

        // Begleiter hinter dem Spieler
        if (G.state.phase === 'arkana' && G.state.sig) {
          G.drawSpirit(c, spiritPos.x, spiritPos.y, p, t, G.state.sig.spirit.farbe, spiritTrail);
        }

        // Spieler
        const cols = G.state.sig ? G.state.sig.farben : { robe: '#4a4e58', robeHi: '#5f646f', trim: '#8b8f99', core: '#ff8c00' };
        const glow = G.state.phase === 'prolog' ? G.PAL.amber.main : null;
        G.drawPlayer(c, G.state.px, G.state.py, anim, p, cols, glow);

        // Licht der Fackeln, Kristalle und Leylinien über allem
        G.drawLight(c, room(), p, t);
        c.restore();
      }

      G.vignette(c, G.state.phase === 'prolog' ? 0.62 : 0.44);

      // ---- HUD ----
      c.fillStyle = p.bgVoid; c.fillRect(0, G.HUD_Y, G.W, G.HUD_H);
      c.fillStyle = p.dim; c.fillRect(0, G.HUD_Y, G.W, 2);
      const r = room();
      const areaName = (r && r.name) ? r.name.toUpperCase()
        : (G.state.area === 'stadt' ? 'DIE GRAUE STADT' : 'ARKANA');
      G.text(c, areaName, 20, G.HUD_Y + 16, p.textDim, 15);
      if (G.state.phase === 'arkana') {
        G.text(c, `✦ ${G.state.fragmente.length}`, G.W - 20, G.HUD_Y + 14, p.main, 18, 'right');
        if (G.state.sig) G.text(c, `${G.state.sig.sym} ${G.state.sig.name}`, G.W - 20, G.HUD_Y + 40, p.textDim, 14, 'right');
      } else {
        const clock = Math.floor(t) % 14 < 3 ? '3:33' : '3:2' + (Math.floor(t) % 9);
        G.text(c, clock, G.W - 20, G.HUD_Y + 14, clock === '3:33' ? G.PAL.amber.main : p.textDim, 18, 'right');
      }
      const it = !transition && nearest();
      if (it) {
        const label = { npc: 'SPRECHEN', frag: 'AUFHEBEN', shrine: 'IN DEN SPIEGEL SCHAUEN', trigger: 'EINTRETEN', inschrift: 'LESEN' }[it.type];
        c.globalAlpha = 0.16 + 0.06 * Math.sin(t * 5);
        c.fillStyle = p.main; c.fillRect(14, G.HUD_Y + 44, G.W - 28, 40); c.globalAlpha = 1;
        c.strokeStyle = p.main; c.lineWidth = 2; c.strokeRect(14, G.HUD_Y + 44, G.W - 28, 40);
        G.text(c, `OK  ${label}`, G.W / 2, G.HUD_Y + 56, p.textBright, 18, 'center');
      } else {
        G.text(c, 'MENÜ öffnet den Codex', G.W / 2, G.HUD_Y + 56, p.textDim, 14, 'center');
      }
    },
  };
};

// ------------------------------------------------------------
// Terminal: der Sog
// ------------------------------------------------------------
G.TerminalScene = () => {
  let stage = 'boot'; let t = 0; let bootLine = 0; let inputLock = 0;
  let name = ''; let zsel = 0; let age = 25; let sig = null; let opage = 0;
  const bootLines = ['> SIGNAL GEFUNDEN', '> PROTOKOLL: ARKANA v22', '> DIE WELT HINTER DER WELT WARTET', '> IDENTIFIKATION ERFORDERLICH...'];
  const form = document.getElementById('nameform');
  const input = document.getElementById('nameform-input');
  const okBtn = document.getElementById('nameform-ok');

  function askName() {
    form.classList.add('show');
    input.value = '';
    setTimeout(() => input.focus(), 60);
    const done = () => {
      const v = input.value.trim();
      if (!v) return;
      name = v.slice(0, 16);
      form.classList.remove('show'); input.blur();
      G.input.clearAll();
      // Kurze Sperre, sonst rasen die Auto-Repeat-Enter durch die
      // naechsten beiden Auswahlen hindurch.
      inputLock = 0.35;
      stage = 'zodiac';
    };
    okBtn.onclick = done;
    input.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') done(); };
  }

  const opages = () => [
    `${sig.name.toUpperCase()}\n\nGeboren im Zeichen\n${sig.sym} ${sig.zeichen}\n\nElement ${sig.element}\nHerrscher ${sig.planet}`,
    `DEINE NAMENSZAHL\n\n${sig.zahl}\n\n${sig.gabe.name.toUpperCase()}\n\n${sig.gabe.text}`,
    `${sig.saturn.name.toUpperCase()}\n\n${sig.saturn.text}\n\n${sig.spirit.name} wird dich begleiten,\n${sig.spirit.wesen}.`,
    'DAS MUSTER HAT DICH GELESEN.\n\nJETZT LIES DU ES.',
  ];

  return {
    update(dt) {
      t += dt;
      if (inputLock > 0) { inputLock -= dt; G.input.clearAll(); return; }
      if (stage === 'boot') {
        if (t > (bootLine + 1) * 0.6) bootLine++;
        if (bootLine >= bootLines.length) { stage = 'name'; askName(); }
      } else if (stage === 'zodiac') {
        if (G.input.pressed('left')) zsel = (zsel + 11) % 12;
        if (G.input.pressed('right')) zsel = (zsel + 1) % 12;
        if (G.input.pressed('up')) zsel = (zsel + 9) % 12;
        if (G.input.pressed('down')) zsel = (zsel + 3) % 12;
        if (G.input.pressed('action')) stage = 'age';
      } else if (stage === 'age') {
        if (G.input.pressed('left')) age = Math.max(10, age - 1);
        if (G.input.pressed('right')) age = Math.min(99, age + 1);
        if (G.input.pressed('up')) age = Math.min(99, age + 5);
        if (G.input.pressed('down')) age = Math.max(10, age - 5);
        if (G.input.pressed('action')) { sig = G.makeSignature(name, zsel, age); stage = 'oracle'; opage = 0; }
      } else if (stage === 'oracle') {
        if (G.input.pressed('action')) { opage++; if (opage >= opages().length) { stage = 'sog'; t = 0; G.doShake(5, 1.2); } }
      } else if (stage === 'sog') {
        if (t < 2.6 && Math.random() < 0.5) {
          const a = Math.random() * 6.283, r = 190 * (1 - t / 2.6) + 30;
          G.spawnParticle({ x: G.W / 2 + Math.cos(a) * r, y: G.H / 2 + Math.sin(a) * r,
            vx: -Math.cos(a) * 130, vy: -Math.sin(a) * 130, life: 1.1, fade: 1.1,
            color: Math.random() > 0.5 ? G.PAL.amber.bright : G.PAL.amber.main, size: 2 });
        }
        if (t > 2.8) {
          G.state.sig = sig; G.state.phase = 'arkana'; G.state.area = 'asche';
          G.state.room = '2,2'; G.state.px = 167; G.state.py = 270;
          G.pal = G.PAL.amber; G.particles.length = 0; G.save();
          G.replaceScene(G.OverworldScene());
          G.pushScene(G.DialogScene([
            'Du öffnest die Augen. Die Luft schmeckt nach Asche und Bernstein.',
            'Über dir kein Himmel, sondern ein Gewölbe aus langsam ziehenden Zeichen.',
            `Neben dir schwebt ein Licht. ${sig.spirit.name}, ${sig.spirit.wesen}.`,
            'Willkommen in Arkana.',
          ]));
        }
      }
    },
    draw(c) {
      const p = G.PAL.amber;
      c.fillStyle = '#050301'; c.fillRect(0, 0, G.W, G.H);
      c.strokeStyle = p.dim; c.lineWidth = 2; c.strokeRect(14, 14, G.W - 28, G.H - 28);

      if (stage === 'boot' || stage === 'name') {
        bootLines.slice(0, Math.min(bootLine + 1, bootLines.length)).forEach((l, i) => {
          G.text(c, l, 34, G.SAFE_Y + 90 + i * 30, p.main, 14);
        });
        if (stage === 'name') G.text(c, '> WARTE AUF NAME...', 34, G.SAFE_Y + 90 + bootLines.length * 30 + 14, p.text, 14);
        if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = p.main; c.fillRect(34, G.H - 120, 12, 20); }
      } else if (stage === 'zodiac') {
        const SY = G.SAFE_Y;
        G.text(c, '> UNTER WELCHEM ZEICHEN', G.W / 2, SY + 60, p.main, 17, 'center');
        G.text(c, 'WURDEST DU GEBOREN?', G.W / 2, SY + 82, p.main, 17, 'center');
        G.ZODIAC.forEach((z, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const x = 70 + col * 110, y = SY + 140 + row * 96;
          const on = i === zsel;
          if (on) {
            c.fillStyle = p.card; c.fillRect(x - 46, y - 16, 92, 78);
            c.strokeStyle = p.main; c.lineWidth = 2; c.strokeRect(x - 46, y - 16, 92, 78);
          }
          G.text(c, z.sym, x, y - 6, on ? p.bright : p.textDim, 34, 'center');
          G.text(c, z.name, x, y + 40, on ? p.textBright : p.textDim, 14, 'center');
        });
        const z = G.ZODIAC[zsel];
        G.textGlow(c, `${z.element}  ·  ${z.planet}`, G.W / 2, SY + 542, p.text, 16);
        G.text(c, '[ OK ] bestätigen', G.W / 2, SY + 580, p.textDim, 15, 'center');
      } else if (stage === 'age') {
        const SY2 = G.SAFE_Y;
        G.text(c, '> WIE VIELE JAHRE TRÄGST DU?', G.W / 2, SY2 + 150, p.main, 17, 'center');
        G.text(c, '◀', G.W / 2 - 96, SY2 + 260, p.text, 28, 'center');
        G.textGlow(c, String(age), G.W / 2, SY2 + 230, p.bright, 76);
        G.text(c, '▶', G.W / 2 + 96, SY2 + 260, p.text, 28, 'center');
        G.text(c, G.saturnPhase(age).name, G.W / 2, SY2 + 356, p.text, 18, 'center');
        G.text(c, G.saturnPhase(age).text, G.W / 2, SY2 + 384, p.textDim, 16, 'center');
        G.text(c, '[◀▶] ändern   [ OK ] bestätigen', G.W / 2, SY2 + 500, p.textDim, 15, 'center');
      } else if (stage === 'oracle') {
        const pages = opages();
        const lines = pages[Math.min(opage, pages.length - 1)].split('\n');
        const startY = G.H / 2 - lines.length * 17;
        lines.forEach((l, i) => {
          const big = i === 0 || (l.length < 4 && l.trim());
          G.text(c, l, G.W / 2, startY + i * 34, i === 0 ? p.bright : p.text, big ? 22 : 15, 'center');
        });
        if (Math.floor(t * 2) % 2 === 0) G.text(c, '[ OK ]', G.W / 2, G.H - 100, p.textDim, 16, 'center');
      } else if (stage === 'sog') {
        const pr = Math.min(t / 2.8, 1);
        c.save(); c.translate(G.W / 2, G.H / 2);
        for (let i = 0; i < 56; i++) {
          const ang = i * 0.62 + t * 3.4;
          const rad = (1 - pr) * 210 + 16 + (i % 9) * 7 * (1 - pr);
          c.globalAlpha = 0.25 + pr * 0.75;
          c.fillStyle = i % 3 === 0 ? p.bright : p.main;
          c.fillRect(Math.cos(ang) * rad, Math.sin(ang) * rad * 1.5, 4, 4);
        }
        c.restore();
        G.drawParticles(c);
        c.globalAlpha = pr * pr; c.fillStyle = p.main; c.fillRect(0, 0, G.W, G.H); c.globalAlpha = 1;
      }
      G.vignette(c, 0.5);
    },
  };
};

// ------------------------------------------------------------
fitCanvas();
G.pushScene(G.TitleScene());
