# SPEC.md · FitZone Berlin (K2 – Lisa Sommer)

**Stand:** v3, nach Meeting 1 (Nachrichten 1–12) und Meeting 2 (Nachrichten 13–20)
**Kontext:** FitZone ist ein Fitness-Studio mit Online-Kursen und etwa 600 Mitgliedern, gegründet 2023. Kursbuchungen, Stornierungen und die Warteliste laufen heute über eine Excel-Tabelle und WhatsApp-Gruppen. Lisa verbringt abends 30–40 Minuten mit der Handpflege. Die Mitglieder wollen online buchen.

Die Nummern in Klammern verweisen auf die Nachricht im Interview, aus der die Aussage stammt. Mit „Annahme“ sind Entscheidungen markiert, die nicht direkt von Lisa stammen.

---

## Entitäten

1. **Mitglied:** mitglied_nr (Schlüssel), name, kontakt (WhatsApp, E-Mail), eintrittsdatum
2. **Mitgliedschaft:** mitgliedschaft_id (Schlüssel), mitglied → Mitglied, tarif → Tarif, beginn, vertragsende, status (aktiv / pausiert / gekündigt / inaktiv), buchungssperre_bis
3. **Tarif:** tarif_id (Schlüssel), name (Basic / Plus / Premium), monatsbeitrag (Höhe offen), max_buchungen_pro_monat (Basic 5, Plus offen, Premium unbegrenzt), videozugang (Basic nein, Plus und Premium ja), stornofrei (nur Premium)
4. **Kursart:** kursart_id (Schlüssel), name (Yoga, Pilates, Spinning, HIIT, Bodyworkout/Functional), max_teilnehmer (Yoga 15, Spinning 12, Bodyworkout/Functional 20)
5. **Kurstermin:** termin_id (Schlüssel), kursart → Kursart, trainer → Trainer, datum_uhrzeit, format (Studio / Online), zoom_link (nur Online)
6. **Buchung:** buchung_id (Schlüssel), mitglied → Mitglied, kurstermin → Kurstermin, status (gebucht / Warteliste / storniert), zeitpunkt (bestimmt die Reihenfolge auf der Warteliste), storniert_am, anwesenheit (teilgenommen / nicht erschienen), stornogebuehr (Pauschale, falls fällig), gebuehr_status (offen / bezahlt / erlassen), erlass_grund
7. **Trainer:** trainer_id (Schlüssel), name, anstellungsart (fest / Honorar)
8. **Pause:** pause_id (Schlüssel), mitgliedschaft → Mitgliedschaft, von, bis

**Annahmen zu den Entitäten:**
- Die Warteliste ist keine eigene Entität, sondern ein Status der Buchung. Die Reihenfolge ergibt sich aus dem Zeitpunkt.
- Die Stornogebühr ist ein Attribut der Buchung, damit das Modell bei 8 Entitäten bleibt. Lisa will trotzdem sehen, wer noch eine Gebühr schuldet (4).
- Die Mitgliedschaft wird als eigene Entität geführt, weil Lisa die Historie (welcher Tarif, seit wann) sauber führen will, nicht nur den aktuellen Status (17). Bei Tarifwechsel oder Rückkehr entsteht ein neuer Datensatz.
- Die Pause ist eine eigene Entität, weil die Grenze „höchstens etwa 3 Monate pro Jahr“ eine Historie der Pausen braucht (14).
- Das Teilnehmerlimit hängt an der Kursart und ist dort fest hinterlegt, so sagt es Lisa in Nachricht 13 („eine Wahrheit pro Kurstyp“).
- Die Anwesenheit erfasst der Trainer nach dem Kurs (19), die No-Show-Sperre wird als buchungssperre_bis an der Mitgliedschaft geführt (18). Beides ist meine Umsetzung der Regel von Lisa.
- Das Buchungsfenster (20) ist eine Regel und kein Attribut. Die Verfügbarkeit der Trainer gehört nicht zu v1 (Wunsch, später). Rollen und Rechte sind keine Entität.

---

## Beziehungen

Schreibweise (min,max) wie im Briefing: „A (min,max) – verb – (min,max) B“.

