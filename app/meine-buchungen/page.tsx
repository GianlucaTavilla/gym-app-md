import Link from "next/link";
import { CalendarDays, MapPin, MonitorPlay, Ticket } from "lucide-react";
import { getBuchungenFuerMitglied } from "@/lib/queries";
import { getAktuelleMitgliedNr } from "@/lib/session";
import { Badge, Card, LeererZustand } from "@/components/ui";
import { formatiereDatum, formatiereUhrzeit } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MeineBuchungenPage() {
  const mitgliedNr = await getAktuelleMitgliedNr();
  const buchungen = mitgliedNr ? await getBuchungenFuerMitglied(mitgliedNr) : [];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Meine Buchungen</p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Deine gebuchten Kurse
        </h1>
      </header>

      {!mitgliedNr ? (
        <LeererZustand
          titel="Bitte zuerst auswaehlen, wer du bist"
          text="Waehle oben rechts deinen Namen aus, dann zeigen wir hier deine Buchungen."
          icon={<Ticket className="h-8 w-8" aria-hidden />}
        />
      ) : buchungen.length === 0 ? (
        <LeererZustand
          titel="Noch keine Buchungen"
          text="Du hast bisher keinen Kurs gebucht. Im Kursplan findest du alle Termine."
          icon={<CalendarDays className="h-8 w-8" aria-hidden />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {buchungen.map((b) => (
            <Card key={b.buchung_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge ton="accent">{b.kursart}</Badge>
                  <Badge ton="muted">
                    {b.format === "Online" ? (
                      <>
                        <MonitorPlay className="h-3.5 w-3.5" aria-hidden /> Online
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3.5 w-3.5" aria-hidden /> Studio
                      </>
                    )}
                  </Badge>
                  <Badge ton="neutral">{b.status}</Badge>
                </div>
                <p className="font-display text-lg">
                  {formatiereDatum(b.datum_uhrzeit)} <span className="text-muted">·</span>{" "}
                  <span className="tabular-nums">{formatiereUhrzeit(b.datum_uhrzeit)}</span>
                </p>
                <p className="text-sm text-muted">Trainer: {b.trainer}</p>
              </div>
              <Link
                href={`/kurse/${b.termin_id}`}
                className="self-start rounded-control border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent sm:self-auto"
              >
                Details
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}