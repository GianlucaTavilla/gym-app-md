"use server";

import { revalidatePath } from "next/cache";
import { bucheKurs } from "@/lib/booking";
import { clearAktuelleMitglied, setAktuelleMitgliedNr } from "@/lib/session";

export type BuchungsAktionErgebnis = { ok: boolean; nachricht: string };

export async function waehleMitglied(mitgliedNr: string): Promise<void> {
  await setAktuelleMitgliedNr(mitgliedNr);
  revalidatePath("/", "layout");
}

export async function abmelden(): Promise<void> {
  await clearAktuelleMitglied();
  revalidatePath("/", "layout");
}

export async function bucheTermin(terminId: number, mitgliedNr: string | null): Promise<BuchungsAktionErgebnis> {
  if (!mitgliedNr) {
    return { ok: false, nachricht: "Bitte waehle zuerst aus, wer du bist." };
  }
  const ergebnis = await bucheKurs(mitgliedNr, terminId);
  if (!ergebnis.ok) {
    return { ok: false, nachricht: ergebnis.grund };
  }
  revalidatePath("/");
  revalidatePath("/meine-buchungen");
  revalidatePath(`/kurse/${terminId}`);
  return { ok: true, nachricht: "Deine Buchung ist bestaetigt." };
}
