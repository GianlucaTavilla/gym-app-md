# Backlog

Abläufe aus `SPEC.md`, die eine Person in der App von Anfang bis Ende durchspielen kann. Ein Feature umfasst Datenmodell, Oberfläche, Regeln und Tests. Die Feature-ID steht in jeder Commit-Nachricht (z. B. `feat: F-001 Kurs online buchen`).

Phase 1 ist das MVP laut `SPEC.md` (Prioritäten, Nachricht 12) und hat höchstens 5 Features. Phase 2 ist alles Spätere.

| ID | Name | Phase | Status | BR / Entitäten |
|---|---|---|---|---|
| F-001 | Kurs online buchen | 1 | fertig | BR1, BR3 · Mitglied, Mitgliedschaft, Tarif, Kursart, Kurstermin, Buchung |
| F-002 | Auf die Warteliste und nachrücken | 1 | offen | BR1 · Buchung, Kurstermin, Kursart |
| F-003 | Buchung stornieren und Stornogebühr | 1 | offen | BR2, BR3 · Buchung, Mitgliedschaft, Tarif |
| F-004 | Mitgliedschaft pausieren, kündigen und sperren | 1 | offen | BR4 · Mitglied, Mitgliedschaft, Pause, Buchung |
| F-005 | Kursplan und Teilnehmerübersicht für Lisa | 1 | offen | BR1 · Kursart, Kurstermin, Trainer, Buchung, Mitglied |
| F-006 | Anwesenheit erfassen und No-Show-Sperre | 2 | offen | BR2 · Buchung, Mitgliedschaft, Kurstermin, Trainer |
| F-007 | Online-Kurs mit Zoom-Link | 2 | offen | BR5 · Kurstermin, Buchung, Mitglied |
| F-008 | On-Demand-Videos je Tarif | 2 | offen | BR5 · Tarif, Mitgliedschaft, Mitglied |
| F-009 | Personal Training buchen und abrechnen | 2 | offen | Neue Anforderung (16) · Personal-Training-Termin, Mitglied, Trainer, Tarif |
| F-010 | Trainerverfügbarkeit pflegen | 2 | offen | Später (Trainerverwaltung) · Trainer, Kursart, Kurstermin |

## Hinweise

- Rollen und Rechte (Admin, Stellvertretung, Trainer, Mitglied) sind kein eigenes Feature; sie entstehen im ersten Feature, das sie braucht (siehe `SPEC.md`, Abschnitt „Rollen und Rechte“).
- Offene Fragen aus `SPEC.md` werden im jeweiligen Feature geklärt: Walk-in und weiche Obergrenze in F-001, Nachrück-Frist in F-002, genaue Preise (Beitrag, Stornopauschale) in F-003, Pausen-Grenze in F-004.
