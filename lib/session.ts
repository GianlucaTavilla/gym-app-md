import { cookies } from "next/headers";

// Identitaet ueber Mitgliederauswahl ohne Passwort (siehe docs/decisions.md).
// Die gewaehlte Mitgliedsnummer wird in einem Cookie gehalten.
const COOKIE = "fitzone_mitglied";

export async function getAktuelleMitgliedNr(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function setAktuelleMitgliedNr(mitgliedNr: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, mitgliedNr, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearAktuelleMitglied(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
