-- CreateTable
CREATE TABLE "Tarif" (
    "tarif_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "monatsbeitrag" INTEGER,
    "max_buchungen_pro_monat" INTEGER,
    "unbegrenzt" BOOLEAN NOT NULL DEFAULT false,
    "videozugang" BOOLEAN NOT NULL DEFAULT false,
    "stornofrei" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Mitglied" (
    "mitglied_nr" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "eintrittsdatum" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mitgliedschaft" (
    "mitgliedschaft_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mitglied_nr" TEXT NOT NULL,
    "tarif_id" INTEGER NOT NULL,
    "beginn" DATETIME NOT NULL,
    "vertragsende" DATETIME,
    "status" TEXT NOT NULL,
    "buchungssperre_bis" DATETIME,
    CONSTRAINT "Mitgliedschaft_mitglied_nr_fkey" FOREIGN KEY ("mitglied_nr") REFERENCES "Mitglied" ("mitglied_nr") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mitgliedschaft_tarif_id_fkey" FOREIGN KEY ("tarif_id") REFERENCES "Tarif" ("tarif_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kursart" (
    "kursart_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "max_teilnehmer" INTEGER
);

-- CreateTable
CREATE TABLE "Trainer" (
    "trainer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "anstellungsart" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Kurstermin" (
    "termin_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kursart_id" INTEGER NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "datum_uhrzeit" DATETIME NOT NULL,
    "format" TEXT NOT NULL,
    "zoom_link" TEXT,
    CONSTRAINT "Kurstermin_kursart_id_fkey" FOREIGN KEY ("kursart_id") REFERENCES "Kursart" ("kursart_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kurstermin_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "Trainer" ("trainer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Buchung" (
    "buchung_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mitglied_nr" TEXT NOT NULL,
    "termin_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "zeitpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storniert_am" DATETIME,
    "anwesenheit" TEXT,
    "stornogebuehr" INTEGER,
    "gebuehr_status" TEXT,
    "erlass_grund" TEXT,
    CONSTRAINT "Buchung_mitglied_nr_fkey" FOREIGN KEY ("mitglied_nr") REFERENCES "Mitglied" ("mitglied_nr") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Buchung_termin_id_fkey" FOREIGN KEY ("termin_id") REFERENCES "Kurstermin" ("termin_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tarif_name_key" ON "Tarif"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Kursart_name_key" ON "Kursart"("name");