| Nr. | Beziehung | Typ | Anmerkung |
|---|---|---|---|
| B1 | Mitgliedschaft (1,1) – gehört zu – (1,n) Mitglied | 1:n | ein Mitglied kann mehrere Mitgliedschaften nacheinander haben, Historie (17) |
| B2 | Mitgliedschaft (1,1) – hat – (0,n) Tarif | n:1 | jede Mitgliedschaft hat genau einen Tarif (5, 15) |
| B3 | Mitglied (0,n) – bucht – (0,n) Kurstermin | **n:m**, über Buchung | Beziehungsattribute: status, zeitpunkt, anwesenheit, stornogebuehr (2, 3, 19) |
| B4 | Kurstermin (1,1) – gehört zu – (0,n) Kursart | n:1 | z. B. Spinning mittwochs 18 Uhr (2) |
| B5 | Kurstermin (1,1) – wird geleitet von – (0,n) Trainer | n:1 | (7) |
| B6 | Trainer (1,n) – kann leiten – (0,n) Kursart | **n:m** | „manche können auch zwei oder drei Sachen“ (7) |
| B7 | Pause (1,1) – gehört zu – (0,n) Mitgliedschaft | n:1 | (14) |

---

## Business Rules

**BR1 · Buchung, Kapazität und Warteliste** (2, 3, 10, 13, 20)
- Wenn ein Mitglied einen Kurs buchen will, dann ist das frühestens 7 Tage vor Kursbeginn möglich und spätestens 1 Stunde vorher. Beispiel: Yoga am Dienstag um 19 Uhr lässt sich ab dem Dienstag davor bis 18 Uhr buchen. Das ist Lisas Wunsch für die App, bisher gibt es keine feste Regel (20).
- Ausnahme (Walk-in): Wenn kurz vor dem Kurs noch Plätze frei sind, nimmt Lisa auch spontane Teilnehmer an, der Trainer bestätigt kurz. Das hat sie nicht festgelegt (siehe Offene Fragen).
- Wenn die Teilnehmerzahl eines Kurses sein Limit erreicht hat (Yoga 15, Spinning 12, Bodyworkout/Functional 20), dann kommt eine weitere Buchung auf die Warteliste. Die Warteliste hat höchstens 5 Plätze.
- Wenn ein Platz frei wird, dann rückt die Person nach, die am längsten wartet (first come, first served). Sie muss zusagen.
- Online-Kurse haben keine harte Grenze, nur eine weiche Obergrenze (Zahl offen).

**BR2 · Späte Absage und No-Show** (3, 4, 6, 9, 18, 19)
- Wenn jemand weniger als 2 Stunden vor Kursbeginn absagt, dann rückt niemand von der Warteliste nach, und es fällt eine Stornopauschale von etwa 5–10 € an, außer bei Premium.
- Wenn ein echter Notfall vorliegt (z. B. Krankenhausaufenthalt), dann kann die Gebühr einmalig erlassen werden. Das entscheidet Lisa, in ihrer Abwesenheit darf es Marie, aber nicht systematisch.
- Wenn ein Mitglied dreimal hintereinander einen gebuchten Kurs ohne Absage nicht besucht (No-Show), dann wird es automatisch für 2 Wochen für Live-Buchungen gesperrt. Wer vorher Bescheid gibt, auch kurzfristig, gilt nicht als No-Show. Ein oder zwei No-Shows sind unproblematisch.
- Voraussetzung: Der Trainer erfasst nach dem Kurs, wer teilgenommen hat und wer nicht erschienen ist.

**BR3 · Tarife** (4, 5, 15)
- Die Kurse sind im Monatsbeitrag enthalten und kosten nichts extra.
- Wenn ein Basic-Mitglied in einem Monat 5 Buchungen hat, dann sind keine weiteren möglich. Bei Neuen ist Lisa selten kulant, systematisch gilt das Limit. Plus hat mehr Buchungen (Zahl offen), Premium unbegrenzt.
- Wenn ein Mitglied Premium hat, dann zahlt es bei Stornierung nie etwas, egal wann.
- Wenn ein Mitglied Basic hat, dann hat es keinen Zugang zu den On-Demand-Videos (ab Plus).

