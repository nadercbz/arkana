#!/usr/bin/env python3
"""ARKANA Build-Skript.

Fügt alle src/*.js Module plus die Wissensfragmente aus der Knowledge Base
zu einer einzigen offline lauffähigen arkana.html zusammen.

Usage: python3 build_game.py
"""

import json
import re
import sys
from pathlib import Path

GAME_DIR = Path(__file__).parent
KB_DIR = GAME_DIR.parent / "Knowledge_Base"
OUTPUT = GAME_DIR / "arkana.html"

sys.path.insert(0, str(KB_DIR))
from build_dashboard import parse_frontmatter  # noqa: E402

# Module, deren Fragmente ins Spiel dürfen. _PERSONEN bleibt draußen
# (kein Personenbezug), Meta-Ordner ebenso.
FRAGMENT_MODULES = [
    "01_Numerologie", "02_Astrologie_Planeten", "03_Sternenkonstellationen",
    "04_Mond_Sonnenzyklen", "05_Historische_Zyklen", "06_Kulturelle_Systeme",
    "07_Weltereignisse_Korrelationen", "08_Symbolik", "09_Esoterik_Modern",
    "11_Verborgene_Geschichte", "12_Geheimgesellschaften",
    "13_Unterdruecktes_Wissen", "14_UFOs_UAP_Disclosure",
    "16_Magick_Okkulte_Systeme", "17_Heilige_Texte_Verborgen",
    "18_Heilige_Geographie", "19_Prophezeiungen", "20_Bewusstseinsforschung",
    "21_Spirituelle_Anatomie", "22_Banned_Books", "23_Chinesische_Metaphysik",
]


def collect_fragments():
    """Zieht pro KB-Datei die Blockquote als kurzes Wissensfragment."""
    fragments = []
    for module in FRAGMENT_MODULES:
        folder = KB_DIR / module
        if not folder.exists():
            continue
        for md in sorted(folder.glob("*.md")):
            if md.name == "README.md":
                continue
            try:
                meta, body = parse_frontmatter(md.read_text(encoding="utf-8"))
            except (OSError, UnicodeDecodeError):
                continue
            quote = ""
            for line in body.splitlines():
                if line.startswith("> "):
                    quote = line[2:].strip()
                    break
            if not quote:
                continue
            # Kürzen, aber am Satzende
            if len(quote) > 260:
                cut = quote[:260]
                dot = cut.rfind(". ")
                quote = cut[: dot + 1] if dot > 80 else cut + "…"
            fragments.append({
                "id": f"{module}/{md.stem}",
                "titel": meta.get("title", md.stem),
                "text": quote,
                "modul": module,
            })
    return fragments


def main():
    print("⚡ Building ARKANA...")
    js_parts = []
    for src in sorted(GAME_DIR.glob("src/*.js")):
        js_parts.append(f"// ===== {src.name} =====\n" + src.read_text(encoding="utf-8"))
    js_code = "\n".join(js_parts)

    fragments = collect_fragments()
    print(f"   Wissensfragmente: {len(fragments)}")
    frag_json = json.dumps(fragments, ensure_ascii=False, separators=(",", ":"))
    js_code = js_code.replace("__FRAGMENTS_PLACEHOLDER__", frag_json)

    html = HTML_TEMPLATE.replace("__GAME_JS__", js_code)
    OUTPUT.write_text(html, encoding="utf-8")
    size_kb = len(html.encode("utf-8")) / 1024
    print(f"✓ {OUTPUT.name} ({size_kb:.0f} KB)")

    # Qualitäts-Check: keine externen Ressourcen
    ext = re.findall(r"https?://[^\"'\s)]+", html)
    ext = [u for u in ext if "w3.org" not in u]
    if ext:
        print(f"   ⚠️ Externe Referenzen gefunden: {ext[:5]}")
    else:
        print("   ✓ Keine externen Ressourcen, läuft komplett offline")


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0a0602">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ARKANA">
<meta name="description" content="ARKANA — ein mystisches Retro-Adventure. Finde dein verborgenes Muster.">
<title>ARKANA — Das verborgene Muster</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body {
  width: 100%; height: 100%; overflow: hidden;
  background: #050301; touch-action: none;
  font-family: 'Courier New', ui-monospace, monospace;
  overscroll-behavior: none;
  -webkit-user-select: none; user-select: none;
}
#wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
#game {
  image-rendering: pixelated; image-rendering: crisp-edges;
  background: #050301; display: block;
}
#scanlines { position: absolute; pointer-events: none; mix-blend-mode: multiply; opacity: 0.75; }

