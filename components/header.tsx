import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { getMitglieder } from "@/lib/queries";
import { getAktuelleMitgliedNr } from "@/lib/session";
import { MitgliedWaehler } from "./mitglied-waehler";
import { NavLinks } from "./nav-links";

export async function Header() {
  const [mitglieder, aktuelleNr] = await Promise.all([getMitglieder(), getAktuelleMitgliedNr()]);

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-accent-ink">
            <Dumbbell className="h-5 w-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">FitZone Berlin</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Kurse online buchen</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <NavLinks />
          <MitgliedWaehler
            mitglieder={mitglieder.map((m) => ({ mitglied_nr: m.mitglied_nr, name: m.name }))}
            aktuelleNr={aktuelleNr}
          />
        </div>
      </div>
    </header>
  );
}
