# Architektur

Technische und gestalterische Entscheidungen für das Projekt. Grundlage sind `SPEC.md`, `AGENTS.md`, `docs/decisions.md` und `docs/backlog.md`.

## Stack

- **Framework:** Next.js 16 (App Router) mit TypeScript 7 und React 19.
- **Datenbank:** SQLite über Prisma 7 (lokale Datei, kein Server). Installation mit `npm install prisma@7 @prisma/client@7`, keine Vorabversion.
- **SQLite-Treiber (Prisma 7):** Prisma 7 verlangt für direkte Verbindungen einen Driver Adapter. Für SQLite ist das `@prisma/adapter-better-sqlite3`.
- **UI:** Tailwind CSS 4, Gestaltung siehe Abschnitt „Design“ in `AGENTS.md`.
- **Icons:** `lucide-react`, einheitlich. Keine Emojis als Icons.
- **Schriften:** `next/font` mit einer Charakterschrift für Überschriften und einer gut lesbaren Schrift für Fließtext.
- **Tests:** Vitest.
- **Start:** `npm run dev`, danach http://localhost:3000.

## Setup: manuell statt `create-next-app`

Das Projekt liegt in einem **bestehenden, nicht-leeren Ordner** (`AGENTS.md`, `SPEC.md`, `docs/`). `create-next-app` würde in einen solchen Ordner schreiben und z. B. `README.md` oder `package.json` anlegen bzw. ändern. Deshalb wurde das Grundgerüst **manuell** angelegt und anschließend per `npm install` ergänzt. So bleibt garantiert, dass keine bestehende Datei überschrieben wird.

Zusätzlich ist in `next.config.ts` `agentRules: false` gesetzt. Ohne diese Einstellung schreibt `next dev` automatisch einen Block in `AGENTS.md`; das würde die bestehende Datei verändern und ist daher deaktiviert.

## Ordnerstruktur

- `app/` – Seiten und Layout (App Router). `app/layout.tsx` (Schriften, Metadaten), `app/page.tsx` (Startseite), `app/globals.css` (Tailwind-Import + Design-Token).
- `lib/` – Anwendungslogik. `lib/db.ts` (Prisma-Client-Singleton mit Driver Adapter).
- `lib/generated/prisma/` – von `prisma generate` erzeugter Client (nicht eingecheckt, siehe `.gitignore`).
- `prisma/` – `schema.prisma` und Migrationen (`prisma/migrations/`).
- `tests/` – Vitest-Tests (folgen mit den Business Rules).
- `docs/` – `backlog.md`, `decisions.md`, `architecture.md`.

## Tailwind 4 (CSS-first)

Tailwind 4 wird über das PostCSS-Plugin `@tailwindcss/postcss` eingebunden (`postcss.config.mjs`). Es gibt **keine** `tailwind.config.ts` mehr; das Theme steht direkt in `app/globals.css`:

- `@import "tailwindcss";`
- `@theme { … }` definiert Farben (`--color-*`), Radien (`--radius-*`) und Schatten (`--shadow-*`), die als Utilities nutzbar sind (z. B. `bg-paper`, `text-accent`, `rounded-card`, `shadow-card`).
- `@theme inline { … }` bindet die Schriftvariablen aus `next/font` (`--font-fraunces`, `--font-inter`) an `font-display` und `font-body`.

## Datenbank

- Konfiguration über `prisma.config.ts` und `.env` (`DATABASE_URL="file:./dev.db"`). Prisma 7 lädt `.env` nicht selbst, daher `import "dotenv/config"` in der Config.
- Der Generator `prisma-client` schreibt nach `lib/generated/prisma` (Prisma 7 verlangt einen `output`-Pfad). Import: `import { PrismaClient } from "./generated/prisma/client";`
- Schemaänderungen immer als Migration: `npx prisma migrate dev`. Die Datenbankdatei wird nie von Hand geändert.
- Dieses Grundgerüst enthält noch **keine Modelle**. Die Tabellen entstehen mit Feature F-001 (Kurs online buchen).

## Design-Token (ruhig und editorial)

Umgesetzt in `app/globals.css` als Tailwind-4-Theme:

- Grundfläche `--color-paper` `#f6f2ea` (warmes Off-White), Karten/Flächen `--color-surface` `#fffdf8`.
- Text `--color-ink` `#1c1917`, gedämpft `--color-muted` `#6f6659`, Linien `--color-line` `#e4dccd`.
- Akzent `--color-accent` `#b5462a` (kräftiges Terrakotta) für Hauptaktionen und den aktiven Menüpunkt, `--color-accent-soft` `#f3e0d7` für ruhige Flächen. Kein Indigo, keine Lila-Blau-Verläufe.
- Schriften: Überschriften `Fraunces` (editorial, Charakter), Fließtext `Inter`, beide über `next/font`.
- Einheitliche Radien (`rounded-card` 14px, `rounded-control` 10px), Karten-Schatten `shadow-card`, Zahlen/Datum mit `tabular-nums`.

## Konventionen

- Schreibende Aktionen als Server Actions; alle Business Rules werden **serverseitig** geprüft, nicht im Client.
- Identität vorerst über eine Mitgliederauswahl ohne Passwort (siehe `docs/decisions.md`). Keine E-Mail-/Passwort-Anmeldung.
- Keine echten Personendaten und keine API-Keys im Repo; `DATABASE_URL` zeigt nur auf die lokale SQLite-Datei.