**BR4 · Mitgliedschaftsstatus: Pause und Kündigung** (8, 12, 14, 17)
- Wenn ein Mitglied pausiert, dann sind keine Buchungen möglich, der Beitrag ruht, das Vertragsende verschiebt sich um die Pausenzeit, und offene Buchungen werden storniert. Eine Pause darf höchstens etwa 3 Monate pro Jahr dauern (informelle Grenze von Lisa). Lisa entscheidet darüber.
- Wenn ein Mitglied kündigt, dann gilt die Frist zum Monatsende mit 4 Wochen Vorlauf. Ab dem letzten Tag der Mitgliedschaft sind keine Buchungen mehr möglich. Kurse, die vorher gebucht wurden und in die Restlaufzeit fallen, darf das Mitglied noch besuchen.
- Wenn die Mitgliedschaft endet, dann wird das Mitglied inaktiv, der Datensatz wird nie gelöscht (Rückkehr, Historie). Bei Umzug oder Krankheit ist Lisa manchmal kulant bei der Frist, von Fall zu Fall.

**BR5 · Online-Kurse und Videos** (2, 5, 15)
- Wenn ein Online-Kurs gebucht wird, dann bekommt das Mitglied einen Zoom-Link per Mail.
- Live-Online-Kurse stehen laut Lisa allen Mitgliedern offen (5). Ob das auch für Basic gilt, ist offen.
- On-Demand-Videos gibt es erst ab Plus (15). Das korrigiert „Online für alle“ aus Nachricht 5.

**Rollen und Rechte** (Kontext zu BR1, BR2 und BR4, Wunsch für die App, keine sechste Regel; 7, 8, 9, 19):
- Admin (Lisa): darf alles
- Stellvertretung (Marie): kann Buchungen anpassen und einmalig Kulanz bei Notfällen gewähren, aber keine Tarifwechsel machen und nicht systematisch Gebühren erlassen
- Trainer: erfasst nach dem Kurs die Anwesenheit (teilgenommen, nicht erschienen) und trägt seine Verfügbarkeit ein, die Kursplanung bleibt bei Lisa
- Mitglied: bucht und storniert eigene Kurse (Annahme)

---

## Widersprüche

**W1 · Kurspreis oder Mitgliedsbeitrag?**
- Aussage A: Die Stornogebühr ist „die Hälfte vom Kurspreis“ (4).
- Aussage B: Die Kurse sind im Mitgliedsbeitrag enthalten, man zahlt nicht extra pro Kurs (5).
- Nachgefragt in Nachricht 6. Lisa räumt ein, dass es keinen Kurspreis gibt.
- **Auflösung:** Die Stornogebühr ist eine feste Pauschale von etwa 5–10 €, nicht an einen Kurspreis gekoppelt.
- **Begründung:** Eine Pauschale passt zu Lisas Modell, weil die Kurse im Beitrag stecken und ein Kurspreis nicht existiert.
- **Annahme:** Der Betrag ist konfigurierbar, die Höhe legt Lisa fest.

**W2 · Darf Marie Gebühren erlassen?**
- Aussage A: Marie darf nicht einfach eine Stornogebühr erlassen, alles läuft über Lisa (7).
- Aussage B: Wenn Lisa weg ist, ist Marie ihre inoffizielle Stellvertreterin und darf bei Notfällen kulant sein (8).
- Nachgefragt in Nachricht 9.
- **Auflösung:** Im Alltag entscheidet nur Lisa, Marie ist dann Trainerin. In Lisas Abwesenheit darf Marie einmalig bei einem echten Notfall Kulanz gewähren. Systematisches Erlassen und Änderungen an Mitgliedschaften bleiben bei Lisa.
- **Begründung:** Lisa braucht in ihrer Abwesenheit jemanden, der entscheiden kann, will aber ausdrücklich keine systematische Gebührenbefreiung.
- **Annahme:** „Einmalig“ heißt ein Einzelfall pro Notfall, eine genaue Grenze hat Lisa nicht festgelegt.

**Zusätzlich geklärt (Datenkorrekturen, keine eigenen Widersprüche):**
- Spinning hat 12 Plätze (12 Bikes), die genannten 15 waren ein Versprecher (2, 10, 13).
- Die Videos sind nicht für alle Mitglieder, Basic hat keinen Zugang (5, 15).

---

## Neue Anforderung (Meeting 2)

Auf die Frage nach der Zukunft (11) nannte Lisa mehrere Ideen. Zwei davon wurden in Meeting 2 genauer geklärt.

