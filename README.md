# ⚡ ARKANA — Das verborgene Muster

Ein mystisches Retro-Adventure im Hochformat. Läuft im Browser, auf dem Handy und am Rechner, komplett offline, ohne Installation.

**▶ [Jetzt spielen](https://nadercbz.github.io/arkana/)**

---

## Worum es geht

Du erwachst in einer grauen Stadt, in der alle auf Bildschirme starren und niemand mehr aufschaut. Nur du siehst das Flackern. Zahlen, die sich wiederholen. Ein Muster unter allem.

In einer schlaflosen Nacht führt dich das Signal zu einem Laden ohne Schild. Dort fragt dich ein alter Röhrenbildschirm nach deinem Namen, deinem Sternzeichen und deinem Alter. In dem Moment, wo du antwortest, kippt die Welt.

Willkommen in Arkana.

## Jede Reise ist anders

Aus Name, Sternzeichen und Alter berechnet das Spiel deine **Signatur**:

- **Namenszahl** nach pythagoreischer Numerologie, inklusive Meisterzahlen 11, 22 und 33
- **Element und Herrscherplanet** aus deinem Sternzeichen, das färbt deine Robe und bestimmt deinen Begleiter
- **Lebensphase** aus dem Saturn-Zyklus von 29,5 Jahren, das rahmt deine Geschichte

Diese Signatur ist der Zufallskern der ganzen Welt. Zwei Spieler mit verschiedenen Namen finden andere Wissensfragmente an anderen Orten und bekommen am Spiegelschrein eine andere Lesung. Dieselbe Eingabe ergibt immer dieselbe Reise.

## Glauben oder Prüfen

Jedes gefundene Fragment kannst du glauben oder prüfen. Das Spiel merkt sich, wie du dich entscheidest, und spiegelt es dir am Ende zurück. Wer alles glaubt, hört etwas anderes als wer alles anzweifelt. Das Gleichgewicht ist der dritte Weg.

## Steuerung

| | Handy | Rechner |
|---|---|---|
| Bewegen | Daumen auf der linken Bildhälfte, virtueller Stick | Pfeiltasten oder WASD |
| Bestätigen | OK | Enter, Leertaste oder E |
| Codex | MENÜ | Escape oder Q |

## Technik

Eine einzige HTML-Datei, rund 130 KB. Kein Framework, keine Bibliothek, keine externen Ressourcen, kein Server. Reines Canvas 2D.

- **Natives Hochformat.** Interne Auflösung 360 mal 640 (9:16), die Höhe passt sich langen Handys an, statt schwarze Balken zu lassen. Der Backing-Store rechnet mit der Pixeldichte des Geräts, auf einem modernen iPhone sind das 780 mal 1688 echte Pixel.
- **Organische Animation.** Der Charakter hat keine festen Einzelbilder. Bewegung entsteht aus überlagerten Schwingungen plus Feder-Physik: Der Umhang läuft der Bewegung nach, die Kapuze schwingt gegenläufig, beim Anlaufen und Stoppen staucht sich der Körper. Dazu Atmen im Stand, Blinzeln und Staub beim Aufsetzen der Schritte.
- **Alles prozedural gezeichnet.** Keine Bilddateien. Tiles und Figuren entstehen im Code, deshalb bleibt alles in einer Datei.

## Selbst bauen

```bash
python3 build_game.py
```

Das Skript fügt die Module aus `src/` zu `index.html` zusammen und prüft, dass keine externen Ressourcen hineingeraten sind.

## Stand

Kapitel 1 ist spielbar: der Prolog in der grauen Stadt, der Übergang durch das Terminal, die Aschenstadt mit Wissensfragmenten, Codex und dem ersten Spiegelschrein.

Geplant: Kampfsystem nach den fünf Wandlungsphasen, Mondphasen-Uhr, I-Ging-Tore, die weiteren Regionen, das Schatten-System und die Schriftrolle der Bestimmung.

## Hinweis

Das Spiel arbeitet mit Numerologie, Astrologie und mystischer Symbolik als erzählerisches Material. Es ist ein Spiel, keine Lebensberatung und keine Aussage über die Wirklichkeit. Die Haltung im Spiel ist Mustererkennung statt Wahrheitsbehauptung, und genau darum geht es auch im Spiel selbst.
