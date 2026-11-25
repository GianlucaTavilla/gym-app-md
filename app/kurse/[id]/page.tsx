import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, MonitorPlay, Users } from "lucide-react";
import { getTermin } from "@/lib/queries";
import { getAktuelleMitgliedNr } from "@/lib/session";
import { Badge, Card } from "@/components/ui";
import { BuchungsButton } from "@/components/buchungs-button";
import { formatiereDatum, formatiereUhrzeit } from "@/lib/format";
import { istImBuchungsfenster, istVergangen } from "@/lib/rules";

export const dynamic = "force-dynamic";

export default async function TerminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const terminId = Number(id);
  if (!Number.isInteger(terminId)) notFound();

  const [termin, mitgliedNr] = await Promise.all([getTermin(terminId), getAktuelleMitgliedNr()]);
  if (!termin) notFound();

  const jetzt = new Date();
  const vergangen = istVergangen(termin.datum_uhrzeit, jetzt);
  const imFenster = istImBuchungsfenster(termin.datum_uhrzeit, jetzt);
  const ausgebucht =
    termin.format === "Studio" &&
    termin.max_teilnehmer !== null &&
    termin.anzahl_gebucht >= termin.max_teilnehmer;
  const plaetzeFrei =
    termin.max_teilnehmer === null ? null : Math.max(0, termin.max_teilnehmer - termin.anzahl_gebucht);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Zurueck zum Kursplan
      </Link>

      <Card className="flex flex-col gap-6 p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge ton="accent">{termin.kursart}</Badge>
          <Badge ton="muted">
            {termin.format === "Online" ? (
              <>
                <MonitorPlay className="h-3.5 w-3.5" aria-hidden /> Online
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Studio
              </>
            )}
          </Badge>
          {ausgebucht ? <Badge ton="neutral">Ausgebucht</Badge> : null}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {formatiereDatum(termin.datum_uhrzeit)}
          </h1>
          <p className="flex items-center gap-2 text-lg text-muted">
            <Clock className="h-5 w-5" aria-hidden />
            <span className="tabular-nums">{formatiereUhrzeit(termin.datum_uhrzeit)}</span>
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-card bg-paper px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Trainer</dt>
            <dd className="text-base">{termin.trainer}</dd>
          </div>
          <div className="rounded-card bg-paper px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted">Plaetze</dt>
            <dd className="flex items-center gap-1.5 text-base">
              <Users className="h-4 w-4 text-muted" aria-hidden />
              {termin.format === "Online" ? (
                <span className="tabular-nums">{termin.anzahl_gebucht} gebucht (Online, ohne harte Grenze)</span>
              ) : plaetzeFrei === null ? (
                <span className="tabular-nums">{termin.anzahl_gebucht} gebucht</span>
              ) : (
                <span className="tabular-nums">
                  {plaetzeFrei} von {termin.max_teilnehmer} frei
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 border-t border-line pt-5">
          {vergangen ? (
            <p className="text-sm text-muted">Dieser Kurs liegt in der Vergangenheit.</p>
          ) : !imFenster ? (
            <p className="text-sm text-muted">
              Dieser Kurs ist noch nicht buchbar. Buchungen sind ab 7 Tage vor Kursbeginn moeglich.
            </p>
          ) : (
            <BuchungsButton terminId={termin.termin_id} mitgliedNr={mitgliedNr} ausgebucht={ausgebucht} />
          )}
        </div>
      </Card>
    </div>
  );
}