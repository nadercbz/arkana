'use strict';
// Wiederkehrende Figuren. Ihre Haltung entwickelt sich mit dem Fortschritt.
G.FIGUREN = {

  weber: {
    name: 'Archivarin Weber',
    rolle: 'Feldarchivarin des Index',
    // Stufen nach gesammelten Fragmenten: 0 bis 15, 16 bis 40, 41 bis 70, ab 71
    stufen: [
      { ab: 0, zeilen: [
        'Bitte treten Sie einen Schritt zurück. Der Boden hier ist noch nicht freigegeben.',
        'Ich nehme nur auf, was ich sehe. Was ich aufnehme, wird geprüft. Was geprüft ist, wird verwahrt. Das ist alles.',
        'Sie tragen Asche an den Schuhen. Waren Sie unten in den Sälen. Nein, sagen Sie nichts, ich muss es dann notieren.',
        'Der Mantel ist grau, damit man mich nicht mit jemandem verwechselt, der etwas verspricht.',
      ] },
      { ab: 16, zeilen: [
        'Sie sammeln. Gut. Ich sage nicht, dass es erlaubt ist. Ich sage, dass ich es verstehe.',
        'Vor dem Brand durfte jeder lesen. Man hat es uns später so erzählt, als wäre das der Fehler gewesen.',
        'Ich habe einen Mann gekannt, der aus vier Zeilen eine ganze Ordnung gebaut hat. Die Ordnung hat neunzig Leute gekostet. Er hatte die vier Zeilen richtig gelesen.',
        'Das ist das Unangenehme. Er hatte recht und es war trotzdem falsch.',
      ] },
      { ab: 41, zeilen: [
        'Ich habe letzte Woche eine Fundstelle freigegeben, die ich vor zwei Jahren versiegelt hätte. Ich weiß nicht, wann ich mich geändert habe.',
        'Man versiegelt nicht das Wissen. Man versiegelt die Zeit, die jemand bräuchte, um es zu verstehen. Nur hat niemand die Zeit dazugelegt.',
        'Meine Vorgesetzte fragt nicht mehr, was ich finde. Sie fragt, wen ich treffe. Das ist ein Unterschied und er gefällt mir nicht.',
        'Wenn Sie mich das nächste Mal sehen und ich Sie nicht grüße, dann liegt es nicht an Ihnen.',
        'Ich verteidige nicht, wie wir es tun. Ich verteidige nur, warum. Das reicht immer seltener.',
      ] },
      { ab: 71, zeilen: [
        'Mein Name steht seit Dienstag nicht mehr in der Dienstliste. Ich stehe hier und die Liste ist trotzdem vollständig.',
        'Sie erkennen mich. Behalten Sie das bitte. Nicht aufschreiben, das findet man. Behalten.',
        'Ich habe die Formulare selbst mitentworfen. Es ist ein sauberes Verfahren. Es tut sauber weh.',
        'Weber. W, E, B, E, R. Sagen Sie es einmal laut, wenn Sie draußen sind. Mehr will ich nicht.',
      ] },
    ],
    haltung: {
      glaube: 'Sie nehmen alles an, ohne zu wiegen. Genau davor haben wir Angst, und genau deshalb sind wir gefährlich geworden.',
      zweifel: 'Sie prüfen jedes Stück. Das ist die Arbeit, die wir Ihnen weggenommen haben. Nehmen Sie sie sich zurück.',
      gleichgewicht: 'Sie glauben und Sie prüfen. Wenn das jemand vor dem Brand gemacht hätte, wäre ich heute Lehrerin.',
    },
  },

  ilva: {
    name: 'Ilva Kern',
    rolle: 'Kartografin der Mustersucher',
    stufen: [
      { ab: 0, zeilen: [
        'Nicht ins Licht stellen, Sie werfen einen Schatten auf mein Blatt.',
        'Karten kosten. Nicht Geld. Sie kosten, dass ich hingehen musste.',
        'Wenn Sie fragen wollen, wo etwas ist, fragen Sie lieber, wann.',
      ] },
      { ab: 16, zeilen: [
        'Sie haben ein Fragment aus dem Spiegelhof. Zeigen Sie. Nicht geben, nur zeigen.',
        'Der Mondgarten liegt seit dem Frühjahr acht Schritte weiter westlich. Niemand hat ihn getragen.',
        'Ich zeichne keine Orte. Ich zeichne, wo Orte gerade Lust haben zu sein.',
        'Vor dem Brand gab es angeblich eine Karte, auf der sich nichts bewegt hat. Ich halte das für eine Geschichte für Kinder.',
      ] },
      { ab: 41, zeilen: [
        'Ich habe heute Nacht die Bucht gezeichnet. Ich war nie in der Bucht. Die Zeichnung stimmt.',
        'Fragen Sie mich nicht, wie. Ich habe die Hand angesehen, sie hat einfach weitergemacht.',
        'Zwei meiner Blätter zeigen Straßen, die es erst nächstes Jahr geben kann. Ich habe sie umgedreht und beschwert.',
        'Der Index sagt, man verliert sich, wenn man zu weit vorausliest. Ich habe das immer für eine Drohung gehalten. Es war eine Warnung.',
      ] },
      { ab: 71, zeilen: [
        'Sehen Sie meine Hände an. Der Rand ist weich. Wie Tinte, die zu lange im Wasser lag.',
        'Ich weiß noch alle Wege. Ich weiß nur nicht mehr sicher, welcher davon meiner war.',
        'Nehmen Sie die Mappe. Wenn ich sie behalte, zeichne ich mich irgendwann ein und dann bin ich nur noch ein Ort.',
        'Der Index hat nicht gelogen. Das ist der Teil, an dem ich am längsten gekaut habe.',
        'Wenn Sie eine Karte von mir finden, auf der ich draufstehe, verbrennen Sie sie nicht. Falten Sie sie nur zu.',
      ] },
    ],
    haltung: {
      glaube: 'Sie schlucken alles. Passen Sie auf. Ich habe auch mit Schlucken angefangen und jetzt zeichne ich Orte, an denen ich nicht war.',
      zweifel: 'Sie zweifeln viel. Gut. Zweifel ist ein Gewicht am Bein, und ohne Gewicht hebt es einen ab.',
      gleichgewicht: 'Sie halten das Gleichgewicht besser als ich. Sagen Sie mir irgendwann, wie das geht, ich schreibe es an den Rand.',
    },
  },

  kes: {
    name: 'Kes',
    rolle: 'Kind, entschrieben aber nicht ganz',
    stufen: [
      { ab: 0, zeilen: [
        'Du bist neu. Neue riechen anders. Nach draußen.',
        'Willst du wetten. Ich kann bis zur Mauer und zurück, bevor du blinzelst.',
        'Ich darf hier eigentlich nicht sein. Aber eigentlich bin ich ja auch nicht.',
      ] },
      { ab: 16, zeilen: [
        'Du hast mich wiedererkannt. Das machen fast alle nicht beim zweiten Mal.',
        'Ich habe gestern im Sumpf gesessen und heute im Berg. Ich weiß nicht, wie ich rüberkomme. Ich bin einfach schon da.',
        'Meine Mutter hat gearbeitet, wo die Bücher waren. Danach war sie nicht mehr meine Mutter. Sie war nur noch eine Frau, die freundlich war.',
        'Ich habe kein Bild von ihr. Ich habe ein Geräusch. Sie hat beim Gehen immer ein bisschen geschleift.',
      ] },
      { ab: 41, zeilen: [
        'Sie haben mich rausgestrichen, weil ich gesagt habe, was in dem Buch steht. Ich war sieben. Ich habe nur laut gelesen.',
        'Rausstreichen geht nicht ganz. Es bleibt ein Fussel. Ich bin der Fussel.',
        'Manchmal wache ich auf und weiß meinen Namen nicht mehr, und dann sage ich ihn hundertmal, bis er wieder klebt.',
        'Kannst du ihn auch sagen. Nur einmal. Dann bin ich ein bisschen fester.',
      ] },
      { ab: 71, zeilen: [
        'Ich werde nicht größer. Das ist nicht schlimm. Aber ich werde auch nicht müde, und das ist schlimm.',
        'Wenn du hier fertig bist, gehst du wieder. Alle gehen wieder. Ich frage nur, ob du mich mitnimmst im Kopf.',
        'Du musst nichts machen. Nur nicht vergessen. Vergessen ist die zweite Hälfte vom Entschreiben, und die machen nicht sie, die machen wir.',
        'Sag Kes. So heißt der Rest von mir.',
      ] },
    ],
    haltung: {
      glaube: 'Du glaubst schnell. Ich auch. Deshalb sind wir beide da, wo wir sind.',
      zweifel: 'Du prüfst immer erst. Prüf mich ruhig auch. Ich bin trotzdem noch da, wenn du fertig bist.',
      gleichgewicht: 'Du bist so einer, der zuhört und trotzdem nachdenkt. Von denen gibt es hier fast keine mehr.',
    },
  },

  aldan: {
    name: 'Aldan Roh',
    rolle: 'Kopist des Index',
    stufen: [
      { ab: 0, zeilen: [
        'Ich kopiere. Mehr ist meine Stelle nicht. Fragen bitte an die Aufsicht.',
        'Dreißig Jahre dasselbe Pult. Man sieht es am Holz, da ist eine Mulde für den Ellenbogen.',
        'Was ich abschreibe, geht danach weg. Wohin, das steht nicht in meinem Formular.',
      ] },
      { ab: 16, zeilen: [
        'Sie fragen zu freundlich. Bei freundlichen Fragen rede ich zu viel, das ist bekannt.',
        'Sie vernichten das Original, sobald die Kopie liegt. Sauber, ordentlich, mit zwei Unterschriften.',
        'Also ist die Kopie die Welt. Und die Kopie mache ich. Denken Sie das einmal zu Ende und dann schlafen Sie mal gut.',
        'Ich mache Fehler. Nicht immer aus Versehen.',
      ] },
      { ab: 41, zeilen: [
        'Ein falscher Buchstabe, und ein Satz überlebt die Prüfung, weil er anders klingt als der verbotene. Das war meine Idee. Ich war stolz darauf.',
        'Ich habe ganze Absätze als Rechenfehler getarnt. Zahlen prüft niemand gern.',
        'Ich habe geglaubt, ich rette etwas. Ich habe vielleicht nur etwas verbogen und in die Zukunft geschoben.',
        'Der Index hat nach dem Brand behauptet, halbes Wissen habe die Sechs Städte gekostet. Ich habe das Protokoll kopiert. Es stand tatsächlich so drin.',
      ] },
      { ab: 71, zeilen: [
        'Ich habe eine Liste geführt, welche Fehler Absicht waren. Die Liste ist weg. Ich habe sie selbst kopiert und das Original ging weg.',
        'Jetzt lese ich meine eigene Arbeit und weiß nicht, ob das da Wahrheit ist oder mein Zittern von vor elf Jahren.',
        'Wenn Sie irgendwo einen Text finden, in dem ein Name doppelt steht, dann bin ich das gewesen. Ich glaube. Ich glaube.',
        'Sie sammeln jetzt lauter Sätze, die vielleicht von mir sind statt von der Welt. Es tut mir leid und ich würde es wieder tun.',
      ] },
    ],
    haltung: {
      glaube: 'Sie glauben, was Sie lesen. Ich habe geschrieben, was Sie lesen. Bitte glauben Sie ein bisschen weniger.',
      zweifel: 'Sie prüfen nach. Endlich einer. Prüfen Sie besonders die Stellen, die zu glatt klingen. Die glatten sind meine.',
      gleichgewicht: 'Sie wägen ab. Genau das war unser Beruf, bevor daraus Verwaltung wurde.',
    },
  },

  ossa: {
    name: 'Ossa',
    rolle: 'Fährfrau',
    stufen: [
      { ab: 0, zeilen: [
        'Einsteigen. Nicht in die Mitte, da liegt das Wasser.',
        'Geld nehme ich nicht. Sagen Sie mir etwas, das ich noch nicht weiß, dann sind wir quitt.',
        'Nein. Das wusste ich. Nochmal.',
      ] },
      { ab: 16, zeilen: [
        'Sie waren im Sandtor. Ihre Auskunft war brauchbar. Setzen Sie sich weiter vorn.',
        'Ich fahre seit dem Brand. Damals kamen sie nachts, in Reihen, mit Kisten. Bezahlt haben sie mit Schweigen, und Schweigen ist keine Auskunft.',
        'Die Kisten waren schwer und trocken. Wer Bücher verbrennt, trägt sie nicht erst über Wasser.',
      ] },
      { ab: 41, zeilen: [
        'Sie sehen müde aus. Trinken Sie was, es ist nur Wasser mit Salz, aber es hilft.',
        'Ich merke mir jeden, der übersetzt. Nicht das Gesicht. Den Namen. Gesichter ändern sie.',
        'Manchmal steht einer am Ufer, den es amtlich nicht gibt. Ich fahre ihn trotzdem. Meine Fähre fragt keine Papiere.',
        'Eine Kartografin fahre ich seit Jahren. In letzter Zeit wiegt sie weniger. Das Boot lügt nicht bei sowas.',
      ] },
      { ab: 71, zeilen: [
        'Setzen Sie sich hierher, neben mich. Ist wärmer.',
        'Ich habe vierhundertzwölf Namen im Kopf, die sonst nirgends mehr stehen. Ich sage sie beim Rudern auf. Deshalb rudere ich langsam.',
        'Wenn Sie einmal nicht mehr auftauchen, sage ich Ihren auch mit. Das ist kein Trost, das ist Buchhaltung.',
        'Der Index löscht Papier. Papier ist nicht der Ort, wo Menschen wohnen.',
        'Aussteigen. Und drehen Sie sich nicht um, das macht den Rücken nass.',
      ] },
    ],
    haltung: {
      glaube: 'Sie nehmen alles mit, was man Ihnen in die Hand drückt. Das Boot kentert nicht am Gewicht, sondern an der Verteilung.',
      zweifel: 'Sie fragen viel nach. Bei mir dürfen Sie das. Bei anderen kostet es Sie den Platz im Boot.',
      gleichgewicht: 'Sie sitzen ruhig. Ruhig sitzen können die wenigsten, die etwas suchen.',
    },
  },

};

