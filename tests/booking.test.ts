import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hier = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(hier, "..");
const testDbPath = resolve(repoRoot, "prisma/test-f001.db");
const migrationsDir = resolve(repoRoot, "prisma/migrations");

// Eigene Test-Datenbank, damit die Entwicklungs-DB unberuehrt bleibt.
process.env.DATABASE_URL = `file:${testDbPath.replace(/\\/g, "/")}`;

function schemaAnlegen() {
  if (existsSync(testDbPath)) rmSync(testDbPath, { force: true });
  mkdirSync(dirname(testDbPath), { recursive: true });
  const db = new Database(testDbPath);
  const ordner = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const name of ordner) {
    const sql = readFileSync(resolve(migrationsDir, name, "migration.sql"), "utf8");
    db.exec(sql);
  }
  db.close();
}

let prisma: typeof import("../lib/db").prisma;
let bucheKurs: typeof import("../lib/booking").bucheKurs;
let ids: {
  spinningKursartId: number;
  trainerId: number;
  yogaVoll: number;
  spinning: number;
  online: number;
  zuFrueh: number;
  anna: string;
  david: string;
  pausiert: string;
};

beforeAll(async () => {
  schemaAnlegen();

  ({ prisma } = await import("../lib/db"));
  ({ bucheKurs } = await import("../lib/booking"));

  const basic = await prisma.tarif.create({
    data: { name: "Basic", max_buchungen_pro_monat: 5, unbegrenzt: false },
  });
  const premium = await prisma.tarif.create({
    data: { name: "Premium", max_buchungen_pro_monat: null, unbegrenzt: true },
  });
  const yoga = await prisma.kursart.create({ data: { name: "Yoga", max_teilnehmer: 1 } });
  const spinning = await prisma.kursart.create({ data: { name: "Spinning", max_teilnehmer: 12 } });
  const online = await prisma.kursart.create({ data: { name: "YogaOnline", max_teilnehmer: 1 } });
  const trainer = await prisma.trainer.create({ data: { name: "Tom", anstellungsart: "fest" } });

  const jetzt = new Date();
  const tag = (offset: number, hour: number) => {
    const d = new Date(jetzt);
    d.setUTCHours(hour, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + offset);
    return d;
  };

  const yogaVollTermin = await prisma.kurstermin.create({
    data: { kursart_id: yoga.kursart_id, trainer_id: trainer.trainer_id, datum_uhrzeit: tag(2, 10), format: "Studio" },
  });
  const spinningTermin = await prisma.kurstermin.create({
    data: { kursart_id: spinning.kursart_id, trainer_id: trainer.trainer_id, datum_uhrzeit: tag(2, 12), format: "Studio" },
  });
  const onlineTermin = await prisma.kurstermin.create({
    data: { kursart_id: online.kursart_id, trainer_id: trainer.trainer_id, datum_uhrzeit: tag(2, 14), format: "Online" },
  });
  const zuFruehTermin = await prisma.kurstermin.create({
    data: { kursart_id: spinning.kursart_id, trainer_id: trainer.trainer_id, datum_uhrzeit: tag(9, 12), format: "Studio" },
  });

  const anna = await prisma.mitglied.create({
    data: {
      mitglied_nr: "M-1", name: "Anna", eintrittsdatum: tag(-100, 9),
      mitgliedschaften: { create: { tarif_id: basic.tarif_id, beginn: tag(-100, 9), status: "aktiv" } },
    },
  });
  const david = await prisma.mitglied.create({
    data: {
      mitglied_nr: "M-2", name: "David", eintrittsdatum: tag(-100, 9),
      mitgliedschaften: { create: { tarif_id: premium.tarif_id, beginn: tag(-100, 9), status: "aktiv" } },
    },
  });
  const pausiert = await prisma.mitglied.create({
    data: {
      mitglied_nr: "M-3", name: "Paula", eintrittsdatum: tag(-100, 9),
      mitgliedschaften: { create: { tarif_id: basic.tarif_id, beginn: tag(-100, 9), status: "pausiert" } },
    },
  });

  ids = {
    spinningKursartId: spinning.kursart_id,
    trainerId: trainer.trainer_id,
    yogaVoll: yogaVollTermin.termin_id,
    spinning: spinningTermin.termin_id,
    online: onlineTermin.termin_id,
    zuFrueh: zuFruehTermin.termin_id,
    anna: anna.mitglied_nr,
    david: david.mitglied_nr,
    pausiert: pausiert.mitglied_nr,
  };
});

