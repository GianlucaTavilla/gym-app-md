# Entscheidungen

Jede Entscheidung mit Datum, was entschieden wurde und warum. Grundlage sind `SPEC.md` und `AGENTS.md`.

## 2026-11-25 · Design-Richtung: ruhig und editorial

**Was:** Die App wird ruhig und editorial gestaltet, wie ein hochwertiges, modernes Fitnessstudio-Produkt. Warmes Off-White als getönte Grundfläche statt reinem Weiß, dezente neutrale Grau-/Steintöne, eine einzige kräftige Akzentfarbe für Hauptaktionen und den aktiven Menüpunkt, sonst sparsam. Überschriften in einer Charakterschrift, Fließtext gut lesbar (über `next/font`), Zahlen und Datum mit `tabular-nums`. Einheitliche Karten, Radien und Schatten, Icons einheitlich aus `lucide-react`, freundliche Leer-, Lade- und Fehlerzustände. Kein Standard-Indigo, keine Lila-Blau-Verläufe.

**Warum:** `AGENTS.md` verlangt beim ersten Feature eine feste Richtung, die überall durchgehalten wird, und ein Erscheinungsbild wie ein gutes Produkt. „Ruhig und editorial“ passt zu FitZones Anspruch (Gesundheit, Kursplan, Übersicht) und hält den Kursplan gut lesbar.

## 2026-11-25 · Identität: Mitgliederauswahl ohne Passwort

**Was:** Die Identität läuft vorerst über eine Mitgliederauswahl (wer bin ich?) ohne Passwort und ohne E-Mail-Login. Die frühere Entscheidung „Anmeldung mit E-Mail und Passwort“ ist damit verworfen.

**Warum:** `SPEC.md` nennt keine Anmeldung, keine Zugangsdaten und kein Passwort; eine Anmeldung wäre eine neue, ungeklärte Anforderung (Kontoanlage, Passwort-Reset) und würde das Datenmodell und die SPEC ändern. Für F-001 genügt die Mitgliederauswahl, um „bucht und storniert eigene Kurse“ umzusetzen. Sobald echte Anmeldung gewünscht ist, wird das als eigenes Thema geklärt (Kontoanlage, Passwort-Reset, Datenschutz).


## 2026-11-25 · F-001: Modell, Regeln und offene Werte

**Was:** F-001 (Kurs online buchen) umgesetzt. Datenmodell (Prisma-Migration) für Tarif, Mitglied, Mitgliedschaft, Kursart, Trainer, Kurstermin und Buchung exakt nach `SPEC.md`. Serverseitige Buchungsregeln in `lib/rules.ts`, getestet. Oberfläche: Kursplan, Termin-Detail mit Buchung, „Meine Buchungen“. Identität über Mitgliederauswahl ohne Passwort (Cookie).

**Warum:** `AGENTS.md` verlangt ein Feature pro Session, Migrationen statt Handänderung der DB und einen Test pro Business Rule. F-001 deckt BR1 (Buchungsfenster, Kapazität) und BR3 (Tarif-Limit) ab.

**Offene oder widersprüchliche Punkte (bewusst nicht selbst entschieden):**
- **Plus-Limit:** `SPEC.md` nennt für Plus „Zahl offen“. Das Feld `max_buchungen_pro_monat` ist deshalb nullable und bleibt für Plus leer; es wird keine Zahl erfunden. Solange kein Wert gesetzt ist, greift für Plus kein Limit. Das bleibt eine offene Frage an Lisa.
- **Online-Obergrenze:** `SPEC.md` nennt nur eine „weiche Obergrenze“ ohne Zahl. Online-Kurse haben daher keine harte Grenze; eine Zahl wird nicht erfunden.
- **Pilates/HIIT `max_teilnehmer`:** In `SPEC.md` nicht genannt. Bleibt nullable, kein erfundener Wert.
- **„in einem Monat“ (Basic-Limit):** Auslegung als Kalendermonat; es zählen Buchungen mit Status „gebucht“ im aktuellen Monat. Das ist eine Annahme, kein Fakt aus der SPEC.
- **Walk-in (BR1):** In `SPEC.md` ausdrücklich „nicht festgelegt“. Nicht Teil von F-001, da keine Mitglieder-Selbstbedienung (der Trainer bestätigt).
- **Status-Sperren (Pause/Kündigung):** Gehören zu BR4 und damit zu F-004. F-001 prüft nur, ob die Mitgliedschaft „aktiv“ ist.
- **Warteliste:** Teil von BR1, aber laut Backlog F-002. F-001 blockiert einen vollen Studio-Kurs nur mit Hinweis.

**Technische Hinweise:** SQLite unterstützt in Prisma 7 keine Enums, daher sind `status`, `format`, `anwesenheit` usw. als String modelliert und werden in `lib/rules.ts` gegen feste Werte geprüft. Seed-Script: `npm run db:seed`.