// Ortsgebundene Nebenfiguren. Zwei Stufen, gebunden an ihren Ort.
G.FIGUREN.wache = {
  name: 'Torwache Brandt',
  rolle: 'Torwache der Aschenstadt',
  ort: 'Aschenstadt',
  stufen: [
    { ab: 0, zeilen: [
      'Taschen auf. Nicht wegen Ihnen. Wegen der Liste.',
      'Sammeln ist Sorgfaltsbruch. Steht am Pfosten, lesen Sie selbst, ich sage es zwanzigmal am Tag.',
      'Weitergehen. Rechts halten. Nicht die Wand anfassen, die ist noch nicht geprüft.',
    ] },
    { ab: 41, zeilen: [
      'Sie schon wieder. Ich sehe nicht in Ihre Tasche. Ich habe heute eine Zahl zu erfüllen und die habe ich.',
      'Mein Vater stand an diesem Tor in der Brandnacht. Er sagt, das Feuer kam von innen und ging nach außen. Innen war abgeschlossen.',
      'Sie haben das nicht von mir. Ich habe Ihnen nur die Uhrzeit gesagt.',
    ] },
  ],
};

G.FIGUREN.haendler = {
  name: 'Mareth Sull',
  rolle: 'Fragmentehändler',
  ort: 'Markt der Mustersucher',
  stufen: [
    { ab: 0, zeilen: [
      'Alles echt, alles geprüft, fragen Sie nicht von wem.',
      'Drei Stück für den Preis von zwei, aber das dritte ist eine Wetterliste. Ich sage es fair.',
      'Wenn Sie was Halbes kaufen, kaufen Sie die andere Hälfte auch bei mir. Das ist mein ganzes Geschäftsmodell.',
    ] },
    { ab: 41, zeilen: [
      'Für Sie hole ich das aus der Kiste unter dem Tisch. Da liegt, was ich niemandem zeige, der noch alles glaubt.',
      'Neunzig Prozent von dem Zeug hier ist Müll. Das weiß ich. Der Index weiß es auch, deshalb jagt er uns nicht ernsthaft. Wir sind der Lärm über dem Signal.',
      'Die zehn Prozent sind das Problem. Die zehn Prozent sind, warum ich jede Nacht woanders schlafe.',
    ] },
  ],
};

