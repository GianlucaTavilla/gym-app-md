import { prisma } from "./db";
import type { Format } from "./rules";

// Lesezugriffe fuer die Oberflaeche (F-001).

export async function getMitglieder() {
  return prisma.mitglied.findMany({
    orderBy: { name: "asc" },
    include: {
      mitgliedschaften: {
        orderBy: { beginn: "desc" },
        take: 1,
        include: { tarif: true },
      },
    },
  });
}

export async function getMitglied(mitgliedNr: string) {
  return prisma.mitglied.findUnique({
    where: { mitglied_nr: mitgliedNr },
    include: {
      mitgliedschaften: {
        orderBy: { beginn: "desc" },
        take: 1,
        include: { tarif: true },
      },
    },
  });
}

export type KursplanEintrag = Awaited<ReturnType<typeof getKursplan>>[number];

export async function getKursplan() {
  const termine = await prisma.kurstermin.findMany({
    orderBy: { datum_uhrzeit: "asc" },
    include: {
      kursart: true,
      trainer: true,
      buchungen: { where: { status: "gebucht" }, select: { buchung_id: true } },
    },
  });

  return termine.map((t) => ({
    termin_id: t.termin_id,
    datum_uhrzeit: t.datum_uhrzeit,
    format: t.format as Format,
    kursart: t.kursart.name,
    max_teilnehmer: t.kursart.max_teilnehmer,
    trainer: t.trainer.name,
    anzahl_gebucht: t.buchungen.length,
  }));
}

export async function getTermin(terminId: number) {
  const t = await prisma.kurstermin.findUnique({
    where: { termin_id: terminId },
    include: {
      kursart: true,
      trainer: true,
      buchungen: { where: { status: "gebucht" }, select: { buchung_id: true } },
    },
  });
  if (!t) return null;
  return {
    termin_id: t.termin_id,
    datum_uhrzeit: t.datum_uhrzeit,
    format: t.format as Format,
    zoom_link: t.zoom_link,
    kursart: t.kursart.name,
    max_teilnehmer: t.kursart.max_teilnehmer,
    trainer: t.trainer.name,
    anzahl_gebucht: t.buchungen.length,
  };
}

export async function getBuchungenFuerMitglied(mitgliedNr: string) {
  const buchungen = await prisma.buchung.findMany({
    where: { mitglied_nr: mitgliedNr, status: { in: ["gebucht", "Warteliste"] } },
    orderBy: { kurstermin: { datum_uhrzeit: "asc" } },
    include: { kurstermin: { include: { kursart: true, trainer: true } } },
  });
  return buchungen.map((b) => ({
    buchung_id: b.buchung_id,
    status: b.status,
    zeitpunkt: b.zeitpunkt,
    termin_id: b.termin_id,
    datum_uhrzeit: b.kurstermin.datum_uhrzeit,
    format: b.kurstermin.format as Format,
    kursart: b.kurstermin.kursart.name,
    trainer: b.kurstermin.trainer.name,
  }));
}
