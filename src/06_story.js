'use strict';
// Story: Inschriften, Funde und Stimmen an den Orten der Welt
G.STORY = {

  // ===== ZENTRUM: die Gegenwart =====

  '2,2': {
    ort: 'Aschenstadt',
    inschriften: [
      { titel: 'Verkohlte Tafel', text: 'Hier stand das Große Archiv. Zwölf Säle, vier Treppen, ein Dach aus Kupfer. Heute steht davon eine Wand. An ihr lehnt niemand mehr.' },
      { titel: 'Eingeritzt', text: 'Sie nennen es Ordnung. Ich habe die Karren gezählt. Vierzehn Karren voll Papier, weg vom Feuer, nicht ins Feuer. Wo sind sie hin. Hier bricht der Stein ab.' },
      { titel: 'Amtlicher Aushang, halb abgerissen', text: 'Erlass des Index, siebtes Jahr nach dem Brand. Das Sammeln von Fragmenten ist Sorgfaltsbruch. Wer sammelt, wird entschrieben.' },
    ],
    ankunft: 'Asche knirscht unter dir wie trockener Schnee. Es riecht nach nassem Stein und altem Rauch, und irgendwo klappert ein Fensterladen, den niemand geöffnet hat.',
  },

  '2,1': {
    ort: 'Spiegelhof',
    inschriften: [
      { titel: 'Am Sockel der ersten Säule', text: 'Neun Spiegel. Neun Namen. Die Namen wurden abgeschliffen, die Spiegel blieben. Der Index hat vergessen, dass Glas sich erinnert.' },
      { titel: 'Mit einem Nagel geschrieben', text: 'Meine Schwester Ilva stand am vierten Spiegel. Ich sehe ihr Gesicht noch, aber ich weiß ihren Nachnamen nicht mehr. So funktioniert das Entschreiben.' },
      { titel: 'Anweisung, teils ausgekratzt', text: 'Bei Befragung im Hof den Spiegel abdecken. Der Befragte darf sich nicht sehen. Wer sich sieht, erinnert sich. Der Rest ist ausgekratzt.' },
    ],
    ankunft: 'Ein Ring aus Säulen, dazwischen Glas, das dich mit einer halben Sekunde Verspätung nachmacht. Der Wind geht hier im Kreis.',
  },

  '2,3': {
    ort: 'Markt der Mustersucher',
    inschriften: [
      { titel: 'Schild über dem Stand von Bram', text: 'Ich tausche gegen Fragmente, nicht gegen Münzen. Wer nur Münzen hat, bekommt Suppe. Wer Suppe hat, bekommt Gesellschaft.' },
      { titel: 'Auf einer Kistenwand', text: 'Regel eins. Nichts erfinden. Ein erfundenes Fragment vergiftet hundert echte. Wir sind nicht der Index, aber wir sind auch keine Lügner.' },
      { titel: 'Zettel, angenagelt', text: 'Gesucht: Seite 4 bis 11 der Wetterrolle. Biete zwei Kerzen und die Karte vom Sumpf. Fragt nach Tova. Sie hustet, sie ist trotzdem da.' },
    ],
    ankunft: 'Zum ersten Mal Stimmen, die durcheinanderreden. Fett zischt in einer Pfanne, jemand feilscht laut, jemand lacht kurz und hört schnell wieder auf.',
  },

  // ===== MITTLERE EBENE: die Vergangenheit =====

  '1,1': {
    ort: 'Verbrannte Bibliothek',
    inschriften: [
      { titel: 'In ein Regalbrett gebrannt', text: 'Gang sieben stand noch, als das Feuer schon aus war. Am nächsten Morgen war Gang sieben leer. Feuer trägt keine Bücher davon.' },
      { titel: 'Kohlestrich an der Mauer', text: 'Ich war Schreiber. Ich habe die Fackeln gehalten, weil man es mir sagte. Ich schreibe das hier, damit es einer liest. Mehr kann ich nicht mehr tun.' },
      { titel: 'Fragment eines Verzeichnisses', text: 'Bestand vor dem Brand: elftausend Rollen. Bestand nach dem Brand laut Index: null. Bestand laut meiner Zählung im dritten Jahr nach dem Brand: hier endet das Blatt.' },
    ],
    ankunft: 'Regalgassen ohne Decke. Der Boden ist weich von aufgeweichtem Papier, und jeder Schritt klingt, als trätest du in etwas, das mal wichtig war.',
  },

  '1,2': {
    ort: 'Wurzelhain',
    inschriften: [
      { titel: 'In die Rinde geschnitten, alt verwachsen', text: 'Diese Bäume standen, bevor die Stadt stand. Sie haben den Brand gesehen. Sie sagen nichts, aber ihre Ringe sind in dem Jahr schmal.' },
      { titel: 'Steinplatte zwischen Wurzeln', text: 'Hier trafen sich die Archivare, bevor sie der Index wurden. Damals waren sie zwanzig Leute mit einer Sorge. Keine Uniform, kein Grau.' },
      { titel: 'Frisch geritzt', text: 'Wir kommen her, weil hier keine Wand steht, an die man einen Erlass nageln kann.' },
    ],
    ankunft: 'Wurzeln so dick wie Balken, dazwischen kalte feuchte Luft. Es riecht nach Pilzen und nasser Erde, und das Licht kommt nur in Flecken durch.',
  },

  '3,1': {
    ort: 'Kristallkaverne',
    inschriften: [
      { titel: 'Auf einer Kristallflanke, eingelassen', text: 'Ruf hinein, was du weißt. Der Stein gibt es zurück, aber nicht so, wie du es gesagt hast. Er nimmt die Angst raus. Was dann bleibt, ist der Kern.' },
      { titel: 'Notiz einer Mustersucherin', text: 'Ich habe den Namen des Mannes hineingerufen, der die Fackel warf. Der Kristall gab drei Namen zurück. Es waren nie nur einer.' },
      { titel: 'Alte Marke, halb überwachsen', text: 'Lager des Index, zweites Jahr nach dem Brand. Verwahrt hier, was nicht vernichtet werden soll. Jemand hat unter die Zeile gekritzelt: also gab es das.' },
    ],
    ankunft: 'Dein Atem kommt als Ton zurück, nicht als Echo. Die Kristalle stehen schräg wie umgefallene Säulen und werfen dein Licht in falsche Richtungen.',
  },

  '3,2': {
    ort: 'Sandtor',
    inschriften: [
      { titel: 'Linker Obelisk', text: 'Ab hier zählt keine Karte mehr. Wer weitergeht, geht ohne Aufzeichnung. Genau deshalb gingen manche weiter.' },
      { titel: 'Rechter Obelisk, Zeilen fehlen', text: 'Im vierten Jahr nach dem Brand zogen die Wagen des Index hier durch. Nach Westen, schwer beladen. Zurück kamen sie leer. Was danach steht, ist abgeschlagen.' },
      { titel: 'Kleine Tafel am Boden', text: 'Für Ilva, die hier umkehrte. Sie sagte, sie habe genug gesehen. Zwei Wochen später kannte sie ihren eigenen Namen nicht mehr.' },
    ],
    ankunft: 'Zwei Obelisken, dazwischen nur Wind. Der Sand liegt schon auf den Steinplatten, dünn und geduldig, als warte er das Ende der Stadt ab.',
  },

  '1,3': {
    ort: 'Mondgarten',
    inschriften: [
      { titel: 'Auf dem Rand des Beckens', text: 'Was hier wächst, öffnet sich nachts und rechnet dabei. Die Gärtner lasen die Gezeiten an den Blüten ab. Der Index nannte das Aberglaube und ließ es zuschütten.' },
      { titel: 'Umgestürzter Stein', text: 'Wir haben vierzig Jahre lang notiert, wann was blüht. Die Rolle lag im Archiv. Die Rolle ist weg. Die Blüten machen trotzdem weiter.' },
      { titel: 'Auf ein Holzschild gebrannt', text: 'Zwei Nachtwächter reichen. Wer zu dritt kommt, kommt nicht wegen der Blumen.' },
    ],
    ankunft: 'Weiße Blüten, die sich öffnen, als hätten sie auf dich gewartet. Es riecht süß und ein bisschen faul, und Wasser tropft in gleichmäßigen Abständen.',
  },

  '3,3': {
    ort: 'Glutschlund',
    inschriften: [
      { titel: 'In den Brückenkopf geschlagen', text: 'Von hier kam das Feuer nicht. Das Feuer kam von oben, aus der Stadt, mit Fackeln in Händen, die vorher Bücher gehalten haben.' },
      { titel: 'Verrostetes Schild', text: 'Ablieferstelle. Erstes Jahr nach dem Brand. Was hier hinuntergeht, kommt nicht zurück. Darunter, in anderer Schrift: nicht alles ging hinunter.' },
      { titel: 'Mit Ruß geschrieben', text: 'Ich habe gesehen, wie einer der Grauen eine Rolle in den Mantel steckte, statt sie zu werfen. Er hat mich gesehen. Er hat nichts gesagt.' },
    ],
    ankunft: 'Heiße Luft steigt dir ins Gesicht, trocken und metallisch. Unter den Brettern der Brücke ist nur roter Schein und ein Ton wie ein sehr langsamer Atem.',
  },

  // ===== RAND: die Tiefenschicht =====

  '2,0': {
    ort: 'Sternenwarte',
    inschriften: [
      { titel: 'Am Fuß des Rohrs', text: 'Die Kuppel wurde von innen geschwärzt. Sechs Anstriche. Ein Loch blieb, handbreit, über dem Nordrand. Kein Anstrich vergisst so sorgfältig.' },
      { titel: 'Logbuch, letzte lesbare Seite', text: 'Neuntes Jahr nach dem Brand. Ich beobachte weiter, obwohl es verboten ist. Wenn niemand mehr hochsieht, kann man den Leuten jeden Himmel erzählen. Das ist der Punkt.' },
      { titel: 'Randnotiz von fremder Hand', text: 'Archivar Sedra hat das Loch gelassen. Er hat es nie zugegeben. Er hat auch nie den Pinsel weitergereicht.' },
    ],
    ankunft: 'Kalte Kuppel, schwarz von innen. Durch ein einziges Loch fällt ein Strahl auf den Boden und wandert, langsam, wie ein Zeiger.',
  },

  '1,0': {
    ort: 'Halle der stillen Spiegel',
    inschriften: [
      { titel: 'In das Eis geritzt', text: 'In diesen Flächen steht je ein Moment still. Ein Marktplatz. Ein Mann mit einer Fackel. Ein Kind, das nicht wegsieht. Niemand hat sie hierhergestellt.' },
      { titel: 'Auf einer Bank', text: 'Die Archivare kamen her, um sich anzusehen, was sie getan haben. Anfangs jährlich. Dann alle drei Jahre. Dann gar nicht mehr.' },
      { titel: 'Halb abgesplitterte Platte', text: 'Vor dem Brand verkaufte einer Prophezeiungen aus geraubten Seiten. Elf Familien gaben alles her. Vier Kinder starben im Winter danach. Hier bricht das Eis.' },
    ],
    ankunft: 'Eiskalte Luft, die in den Zähnen sitzt. Die Flächen an den Wänden sind keine Spiegel. Sie zeigen dich nicht. Sie zeigen andere, die nicht mehr gehen.',
  },

  '3,0': {
    ort: 'Echokammer',
    inschriften: [
      { titel: 'Erste Windung', text: 'Die Spirale hält Stimmen fest, nicht Worte. Man hört den Ton, in dem etwas gesagt wurde. Der Ton lügt seltener als der Satz.' },
      { titel: 'Dritte Windung', text: 'Hier spricht eine Frau, die einen Erlass vorliest. Ihre Stimme bricht bei dem Wort entschrieben. Sie liest ihn trotzdem zu Ende.' },
      { titel: 'Innerste Windung, kaum lesbar', text: 'Und eine Männerstimme, sehr leise: wir haben zu schnell entschieden. Danach nur noch Rauschen.' },
    ],
    ankunft: 'Der Gang windet sich enger, und mit jedem Schritt hörst du deine eigenen Schritte von vorhin. Die Luft ist still und riecht nach kaltem Stein.',
  },

  '0,2': {
    ort: 'Nebelsumpf',
    inschriften: [
      { titel: 'Pfahl, schief im Wasser', text: 'Hier versank, was man nicht verbrennen wollte und nicht behalten durfte. Kisten, beschwert mit Steinen. Manche liegen flach genug.' },
      { titel: 'Auf einem Bootsrand', text: 'Im fünften Jahr nach dem Brand zog Bram eine Kiste hoch. Innen: Rechnungsbücher eines Wunderhändlers. Namen von Leuten, die ihm alles gegeben hatten.' },
      { titel: 'Halb im Schlamm', text: 'Nicht alles, was der Index versenkt hat, war Wissen. Manches war Beweis. Der Rest ist nicht mehr zu lesen.' },
    ],
    ankunft: 'Wasser bis an den Rand der Inselchen, Nebel bis an die Knie. Es blubbert irgendwo, ohne dass etwas zu sehen ist, und es riecht nach faulem Holz.',
  },

  '0,1': {
    ort: 'Ufer der Vergessenen',
    inschriften: [
      { titel: 'Auf der ersten Steglatte', text: 'Wer bis hier kam, wollte nicht gerettet werden. Er wollte aufhören, jemand zu sein. Das ist etwas anderes.' },
      { titel: 'Reihe von Kerben im Geländer', text: 'Eine Kerbe pro Ankunft. Ich habe bei zweihundertdreißig aufgehört zu zählen. Nicht weil es weniger wurden.' },
      { titel: 'Angebundener Zettel, verblasst', text: 'An den, der das findet: mein Name war Sedra. Ich habe den Himmel geschwärzt. Ich habe ein Loch gelassen. Beides war ich. Frag mich nicht, was schwerer wiegt.' },
    ],
    ankunft: 'Ein Steg, der ins Graue läuft. Wellen schlagen leise gegen die Pfähle, und am Ufer liegen Schuhe, ordentlich nebeneinander gestellt.',
  },

  '0,3': {
    ort: 'Stille Bucht',
    inschriften: [
      { titel: 'Auf dem inneren Eisring', text: 'Hier ist es so ruhig, dass man den eigenen Puls hört. Die Archivare nannten diesen Ort die Prüfung. Wer hier nichts denkt, hat nichts zu verbergen.' },
      { titel: 'Ins Eis gedrückt, weich geworden', text: 'Ich saß drei Nächte hier. In der dritten habe ich verstanden, dass ich nicht Angst vor dem Wissen hatte, sondern vor den Leuten, die es benutzen.' },
      { titel: 'Kleiner Stein am Rand', text: 'Für die elf Familien. Wir haben es zu spaet gemerkt. Danach haben wir alles falsch gemacht, aber wir haben es gemerkt.' },
    ],
    ankunft: 'Ringe aus Eis, ineinander gelegt, und kein Ton. Nicht Wind, nicht Wasser. Nur deine Ohren, die etwas suchen und nichts finden.',
  },

  '4,1': {
    ort: 'Wandernde Dünen',
    inschriften: [
      { titel: 'Freigewehter Grenzstein', text: 'Der Sand vergisst jede Spur innerhalb einer Nacht. Der Index hat lange geglaubt, das sei ein Vorbild. Sie haben nur nie gefragt, wohin der Sand geht.' },
      { titel: 'Beschriftete Blechplatte', text: 'Route der schweren Wagen, viertes Jahr nach dem Brand. Ziel: Kammer unter dem Feld. Nicht Vernichtung. Verwahrung. Unterschrift unleserlich.' },
      { titel: 'Mit dem Finger geschrieben, halb verweht', text: 'Wenn du das noch lesen kannst, bist du schnell genug hier.' },
    ],
    ankunft: 'Der Sand läuft dir über die Schuhe wie Wasser. Hinter dir verschwindet dein eigener Weg, während du noch hinsiehst.',
  },

  '4,2': {
    ort: 'Die stumme Pyramide',
    inschriften: [
      { titel: 'Über dem Eingang', text: 'Sie ist leer. Sie war immer leer. Wer eine Kammer baut, ohne etwas hineinzulegen, baut kein Grab. Er baut eine Frage.' },
      { titel: 'Innen, auf halber Höhe', text: 'Die Erbauer wussten schon, was Menschen mit halben Antworten tun. Also gaben sie gar keine. Der Index hat das gelesen und die falsche Lehre gezogen.' },
      { titel: 'Ganz oben, sehr klein', text: 'Nichts zu sagen ist auch eine Art zu lügen. Wir haben es trotzdem getan. Verzeiht uns, wenn ihr klüger seid.' },
    ],
    ankunft: 'Ein Raum ohne Inhalt, größer als er von außen wirkt. Deine Schritte kommen von allen vier Wänden gleichzeitig zurück.',
  },

  '4,3': {
    ort: 'Obsidianfeld',
    inschriften: [
      { titel: 'In eine Glasplatte geritzt', text: 'Das hier war Hitze, die zu schnell kalt wurde. So sieht eine Entscheidung aus, die niemand noch einmal durchdacht hat.' },
      { titel: 'Auf einer aufgerichteten Scherbe', text: 'Der Orden hat sich hier gegründet. In einer Nacht. Nach einer Katastrophe. Alle wichtigen Fehler wurden nachts nach Katastrophen gemacht.' },
      { titel: 'Bodenplatte, Ecke fehlt', text: 'Erster Satz der Ordnung: Wissen ohne Rahmen tötet. Zweiter Satz: also nehmen wir das Wissen. Dritter Satz fehlt. Es hat nie einen dritten Satz gegeben.' },
    ],
    ankunft: 'Schwarzes Glas bis zum Horizont, das dein Bild in tausend schiefe Stücke schneidet. Unter den Sohlen knackt es bei jedem Schritt.',
  },

  '3,4': {
    ort: 'Adern des Glutschlunds',
    inschriften: [
      { titel: 'An einer Engstelle', text: 'Diese Gänge hat niemand gegraben. Sie waren da. Der Index hat sie nur benutzt, um Dinge dahin zu bringen, wo keiner nachsieht.' },
      { titel: 'Kreidezeichen, verwischt', text: 'Zählung im achten Jahr nach dem Brand: hundertneunzehn Kisten unten, vierzig oben, sechs verschwunden. Die sechs sind das Interessante.' },
      { titel: 'Kritzelei in einer Nische', text: 'Ich bin Archivarin. Ich trage Kisten runter und ich schreibe auf, was drin ist. Beides gleichzeitig ist verboten. Ich mache trotzdem beides.' },
    ],
    ankunft: 'Die Gänge werden so eng, dass du dich drehen musst. Es ist heiß, die Wände sind warm wie Haut, und irgendwo tropft etwas Schweres.',
  },

  '2,4': {
    ort: 'Die Tiefe',
    inschriften: [
      { titel: 'Erster Monolith', text: 'Hier steht, was gerettet wurde. Nicht vom Feuer. Vor den Menschen. Der Index hat es nicht verbrannt. Er hat es weggetragen und daneben gestanden.' },
      { titel: 'Zweiter Monolith', text: 'Wir haben gesehen, was mit halbem Wissen geschieht. Erfundene Zeichen, verkaufte Rettung, Familien ohne Winter. Wir haben die Ursache bekämpft statt der Lüge.' },
      { titel: 'Dritter Monolith, unfertig', text: 'Wenn einer das liest, hat unsere Ordnung versagt. Gut. Nimm alles mit. Aber nimm auch das mit: wir waren nicht dumm. Wir hatten Angst. Der Stein endet mitten im Wort.' },
    ],
    ankunft: 'Unter der letzten Treppe stehen Steine in einem Kreis, höher als das Tor, durch das du kamst. Die Luft ist völlig unbewegt und schmeckt nach Eisen.',
  },

};

