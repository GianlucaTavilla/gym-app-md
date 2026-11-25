import Link from "next/link";
import { MapPin, MonitorPlay, Users } from "lucide-react";
import { Badge, Card } from "./ui";
import { formatiereDatum, formatiereFormat, formatiereUhrzeit } from "@/lib/format";
import type { KursplanEintrag } from "@/lib/queries";

export function KursKarte({ eintrag }: { eintrag: KursplanEintrag }) {
  const ausgebucht =
    eintrag.format === "Studio" &&
    eintrag.max_teilnehmer !== null &&
    eintrag.anzahl_gebucht >= eintrag.max_teilnehmer;
  const plaetzeFrei =
    eintrag.max_teilnehmer === null ? null : Math.max(0, eintrag.max_teilnehmer - eintrag.anzahl_gebucht);

  return (
    <Card className="flex flex-col gap-4 p-5 transition hover:border-accent/40 hover:shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge ton="accent">{eintrag.kursart}</Badge>
          <Badge ton="muted">
            {eintrag.format === "Online" ? (
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
        <p className="font-display text-xl">
          {formatiereDatum(eintrag.datum_uhrzeit)} <span className="text-muted">·</span>{" "}
          <span className="tabular-nums">{formatiereUhrzeit(eintrag.datum_uhrzeit)}</span>
        </p>
        <p className="text-sm text-muted">Trainer: {eintrag.trainer}</p>
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Users className="h-4 w-4" aria-hidden />
          {eintrag.format === "Online" ? (
            <span className="tabular-nums">{eintrag.anzahl_gebucht} gebucht</span>
          ) : plaetzeFrei === null ? (
            <span className="tabular-nums">{eintrag.anzahl_gebucht} gebucht</span>
          ) : (
            <span className="tabular-nums">
              {plaetzeFrei} von {eintrag.max_teilnehmer} Plaetzen frei
            </span>
          )}
        </p>
        <Link
          href={`/kurse/${eintrag.termin_id}`}
          className="rounded-control border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Details & buchen
        </Link>
      </div>
    </Card>
  );
}
