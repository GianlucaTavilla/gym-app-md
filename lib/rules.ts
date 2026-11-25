// Buchungsregeln fuer F-001 (BR1 und BR3 aus SPEC.md).
// Bewusst reine Funktionen ohne Datenbank, damit jede Regel einzeln testbar ist.

/** BR1: Buchungsfenster - fruehestens 7 Tage vor Kursbeginn. */
export const BUCHUNGSFENSTER_TAGE_VORHER = 7;
/** BR1: Buchungsfenster - spaetestens 1 Stunde vor Kursbeginn. */
export const BUCHUNGSFENSTER_STUNDEN_VORHER = 1;

const MS_PRO_TAG = 24 * 60 * 60 * 1000;
const MS_PRO_STUNDE = 60 * 60 * 1000;

export type Format = "Studio" | "Online";
export type MitgliedschaftStatus = "aktiv" | "pausiert" | "gekuendigt" | "inaktiv";
export type BuchungStatus = "gebucht" | "Warteliste" | "storniert";

/**
 * BR1: Liegt "jetzt" innerhalb des Buchungsfensters?
 * Fenster = [Kursbeginn - 7 Tage, Kursbeginn - 1 Stunde] (Grenzen inklusive).
 */
export function istImBuchungsfenster(datumUhrzeit: Date, jetzt: Date): boolean {
  const fruehesteBuchung = datumUhrzeit.getTime() - BUCHUNGSFENSTER_TAGE_VORHER * MS_PRO_TAG;
  const spaetesteBuchung = datumUhrzeit.getTime() - BUCHUNGSFENSTER_STUNDEN_VORHER * MS_PRO_STUNDE;
  const t = jetzt.getTime();
  return t >= fruehesteBuchung && t <= spaetesteBuchung;
}

/** Liegt der Kursbeginn bereits in der Vergangenheit (oder genau jetzt)? */
export function istVergangen(datumUhrzeit: Date, jetzt: Date): boolean {
  return datumUhrzeit.getTime() <= jetzt.getTime();
}

/**
 * BR1: Studio-Kurse sind hart auf max_teilnehmer der Kursart begrenzt.
 * Online-Kurse haben laut SPEC nur eine weiche Obergrenze (Zahl offen),
 * daher gibt es hier keine harte Grenze.
 */
export function hatFreiePlaetze(
  format: Format,
  maxTeilnehmer: number | null,
  anzahlGebucht: number
): boolean {
  if (format === "Online") return true;
  if (maxTeilnehmer === null) return true; // Kursart ohne hinterlegtes Limit: keine harte Grenze
  return anzahlGebucht < maxTeilnehmer;
}

/**
 * BR3: Tarif-Limit pro Monat.
 * Premium ist unbegrenzt; Basic hat 5; Plus ist in der SPEC offen.
 * Ist max_buchungen_pro_monat nicht gesetzt und der Tarif nicht unbegrenzt,
 * gibt es (noch) kein Limit - die Zahl ist offen und wird nicht erfunden.
 */
export function tarifLimitErreicht(
  tarif: { max_buchungen_pro_monat: number | null; unbegrenzt: boolean },
  anzahlBuchungenImMonat: number
): boolean {
  if (tarif.unbegrenzt) return false;
  if (tarif.max_buchungen_pro_monat === null) return false;
  return anzahlBuchungenImMonat >= tarif.max_buchungen_pro_monat;
}

export type BuchungsPruefungInput = {
  jetzt: Date;
  termin: {
    datum_uhrzeit: Date;
    format: Format;
    max_teilnehmer: number | null;
    anzahl_gebucht: number;
  };
  tarif: { max_buchungen_pro_monat: number | null; unbegrenzt: boolean };
  anzahlBuchungenImMonat: number;
  bereitsGebucht: boolean;
  mitgliedschaftStatus: MitgliedschaftStatus;
};

export type BuchungsPruefungErgebnis =
  | { erlaubt: true }
  | { erlaubt: false; code: BuchungsFehlerCode; grund: string };

export type BuchungsFehlerCode =
  | "mitgliedschaft_nicht_aktiv"
  | "kurs_vorbei"
  | "zu_frueh"
  | "zu_spaet"
  | "kurs_voll"
  | "tarif_limit"
  | "bereits_gebucht";

/**
 * Fuehrt alle F-001-Regeln in einer klaren Reihenfolge aus und liefert
 * entweder "erlaubt" oder einen sprechenden Grund.
 */
export function pruefeBuchung(input: BuchungsPruefungInput): BuchungsPruefungErgebnis {
  if (input.mitgliedschaftStatus !== "aktiv") {
    return {
      erlaubt: false,
      code: "mitgliedschaft_nicht_aktiv",
      grund: "Deine Mitgliedschaft ist nicht aktiv, deshalb sind gerade keine Buchungen möglich.",
    };
  }

  if (input.bereitsGebucht) {
    return {
      erlaubt: false,
      code: "bereits_gebucht",
      grund: "Du hast diesen Kurs bereits gebucht.",
    };
  }

  if (istVergangen(input.termin.datum_uhrzeit, input.jetzt)) {
    return { erlaubt: false, code: "kurs_vorbei", grund: "Dieser Kurs liegt bereits in der Vergangenheit." };
  }

  const fruehesteBuchung = input.termin.datum_uhrzeit.getTime() - BUCHUNGSFENSTER_TAGE_VORHER * MS_PRO_TAG;
  if (input.jetzt.getTime() < fruehesteBuchung) {
    return {
      erlaubt: false,
      code: "zu_frueh",
      grund: "Dieser Kurs ist noch nicht buchbar. Buchungen sind ab 7 Tage vor Kursbeginn möglich.",
    };
  }

  const spaetesteBuchung = input.termin.datum_uhrzeit.getTime() - BUCHUNGSFENSTER_STUNDEN_VORHER * MS_PRO_STUNDE;
  if (input.jetzt.getTime() > spaetesteBuchung) {
    return {
      erlaubt: false,
      code: "zu_spaet",
      grund: "Die Buchung ist nicht mehr möglich. Kurse lassen sich bis 1 Stunde vor Beginn buchen.",
    };
  }

  if (!hatFreiePlaetze(input.termin.format, input.termin.max_teilnehmer, input.termin.anzahl_gebucht)) {
    return {
      erlaubt: false,
      code: "kurs_voll",
      grund: "Dieser Kurs ist ausgebucht. Die Warteliste folgt in einem spaeteren Schritt.",
    };
  }

  if (tarifLimitErreicht(input.tarif, input.anzahlBuchungenImMonat)) {
    return {
      erlaubt: false,
      code: "tarif_limit",
      grund: `Mit dem Tarif ${formatLimit(input.tarif)} sind im Monat keine weiteren Buchungen moeglich.`,
    };
  }

  return { erlaubt: true };
}

function formatLimit(tarif: { max_buchungen_pro_monat: number | null }): string {
  return tarif.max_buchungen_pro_monat === null ? "unbegrenzt" : `max. ${tarif.max_buchungen_pro_monat}`;
}