// Stimmen des Index, erscheinen zufällig beim Erkunden, je nach Fortschritt
G.INDEX_STIMMEN = {
  frueh: [
    'Aufzeichnung läuft. Ihr Aufenthalt in diesem Bereich ist nicht vorgesehen.',
    'Sammeln ist Sorgfaltsbruch. Legen Sie ab, was Sie tragen, und gehen Sie zurück.',
    'Wissen ohne Rahmen tötet. Das ist kein Spruch. Das ist ein Ergebnis.',
    'Sie halten Bruchstücke. Bruchstücke ergeben Geschichten, und Geschichten ergeben Schaden.',
    'Erlass vierzehn: Wer Muster sieht, meldet sich. Wer sich nicht meldet, wird gemeldet.',
  ],
  mitte: [
    'Sie haben jetzt genug, um sich sicher zu fühlen. Genau da fängt es an, gefährlich zu werden.',
    'Wir kennen Ihren Weg. Nicht Ihren Namen. Noch nicht. Kehren Sie um, dann bleibt das so.',
    'Es gab vor Ihnen andere. Sie haben auch gesammelt. Fragen Sie in der Stadt nach ihnen. Man wird Sie ansehen und nichts sagen.',
    'Was Sie da lesen, hat schon einmal Menschen umgebracht. Nicht das Papier. Die Leute, die es benutzt haben.',
    'Wir haben nicht angefangen. Wir haben aufgeräumt. Den Unterschied merkt man erst, wenn beides gleich aussieht.',
  ],
  spaet: [
    'Sie sind zu weit unten. Hier hört unsere Ordnung auf, und wir wussten das immer.',
    'Fragen Sie nicht, ob wir recht hatten. Fragen Sie, was wir gesehen haben, bevor wir das beschlossen.',
    'Manche von uns haben Dinge behalten statt sie zu verbrennen. Das war Ungehorsam. Es war auch das Einzige, was blieb.',
    'Sedra hat ein Loch in der Kuppel gelassen. Wir haben es gesehen. Wir haben es gelassen.',
    'Wenn Sie das alles zusammensetzen, werden Sie uns hassen. Setzen Sie es trotzdem zusammen. Dann hassen Sie wenigstens das Richtige.',
  ],
};

// Was die Mustersucher sagen, wenn der Spieler viel gesammelt hat
G.SUCHER_STIMMEN = [
  'Du trägst mehr, als Bram in zwei Jahren zusammenbekommen hat. Setz dich, iss was, dann red weiter.',
  'Tova sagt, du sollst nichts sortieren, solange du müde bist. Müdigkeit erfindet Zusammenhänge.',
  'Wir feiern hier nicht, wenn einer viel findet. Wir prüfen es. Das ist unsere Art zu feiern.',
  'Pass auf mit dem, was du unten geholt hast. Es macht die Grauen kleiner, als du sie haben willst.',
  'Irgendwann wirst du merken, dass der schwerste Teil nicht das Sammeln ist. Es ist, ehrlich zu bleiben, was du noch nicht weißt.',
];