G.FIGUREN.archivar_alt = {
  name: 'Bibliothekar Hennig',
  rolle: 'Alter Bibliothekar',
  ort: 'Verbrannte Bibliothek',
  stufen: [
    { ab: 0, zeilen: [
      'Leise. Ich weiß, es ist alles verbrannt. Trotzdem leise.',
      'Ich sortiere noch. Regal vier, Reihe zwei. Da liegt nichts, aber die Ordnung stimmt wieder.',
      'Sie wollen ein Buch. Ich habe Asche in zwölf Sorten. Suchen Sie sich eine aus.',
    ] },
    { ab: 41, zeilen: [
      'Die Nacht war windstill. Ein Haus brennt bei Windstille nicht in allen zwölf Sälen gleichzeitig.',
      'Ich war Verwalter der Sperrsäle. Ich habe die Türen selbst verschlossen, weil man es mir befahl, und am nächsten Morgen war der Schlüssel weg und die Schuld bei mir.',
      'Ich sortiere, weil es das Einzige ist, was ich damals richtig gemacht habe.',
    ] },
  ],
};

G.FIGUREN.hoerer = {
  name: 'Der Hörer',
  rolle: 'Lauscher in der Kristallkaverne',
  ort: 'Kristallkaverne',
  stufen: [
    { ab: 0, zeilen: [
      'Nicht sprechen. Der Stein nimmt alles auf und gibt es später falsch zurück.',
      'Ich sitze hier und höre. Manchmal zwei Wochen für einen Satz.',
      'Sie atmen zu laut. Alle atmen zu laut.',
    ] },
    { ab: 41, zeilen: [
      'Ich habe gestern Ihren Namen im Kristall gehört. Sie haben ihn hier nie gesagt.',
      'Der Index hat die Kaverne dreimal versiegeln lassen. Der Stein hat weitergespeichert. Man kann Wände zumauern, aber nicht das Material.',
      'Was ich höre, sind meistens Entschuldigungen. Sehr viele Entschuldigungen aus dem Jahr des Brandes.',
    ] },
  ],
};