/* Touch-Steuerung liegt als Overlay über dem Bild, kostet also keine Fläche */
#touchzone { position: fixed; inset: 0; z-index: 5; display: none; }
body.touch #touchzone { display: block; }

#stick {
  position: fixed; width: 120px; height: 120px; z-index: 6; display: none;
  pointer-events: none; border: 2px solid rgba(255,140,0,0.30); border-radius: 50%;
  background: radial-gradient(circle, rgba(255,140,0,0.10), rgba(255,140,0,0.02));
}
#stick-knob {
  position: absolute; left: 38px; top: 38px; width: 44px; height: 44px;
  border-radius: 50%; background: rgba(255,140,0,0.42);
  border: 2px solid rgba(255,180,71,0.75);
}
#pad { position: fixed; inset: 0; pointer-events: none; display: none; z-index: 7; }
body.touch #pad { display: block; }
.pbtn {
  position: absolute; pointer-events: auto;
  border: 2px solid rgba(255,140,0,0.45); border-radius: 50%;
  background: rgba(255,140,0,0.12); color: rgba(255,232,194,0.9);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Courier New', monospace; font-weight: bold;
  transition: background 0.08s, transform 0.08s;
}
.pbtn:active, .pbtn.on { background: rgba(255,140,0,0.42); transform: scale(0.93); }
#p-a { right: 22px; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); width: 88px; height: 88px; font-size: 19px; }
#p-b { right: 34px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); width: 62px; height: 62px; font-size: 13px; }
/* Steuerkreuz nur am Rechner sichtbar, am Handy übernimmt der Stick */
#p-up, #p-down, #p-left, #p-right { display: none; }

#nameform {
  position: fixed; inset: 0; z-index: 20; display: none;
  align-items: center; justify-content: center; flex-direction: column;
  background: rgba(4,2,0,0.95); padding: 20px;
}
#nameform.show { display: flex; }
#nameform label { color: #ff8c00; font-size: 16px; letter-spacing: 3px; margin-bottom: 20px; text-align: center; line-height: 1.7; }
#nameform input {
  background: #1a0d05; border: 2px solid #cc6600; color: #ffe8c2;
  font-family: 'Courier New', monospace; font-size: 24px; text-align: center;
  padding: 14px; width: min(80vw, 320px); outline: none; border-radius: 4px;
}
#nameform input:focus { border-color: #ff8c00; box-shadow: 0 0 14px rgba(255,140,0,0.35); }
#nameform button {
  margin-top: 22px; background: #ff8c00; border: none; color: #1a0d05;
  font-family: 'Courier New', monospace; font-size: 17px; font-weight: bold;
  padding: 14px 40px; border-radius: 4px; letter-spacing: 3px;
}
</style>
</head>
<body>
<div id="wrap">
  <canvas id="game" width="360" height="640"></canvas>
  <div id="scanlines"></div>
</div>
<div id="touchzone"></div>
<div id="stick"><div id="stick-knob"></div></div>
<div id="pad">
  <div class="pbtn" id="p-up">▲</div>
  <div class="pbtn" id="p-down">▼</div>
  <div class="pbtn" id="p-left">◀</div>
  <div class="pbtn" id="p-right">▶</div>
  <div class="pbtn" id="p-a">OK</div>
  <div class="pbtn" id="p-b">MENÜ</div>
</div>
<div id="nameform">
  <label id="nameform-label">WIE LAUTET DEIN NAME?</label>
  <input id="nameform-input" maxlength="16" autocomplete="off" autocapitalize="words" spellcheck="false">
  <button id="nameform-ok">WEITER</button>
</div>
<script>
__GAME_JS__
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
