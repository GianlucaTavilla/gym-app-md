"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { waehleMitglied, abmelden } from "@/app/actions";

export function MitgliedWaehler({
  mitglieder,
  aktuelleNr,
}: {
  mitglieder: { mitglied_nr: string; name: string }[];
  aktuelleNr: string | null;
}) {
  const [istLaufend, startTransition] = useTransition();
  const router = useRouter();

  function wechseln(mitgliedNr: string) {
    if (!mitgliedNr) return;
    startTransition(async () => {
      await waehleMitglied(mitgliedNr);
      router.refresh();
    });
  }

  function abmeldenKlick() {
    startTransition(async () => {
      await abmelden();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-sm text-muted">
        <UserRound className="h-4 w-4" aria-hidden />
        <span className="sr-only">Wer bist du?</span>
        <select
          value={aktuelleNr ?? ""}
          disabled={istLaufend}
          onChange={(e) => wechseln(e.target.value)}
          className="rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        >
          <option value="" disabled>
            Wer bist du?
          </option>
          {mitglieder.map((m) => (
            <option key={m.mitglied_nr} value={m.mitglied_nr}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      {aktuelleNr ? (
        <button
          type="button"
          onClick={abmeldenKlick}
          disabled={istLaufend}
          className="rounded-control px-3 py-2 text-sm text-muted transition hover:text-ink disabled:opacity-60"
        >
          Abmelden
        </button>
      ) : null}
    </div>
  );
}