**Personal Training (1:1-Termine mit Trainern)** (16)
- Heute läuft es über drei WhatsApp-Chats (Mitglied, Lisa, Trainer). Bezahlt wird bar an der Studiokasse, das landet nicht immer in der Excel-Tabelle.
- **Neue Entität: Personal-Training-Termin** (pt_termin_id, mitglied → Mitglied, trainer → Trainer, datum_uhrzeit, preis, bezahlt, inklusiv). Beziehungen: Mitglied (0,n) – bucht – (1,1) Termin, Trainer (0,n) – führt durch – (1,1) Termin, beide 1:n. Der Trainer bekommt zusätzlich das Attribut stundensatz.
- **Regel:** Wenn ein Premium-Mitglied seinen ersten Personal-Training-Termin im Monat bucht, dann ist er inklusive. Alle weiteren Termine und die Termine anderer Tarife kosten extra, je nach Trainer etwa 60–80 € pro Stunde (Tom ist teurer). Das ist unabhängig vom Monatsbeitrag.
- **Annahme:** Personal Training wird als Erweiterung (v2) neben dem 8-Entitäten-Modell geführt, damit das Kernmodell überschaubar bleibt.

**On-Demand-Videos** (11, 15)
- Mitglieder ab Plus können Aufnahmen der Trainer abrufen. Die Aufnahmen liegen bei Lisa auf einer Festplatte, der Inhalt ist unklar.
- Der Zugriff hängt am Tarif (Attribut videozugang).

**Zweiter Standort:** langfristige Idee, ausdrücklich „Zukunftsmusik“, nicht modelliert (11).

---

## Prioritäten

**v1 (MVP laut Lisa, 12):**
1. Online-Buchung durch die Mitglieder im Buchungsfenster (7 Tage bis 1 Stunde vorher), z. B. Yoga Dienstag 19 Uhr
2. Übersicht für Lisa statt Excel
3. Warteliste von Anfang an
4. Tarif-Check (Basic nicht unbegrenzt buchen)
5. Sperre für pausierte und gekündigte Mitglieder (**Annahme:** gehört zu v1, weil Lisa sagt, die App müsse die Pause kennen)

**Später:**
- Anwesenheitserfassung durch die Trainer und automatische No-Show-Sperre (**Annahme:** später, weil Lisa sie nicht zum MVP gezählt hat)
- On-Demand-Videos je nach Tarif
- Personal Training mit Abrechnung und Premium-Termin
- Trainerverwaltung (Verfügbarkeit)
- Rollen und Admin-Funktionen
- Zweiter Standort

---

## Offene Fragen

- **Preise:** Beitrag je Tarif, Höhe der Stornopauschale (5–10 €)
- **Tarife:** Wie viele Buchungen darf Plus? Welche weiteren Extras bekommt Premium? Gilt das Buchungsfenster von 7 Tagen für alle Tarife?
- **Buchung:** Wie läuft die Walk-in-Ausnahme genau (wer bestätigt, bis wann)? Können Plätze, die durch eine späte Absage frei werden, bis 1 Stunde vorher direkt gebucht werden?
- **Online:** Gelten die Live-Online-Kurse auch für Basic? Wie hoch ist die weiche Obergrenze?
- **Warteliste:** Gibt es eine Antwortfrist für den Nachrücker? Gilt das Limit von 5 für alle Kurse?
- **No-Show:** Fällt bei einem No-Show eine Stornopauschale an? Gilt die Sperre auch für Premium? Zählt Verspätung von 10–15 Minuten (Annahme: nein, solange der Trainer die Person reinlässt)? Wie stellt man sicher, dass auch die Honorartrainer die Anwesenheit eintragen?
- **Pausen:** Gilt die Grenze von 3 Monaten pro Jahr wirklich? Fällt bei der Stornierung offener Buchungen eine Gebühr an (Annahme: nein)?
- **Kulanz:** Wo genau liegt die Grenze zwischen „einmalig“ und „systematisch“?
- **Kursausfall:** Was passiert mit den Buchungen, wenn ein Kurs ausfällt? (nicht gefragt)
- **v1-Umfang:** Gehören die Stornoregel, die Mitgliedschaftshistorie und die Pausenverwaltung schon zum ersten Release?
- **Neue Anforderung:** Welche der Zukunftsideen (Videos, Personal Training, zweiter Standort) kommt als Nächstes?
