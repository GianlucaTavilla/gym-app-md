import { CalendarX2 } from "lucide-react";
import { getKursplan } from "@/lib/queries";
import { KursKarte } from "@/components/kurs-karte";
import { LeererZustand } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function KursplanPage() {
  const kursplan = await getKursplan();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Kursplan</p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Kurse online buchen
        </h1>
        <p className="max-w-prose text-muted">
          Waehle einen Termin und sichere dir deinen Platz. Buchungen sind ab 7 Tage vor Kursbeginn
          bis 1 Stunde vorher moeglich.
        </p>
      </header>

      {kursplan.length === 0 ? (
        <LeererZustand
          titel="Noch keine Kurse geplant"
          text="Sobald Lisa Kurstermine anlegt, erscheinen sie hier."
          icon={<CalendarX2 className="h-8 w-8" aria-hidden />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {kursplan.map((eintrag) => (
            <KursKarte key={eintrag.termin_id} eintrag={eintrag} />
          ))}
        </div>
      )}
    </div>
  );
}
