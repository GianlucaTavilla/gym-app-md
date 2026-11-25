// Seed-Daten fuer F-001. Erzeugt Testdaten, die den SPEC-Vorgaben entsprechen.
// Ausfuehren mit: node_modules\.bin\jiti.cmd lib/seed.ts
import { prisma } from "./db";

const MS_PRO_TAG = 24 * 60 * 60 * 1000;

function tag(hourUtc: number, minute = 0, tageAbHeute = 0): Date {
  const d = new Date();
  d.setHours(hourUtc, minute, 0, 0);
  d.setDate(d.getDate() + tageAbHeute);
  return d;
}

async function main() {
  await prisma.buchung.deleteMany();
  await prisma.kurstermin.deleteMany();
  await prisma.mitgliedschaft.deleteMany();
  await prisma.mitglied.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.kursart.deleteMany();
  await prisma.tarif.deleteMany();

  // Tarife: Basic 5 Buchungen, Plus offen (kein erfundener Wert), Premium unbegrenzt.
  const basic = await prisma.tarif.create({
    data: { name: "Basic", monatsbeitrag: 2900, max_buchungen_pro_monat: 5, unbegrenzt: false, videozugang: false, stornofrei: false },
  });
  const plus = await prisma.tarif.create({
    data: { name: "Plus", monatsbeitrag: 4900, max_buchungen_pro_monat: null, unbegrenzt: false, videozugang: true, stornofrei: false },
  });
  const premium = await prisma.tarif.create({
    data: { name: "Premium", monatsbeitrag: 7900, max_buchungen_pro_monat: null, unbegrenzt: true, videozugang: true, stornofrei: true },
  });

  // Kursarten: max_teilnehmer nur dort, wo die SPEC eine Zahl nennt.
  const yoga = await prisma.kursart.create({ data: { name: "Yoga", max_teilnehmer: 15 } });
  const pilates = await prisma.kursart.create({ data: { name: "Pilates", max_teilnehmer: null } });
  const spinning = await prisma.kursart.create({ data: { name: "Spinning", max_teilnehmer: 12 } });
  const hiit = await prisma.kursart.create({ data: { name: "HIIT", max_teilnehmer: null } });
  const bodyworkout = await prisma.kursart.create({ data: { name: "Bodyworkout/Functional", max_teilnehmer: 20 } });

  const tom = await prisma.trainer.create({ data: { name: "Tom Berger", anstellungsart: "fest" } });
  const marie = await prisma.trainer.create({ data: { name: "Marie Klein", anstellungsart: "fest" } });
  const jonas = await prisma.trainer.create({ data: { name: "Jonas Weber", anstellungsart: "Honorar" } });

  // Mitglieder mit Mitgliedschaft (Historie moeglich, hier je ein aktiver Datensatz).
  const mitglieder = [
    { mitglied_nr: "M-1001", name: "Anna Schmidt", whatsapp: "+49 170 0000001", email: "anna@example.com", tarif: basic },
    { mitglied_nr: "M-1002", name: "Ben Krause", whatsapp: "+49 170 0000002", email: "ben@example.com", tarif: basic },
    { mitglied_nr: "M-1003", name: "Carla Vidal", whatsapp: "+49 170 0000003", email: "carla@example.com", tarif: plus },
    { mitglied_nr: "M-1004", name: "David Okoro", whatsapp: "+49 170 0000004", email: "david@example.com", tarif: premium },
    { mitglied_nr: "M-1005", name: "Emma Fischer", whatsapp: "+49 170 0000005", email: "emma@example.com", tarif: basic },
  ];
  for (const m of mitglieder) {
    await prisma.mitglied.create({
      data: {
        mitglied_nr: m.mitglied_nr,
        name: m.name,
        whatsapp: m.whatsapp,
        email: m.email,
        eintrittsdatum: tag(9, 0, -200),
        mitgliedschaften: {
          create: {
            tarif_id: m.tarif.tarif_id,
            beginn: tag(9, 0, -200),
            vertragsende: null,
            status: "aktiv",
            buchungssperre_bis: null,
          },
        },
      },
    });
  }

  // Kurstermine: teils im Buchungsfenster (1-6 Tage), teils zu frueh (10 Tage).
  const termine = [
    { kursart: yoga, trainer: marie, offset: 1, hour: 19, format: "Studio" },
    { kursart: spinning, trainer: tom, offset: 2, hour: 18, format: "Studio" },
    { kursart: pilates, trainer: marie, offset: 2, hour: 20, format: "Studio" },
    { kursart: hiit, trainer: jonas, offset: 3, hour: 7, format: "Studio" },
    { kursart: bodyworkout, trainer: tom, offset: 3, hour: 18, format: "Studio" },
    { kursart: yoga, trainer: marie, offset: 4, hour: 19, format: "Online" },
    { kursart: spinning, trainer: tom, offset: 6, hour: 18, format: "Studio" },
    { kursart: yoga, trainer: jonas, offset: 10, hour: 19, format: "Studio" },
  ];
  for (const t of termine) {
    await prisma.kurstermin.create({
      data: {
        kursart_id: t.kursart.kursart_id,
        trainer_id: t.trainer.trainer_id,
        datum_uhrzeit: tag(t.hour, 0, t.offset),
        format: t.format,
        zoom_link: t.format === "Online" ? "https://zoom.example.com/j/123456789" : null,
      },
    });
  }

  const zaehler = {
    tarife: await prisma.tarif.count(),
    mitglieder: await prisma.mitglied.count(),
    kursarten: await prisma.kursart.count(),
    trainer: await prisma.trainer.count(),
    termine: await prisma.kurstermin.count(),
  };
  console.log("Seed abgeschlossen:", zaehler);
  void MS_PRO_TAG;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