G.FIGUREN.deuterin = {
  name: 'Sternendeuterin Yrsa',
  rolle: 'Sternendeuterin',
  ort: 'Sternenwarte',
  stufen: [
    { ab: 0, zeilen: [
      'Kopf aus dem Rohr. Danke.',
      'Ich sage Ihnen keine Zukunft. Ich sage Ihnen, wann etwas wiederkommt. Das ist etwas anderes und viel langweiliger.',
      'Der Himmel dreht sich ordentlich. Als Einziger hier.',
    ] },
    { ab: 41, zeilen: [
      'Die Tafeln aus der Zeit vor dem Brand rechnen mit einem Stern, der heute nicht mehr da ist. Ich habe das dreimal nachgerechnet.',
      'Entweder haben sie sich geirrt, oder etwas ist verschwunden, das größer war als eine Bibliothek.',
      'Ich habe die Rechnung eingereicht. Sie kam zurück mit dem Vermerk, sie sei nicht prüfbar. Sie war prüfbar. Ich habe sie ja geprüft.',
    ] },
  ],
};

G.FIGUREN.gaertnerin = {
  name: 'Mondgärtnerin Tave',
  rolle: 'Mondgärtnerin',
  ort: 'Mondgarten',
  stufen: [
    { ab: 0, zeilen: [
      'Nicht auf die weißen Beete treten. Die schlafen noch.',
      'Ich pflanze nach Mond, nicht nach Kalender. Der Kalender ist dreimal geändert worden, der Mond nicht.',
      'Wenn Sie etwas mitnehmen wollen, nehmen Sie Samen, keine Blüte. Blüten lügen schnell.',
    ] },
    { ab: 41, zeilen: [
      'Die Pflanzen hier stammen aus dem Innenhof des Archivs. Jemand hat sie in der Brandnacht rausgetragen, statt Bücher.',
      'Manchmal denke ich, das war der klügste Mensch der Nacht. Manchmal denke ich, er war der feigste.',
      'Sie tragen viel im Kopf. Setzen Sie sich hin, bis der Mond über die Mauer ist. Das ist keine Weisheit, das ist Erschöpfung, und ich sehe sie Ihnen an.',
    ] },
  ],
};

