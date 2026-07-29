# held_ruhe_v6_kaputt.glb

Die urspruengliche Ruheanimation der Spielfigur. Nicht mehr im Spiel,
absichtlich hier geparkt statt geloescht, damit der Vergleich vorher
und nachher nachvollziehbar bleibt.

## Warum sie raus ist

Gegen die eigene Ruhepose des Modells gemessen wich sie ab:

| Knochen  | mittlere Abweichung |
|----------|--------------------|
| Spine02  | 70.6 Grad          |
| Hips     | 68.9 Grad          |
| LeftUpLeg| 43.6 Grad          |
| LeftLeg  | 42.0 Grad          |

Die Knie standen dauerhaft 36 bis 59 Grad gebeugt und bis zu 51 Grad
seitlich verdreht. Ein Knie ist ein Scharnier, da gehoert keine
Verdrehung hin. Sichtbar war das als eingedrehte Huefte und seitlich
weggestellte Beine im Stand.

## Was stattdessen da ist

`js/ruhepose.js` baut die Standanimation zur Laufzeit aus der Ruhepose
des Skeletts. Die ist nachgemessen sauber: Knie bei 8 Grad Beugung,
Verdrehung unter 5 Grad. Die Beinknochen bleiben exakt darauf, die
Bewegung sitzt nur im Oberkoerper. Verdrehte Knie sind damit
rechnerisch ausgeschlossen.

`test/posetest.js` prueft alle GLBs unter `assets/` gegen diese
Grenzen und schlaegt fehl, wenn wieder so etwas hereinkommt.
Diese Datei liegt deshalb ausserhalb von `assets/`.

`test/figur.html?modus=alt` zeigt sie weiterhin im Vergleich.
