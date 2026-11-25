import { describe, expect, it } from "vitest";
import {
  BUCHUNGSFENSTER_STUNDEN_VORHER,
  BUCHUNGSFENSTER_TAGE_VORHER,
  hatFreiePlaetze,
  istImBuchungsfenster,
  pruefeBuchung,
  tarifLimitErreicht,
  type BuchungsPruefungInput,
} from "../lib/rules";

// Feste Bezugszeit, damit die Tests unabhaengig von der Systemuhr sind.
const JETZT = new Date("2026-11-25T10:00:00.000Z");
const MS_PRO_TAG = 24 * 60 * 60 * 1000;
const MS_PRO_STUNDE = 60 * 60 * 1000;

function termin(offsetMs: number) {
  return new Date(JETZT.getTime() + offsetMs);
}

const aktiveMitgliedschaft = "aktiv" as const;
const basisTarif = { max_buchungen_pro_monat: 5, unbegrenzt: false };

function eingabe(overrides: Partial<BuchungsPruefungInput> = {}): BuchungsPruefungInput {
  return {
    jetzt: JETZT,
    termin: {
      datum_uhrzeit: termin(3 * MS_PRO_TAG),
      format: "Studio",
      max_teilnehmer: 15,
      anzahl_gebucht: 0,
    },
    tarif: basisTarif,
    anzahlBuchungenImMonat: 0,
    bereitsGebucht: false,
    mitgliedschaftStatus: aktiveMitgliedschaft,
    ...overrides,
  };
}

describe("BR1 Buchungsfenster", () => {
  it("erlaubt eine Buchung genau am Rand von 7 Tagen vorher", () => {
    const kurs = termin(BUCHUNGSFENSTER_TAGE_VORHER * MS_PRO_TAG);
    expect(istImBuchungsfenster(kurs, JETZT)).toBe(true);
  });

  it("verbietet eine Buchung frueher als 7 Tage vorher", () => {
    const kurs = termin(BUCHUNGSFENSTER_TAGE_VORHER * MS_PRO_TAG + 1000);
    expect(istImBuchungsfenster(kurs, JETZT)).toBe(false);
  });

  it("erlaubt eine Buchung genau bis 1 Stunde vorher", () => {
    const kurs = termin(BUCHUNGSFENSTER_STUNDEN_VORHER * MS_PRO_STUNDE);
    expect(istImBuchungsfenster(kurs, JETZT)).toBe(true);
  });

  it("verbietet eine Buchung weniger als 1 Stunde vorher", () => {
    const kurs = termin(BUCHUNGSFENSTER_STUNDEN_VORHER * MS_PRO_STUNDE - 1000);
    expect(istImBuchungsfenster(kurs, JETZT)).toBe(false);
  });

  it("lehnt zu fruehe Buchungen mit sprechendem Grund ab", () => {
    const ergebnis = pruefeBuchung(
      eingabe({ termin: { datum_uhrzeit: termin(8 * MS_PRO_TAG), format: "Studio", max_teilnehmer: 15, anzahl_gebucht: 0 } })
    );
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("zu_frueh");
  });

  it("lehnt zu spaete Buchungen mit sprechendem Grund ab", () => {
    const ergebnis = pruefeBuchung(
      eingabe({ termin: { datum_uhrzeit: termin(30 * 60 * 1000), format: "Studio", max_teilnehmer: 15, anzahl_gebucht: 0 } })
    );
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("zu_spaet");
  });
});

describe("BR1 Kapazitaet", () => {
  it("blockiert einen vollen Studio-Kurs", () => {
    expect(hatFreiePlaetze("Studio", 15, 15)).toBe(false);
  });

  it("erlaubt einen Platz unter dem Limit", () => {
    expect(hatFreiePlaetze("Studio", 15, 14)).toBe(true);
  });

  it("erlaubt Online-Kurse ohne harte Grenze (weiche Obergrenze offen)", () => {
    expect(hatFreiePlaetze("Online", null, 999)).toBe(true);
  });

  it("erlaubt Kursarten ohne hinterlegtes Limit nicht als voll zu gelten", () => {
    expect(hatFreiePlaetze("Studio", null, 999)).toBe(true);
  });

  it("lehnt eine Buchung in einen vollen Studio-Kurs ab", () => {
    const ergebnis = pruefeBuchung(
      eingabe({ termin: { datum_uhrzeit: termin(2 * MS_PRO_TAG), format: "Studio", max_teilnehmer: 12, anzahl_gebucht: 12 } })
    );
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("kurs_voll");
  });

  it("erlaubt eine Buchung in einen Online-Kurs ueber das Limit hinaus", () => {
    const ergebnis = pruefeBuchung(
      eingabe({ termin: { datum_uhrzeit: termin(2 * MS_PRO_TAG), format: "Online", max_teilnehmer: 12, anzahl_gebucht: 50 } })
    );
    expect(ergebnis.erlaubt).toBe(true);
  });
});

describe("BR3 Tarif-Limit", () => {
  it("sperrt Basic nach 5 Buchungen im Monat", () => {
    expect(tarifLimitErreicht(basisTarif, 5)).toBe(true);
  });

  it("laesst Basic vor dem Limit zu", () => {
    expect(tarifLimitErreicht(basisTarif, 4)).toBe(false);
  });

  it("laesst Premium unbegrenzt zu", () => {
    expect(tarifLimitErreicht({ max_buchungen_pro_monat: null, unbegrenzt: true }, 1000)).toBe(false);
  });

  it("erfindet kein Limit, wenn der Tarifwert offen ist (Plus)", () => {
    expect(tarifLimitErreicht({ max_buchungen_pro_monat: null, unbegrenzt: false }, 1000)).toBe(false);
  });

  it("lehnt eine Buchung ab, wenn das Basic-Limit erreicht ist", () => {
    const ergebnis = pruefeBuchung(eingabe({ anzahlBuchungenImMonat: 5 }));
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("tarif_limit");
  });

  it("erlaubt Premium auch bei vielen Buchungen im Monat", () => {
    const ergebnis = pruefeBuchung(
      eingabe({ tarif: { max_buchungen_pro_monat: null, unbegrenzt: true }, anzahlBuchungenImMonat: 999 })
    );
    expect(ergebnis.erlaubt).toBe(true);
  });
});

describe("Voraussetzungen", () => {
  it("lehnt Buchungen bei nicht aktiver Mitgliedschaft ab", () => {
    const ergebnis = pruefeBuchung(eingabe({ mitgliedschaftStatus: "pausiert" }));
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("mitgliedschaft_nicht_aktiv");
  });

  it("lehnt Doppelbuchungen desselben Termins ab", () => {
    const ergebnis = pruefeBuchung(eingabe({ bereitsGebucht: true }));
    expect(ergebnis.erlaubt).toBe(false);
    if (!ergebnis.erlaubt) expect(ergebnis.code).toBe("bereits_gebucht");
  });

  it("erlaubt eine gueltige Buchung", () => {
    expect(pruefeBuchung(eingabe()).erlaubt).toBe(true);
  });
});