G.FIGUREN.schmied = {
  name: 'Schmied Corr',
  rolle: 'Schmied am Glutschlund',
  ort: 'Glutschlund',
  stufen: [
    { ab: 0, zeilen: [
      'Weiter weg vom Loch. Die Hitze frisst Augenbrauen und dann Gesichter.',
      'Ich schmiede Siegel. Ja, für die. Man muss essen.',
      'Was Sie da tragen, schmilzt hier drin in vier Herzschlägen. Passen Sie auf sich auf.',
    ] },
    { ab: 41, zeilen: [
      'Jedes Siegel bekommt eine Kerbe an der Innenseite. Meine Kerbe. Man kann später sehen, wann etwas geschlossen wurde und von wem.',
      'Das ist nicht Widerstand. Das ist nur, dass ich nicht namenlos arbeiten will.',
      'Sie werfen die aussortierten Fragmente hier rein. Ich sehe sie fallen. Manchmal fische ich eins raus, wenn keiner schaut, und es ist nur ein Rezept für Brot.',
    ] },
  ],
};

G.FIGUREN.nomade = {
  name: 'Nomade Sef',
  rolle: 'Wüstennomade',
  ort: 'Wandernde Dünen',
  stufen: [
    { ab: 0, zeilen: [
      'Wasser gibt es. Fragen gibt es nach dem Wasser.',
      'Karten helfen hier nichts. Die Dünen ziehen weiter, wir ziehen mit. Wer stehenbleibt, wird zugedeckt.',
      'Gehen Sie hinter mir. Nicht neben mir, ich sehe dann Ihre Spur nicht.',
    ] },
    { ab: 41, zeilen: [
      'Unter dem Sand liegen Straßen. Wir gehen manchmal drüber und hören es am Klang.',
      'Meine Großmutter sagte, hier standen Städte, bevor jemand beschlossen hat, dass sie nie standen. Sie hat es mir nur einmal gesagt und danach nie wieder.',
      'Der Index schickt keine Leute in die Dünen. Man kann Sand nicht versiegeln, und das ärgert sie.',
    ] },
  ],
};