afterAll(async () => {
  await prisma?.$disconnect();
  if (existsSync(testDbPath)) rmSync(testDbPath, { force: true });
});

describe("bucheKurs (Integration)", () => {
  it("legt eine gueltige Buchung an", async () => {
    const ergebnis = await bucheKurs(ids.anna, ids.spinning);
    expect(ergebnis.ok).toBe(true);
  });

  it("verhindert Doppelbuchungen desselben Termins", async () => {
    const ergebnis = await bucheKurs(ids.anna, ids.spinning);
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) expect(ergebnis.code).toBe("bereits_gebucht");
  });

  it("blockiert eine Buchung, wenn der Studio-Kurs voll ist", async () => {
    await bucheKurs(ids.david, ids.yogaVoll);
    const ergebnis = await bucheKurs(ids.anna, ids.yogaVoll);
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) expect(ergebnis.code).toBe("kurs_voll");
  });

  it("erlaubt Online-Kurse ueber das Limit hinaus", async () => {
    await bucheKurs(ids.david, ids.online);
    const ergebnis = await bucheKurs(ids.anna, ids.online);
    expect(ergebnis.ok).toBe(true);
  });

  it("lehnt Buchungen ausserhalb des Fensters (zu frueh) ab", async () => {
    const ergebnis = await bucheKurs(ids.anna, ids.zuFrueh);
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) expect(ergebnis.code).toBe("zu_frueh");
  });

  it("lehnt Buchungen bei nicht aktiver Mitgliedschaft ab", async () => {
    const ergebnis = await bucheKurs(ids.pausiert, ids.spinning);
    expect(ergebnis.ok).toBe(false);
    if (!ergebnis.ok) expect(ergebnis.code).toBe("mitgliedschaft_nicht_aktiv");
  });

  it("sperrt Basic nach 5 Buchungen im Monat, Premium nicht", async () => {
    const jetzt = new Date();
    const termine = [];
    for (const offset of [3, 4, 5, 6]) {
      const d = new Date(jetzt);
      d.setUTCHours(12, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() + offset);
      termine.push(
        await prisma.kurstermin.create({
          data: { kursart_id: ids.spinningKursartId, trainer_id: ids.trainerId, datum_uhrzeit: d, format: "Studio" },
        })
      );
    }
    // Anna hat bisher 2 Buchungen im Monat (Spinning + Online). Vier weitere sind erlaubt,
    // danach greift das Basic-Limit von 5 pro Monat.
    const ergebnisse = [];
    for (const t of termine) {
      ergebnisse.push(await bucheKurs(ids.anna, t.termin_id));
    }
    const codes = ergebnisse.map((e) => (e.ok ? "ok" : e.code));
    expect(codes.filter((c) => c === "ok").length).toBe(3);
    expect(codes).toContain("tarif_limit");
  });

  it("laesst Premium trotz vieler Buchungen zu", async () => {
    const jetzt = new Date();
    const d = new Date(jetzt);
    d.setUTCHours(13, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 4);
    const t = await prisma.kurstermin.create({
      data: { kursart_id: ids.spinningKursartId, trainer_id: ids.trainerId, datum_uhrzeit: d, format: "Studio" },
    });
    const ergebnis = await bucheKurs(ids.david, t.termin_id);
    expect(ergebnis.ok).toBe(true);
  });
});
