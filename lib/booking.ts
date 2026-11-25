import { prisma } from "./db";
import { pruefeBuchung, type Format, type MitgliedschaftStatus } from "./rules";

export type BuchungsErgebnis =
  | { ok: true; buchung_id: number }
  | { ok: false; grund: string; code: string };

/**
 * Bucht einen Kurstermin fuer ein Mitglied.
 * Laedt alle noetigen Daten, prueft die F-001-Regeln und legt bei Erfolg
 * eine Buchung mit Status "gebucht" an. Die Warteliste folgt in F-002.
 */
export async function bucheKurs(
  mitgliedNr: string,
  terminId: number,
  jetzt: Date = new Date()
): Promise<BuchungsErgebnis> {
  const mitglied = await prisma.mitglied.findUnique({
    where: { mitglied_nr: mitgliedNr },
    include: {
      mitgliedschaften: { orderBy: { beginn: "desc" }, take: 1, include: { tarif: true } },
    },
  });
  if (!mitglied) {
    return { ok: false, code: "mitglied_unbekannt", grund: "Dieses Mitglied wurde nicht gefunden." };
  }

  const mitgliedschaft = mitglied.mitgliedschaften[0];
  if (!mitgliedschaft) {
    return { ok: false, code: "keine_mitgliedschaft", grund: "Fuer dieses Mitglied liegt keine Mitgliedschaft vor." };
  }

  const termin = await prisma.kurstermin.findUnique({
    where: { termin_id: terminId },
    include: {
      kursart: true,
      buchungen: { where: { status: "gebucht" }, select: { buchung_id: true } },
    },
  });
  if (!termin) {
    return { ok: false, code: "termin_unbekannt", grund: "Dieser Kurstermin existiert nicht." };
  }

  const bereitsGebucht =
    (await prisma.buchung.count({
      where: { mitglied_nr: mitgliedNr, termin_id: terminId, status: { in: ["gebucht", "Warteliste"] } },
    })) > 0;

  const monatsStart = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth(), 1));
  const monatsEnde = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() + 1, 1));
  const anzahlBuchungenImMonat = await prisma.buchung.count({
    where: {
      mitglied_nr: mitgliedNr,
      status: "gebucht",
      zeitpunkt: { gte: monatsStart, lt: monatsEnde },
    },
  });

  const pruefung = pruefeBuchung({
    jetzt,
    termin: {
      datum_uhrzeit: termin.datum_uhrzeit,
      format: termin.format as Format,
      max_teilnehmer: termin.kursart.max_teilnehmer,
      anzahl_gebucht: termin.buchungen.length,
    },
    tarif: {
      max_buchungen_pro_monat: mitgliedschaft.tarif.max_buchungen_pro_monat,
      unbegrenzt: mitgliedschaft.tarif.unbegrenzt,
    },
    anzahlBuchungenImMonat,
    bereitsGebucht,
    mitgliedschaftStatus: mitgliedschaft.status as MitgliedschaftStatus,
  });

  if (!pruefung.erlaubt) {
    return { ok: false, code: pruefung.code, grund: pruefung.grund };
  }

  const buchung = await prisma.buchung.create({
    data: { mitglied_nr: mitgliedNr, termin_id: terminId, status: "gebucht" },
  });
  return { ok: true, buchung_id: buchung.buchung_id };
}