G.FIGUREN.waechter = {
  name: 'Wächter Onn',
  rolle: 'Wächter der Pyramide',
  ort: 'Die stumme Pyramide',
  stufen: [
    { ab: 0, zeilen: [
      'Bis hierher. Nicht weiter.',
      'Es gibt keine Tür. Ich bewache trotzdem. Fragen Sie nicht, das habe ich mir längst selbst gefragt.',
      'Drinnen ist es still. Man hört die Stille durch den Stein, das ist keine Redensart, das ist ein Geräusch.',
    ] },
    { ab: 41, zeilen: [
      'Mein Posten wurde vor dem Brand eingerichtet. Der Index hat ihn übernommen, nicht erfunden. Das steht in keiner Akte.',
      'Also war hier etwas, das schon vorher bewacht werden musste. Von Leuten, die es besser wussten als wir.',
      'Manchmal wechselt die Ostseite die Farbe. Ich melde es. Es kommt nie eine Antwort.',
    ] },
  ],
};

G.FIGUREN.faehrmann = {
  name: 'Sumpffährmann Duul',
  rolle: 'Sumpffährmann',
  ort: 'Nebelsumpf',
  stufen: [
    { ab: 0, zeilen: [
      'Hände im Boot. Was hier greift, gibt nicht wieder her.',
      'Der Nebel steht seit vierzehn Jahren. Vorher gab es hier Felder, sagt man.',
      'Reden Sie ruhig. Nur nicht die Namen von Lebenden.',
    ] },
    { ab: 41, zeilen: [
      'Ich sammle, was im Schilf hängt. Papier, Blech, Schuhe. Das meiste ist amtlich gestempelt.',
      'Man wirft es nicht ins Feuer, man wirft es ins Wasser. Wasser gibt keine Rauchsäule, die man von der Stadt aus sieht.',
      'Ich habe eine Kiste voll. Ich kann nicht lesen. Vielleicht ist das der Grund, warum ich noch hier bin.',
    ] },
  ],
};

