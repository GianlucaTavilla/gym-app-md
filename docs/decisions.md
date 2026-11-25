# Entscheidungen

Jede Entscheidung mit Datum, was entschieden wurde und warum. Grundlage sind `SPEC.md` und `AGENTS.md`.

## 2026-11-25 · Design-Richtung: ruhig und editorial

**Was:** Die App wird ruhig und editorial gestaltet, wie ein hochwertiges, modernes Fitnessstudio-Produkt. Warmes Off-White als getönte Grundfläche statt reinem Weiß, dezente neutrale Grau-/Steintöne, eine einzige kräftige Akzentfarbe für Hauptaktionen und den aktiven Menüpunkt, sonst sparsam. Überschriften in einer Charakterschrift, Fließtext gut lesbar (über `next/font`), Zahlen und Datum mit `tabular-nums`. Einheitliche Karten, Radien und Schatten, Icons einheitlich aus `lucide-react`, freundliche Leer-, Lade- und Fehlerzustände. Kein Standard-Indigo, keine Lila-Blau-Verläufe.

**Warum:** `AGENTS.md` verlangt beim ersten Feature eine feste Richtung, die überall durchgehalten wird, und ein Erscheinungsbild wie ein gutes Produkt. „Ruhig und editorial“ passt zu FitZones Anspruch (Gesundheit, Kursplan, Übersicht) und hält den Kursplan gut lesbar.

## 2026-11-25 · Identität: Mitgliederauswahl ohne Passwort

**Was:** Die Identität läuft vorerst über eine Mitgliederauswahl (wer bin ich?) ohne Passwort und ohne E-Mail-Login. Die frühere Entscheidung „Anmeldung mit E-Mail und Passwort“ ist damit verworfen.

**Warum:** `SPEC.md` nennt keine Anmeldung, keine Zugangsdaten und kein Passwort; eine Anmeldung wäre eine neue, ungeklärte Anforderung (Kontoanlage, Passwort-Reset) und würde das Datenmodell und die SPEC ändern. Für F-001 genügt die Mitgliederauswahl, um „bucht und storniert eigene Kurse“ umzusetzen. Sobald echte Anmeldung gewünscht ist, wird das als eigenes Thema geklärt (Kontoanlage, Passwort-Reset, Datenschutz).