G.FIGUREN.bergmann = {
  name: 'Bergmann Kolt',
  rolle: 'Bergmann in den Adern',
  ort: 'Wurzelhain',
  stufen: [
    { ab: 0, zeilen: [
      'Helm auf oder gar nicht rein.',
      'Wir graben nach Adern. Erz, meistens. Manchmal was anderes.',
      'Unten redet keiner. Nicht aus Aberglauben. Man braucht die Luft.',
    ] },
    { ab: 41, zeilen: [
      'In Sohle sieben sind wir auf Mauerwerk gestoßen. Sauber gesetzt, tiefer als alles, was es geben dürfte.',
      'Der Index kam am selben Abend und hat den Stollen verfüllt. Am selben Abend. So schnell ist niemand, der nicht vorher Bescheid weiß.',
      'Zwei von meinen Leuten stehen seitdem nicht mehr in der Lohnliste. Sie stehen aber morgens neben mir.',
    ] },
  ],
};

G.FIGUREN.stimme = {
  name: 'Die Stimme',
  rolle: 'Körperlose Stimme in der Tiefe',
  ort: 'Die Tiefe',
  stufen: [
    { ab: 0, zeilen: [
      'Da ist jemand. Gut. Es war lange niemand.',
      'Ich habe keinen Mund. Sie hören mich trotzdem. Denken Sie darüber später nach, jetzt ist es unpraktisch.',
      'Vorsicht auf der dritten Stufe. Die ist nicht mehr da.',
    ] },
    { ab: 41, zeilen: [
      'Ich war einmal mehrere. Wir haben zusammen gearbeitet, und dann hat man uns alle am selben Tag gestrichen.',
      'Was übrig blieb, ist zusammengelaufen. Ich bin kein Geist. Ich bin ein Rest von einer Belegschaft.',
      'Fragen Sie mich nach dem Brand. Ich weiß es. Ich weiß nur nicht mehr, ob ich zugesehen oder gezündet habe.',
      'Beides stimmt hier unten gleichzeitig, und das ist genau das, wovor sie die Leute schützen wollten.',
    ] },
  ],
};

// Zuordnung Region zu Figur. Mehrere Figuren pro Region sind erlaubt.
G.FIGUR_ORTE = {
  'Aschenstadt': ['wache', 'weber'],
  'Markt der Mustersucher': ['haendler', 'ilva'],
  'Spiegelhof': ['weber', 'kes'],
  'Sternenwarte': ['deuterin', 'ilva'],
  'Kristallkaverne': ['hoerer', 'kes'],
  'Verbrannte Bibliothek': ['archivar_alt', 'aldan'],
  'Mondgarten': ['gaertnerin', 'ossa'],
  'Sandtor': ['wache', 'aldan'],
  'Die stumme Pyramide': ['waechter', 'ilva'],
  'Wandernde Dünen': ['nomade', 'kes'],
  'Glutschlund': ['schmied', 'weber'],
  'Wurzelhain': ['bergmann', 'kes'],
  'Nebelsumpf': ['faehrmann', 'ossa'],
  'Stille Bucht': ['ossa', 'ilva'],
  'Die Tiefe': ['stimme', 'aldan'],
};
