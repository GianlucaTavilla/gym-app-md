"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { bucheTermin } from "@/app/actions";

export function BuchungsButton({
  terminId,
  mitgliedNr,
  ausgebucht,
}: {
  terminId: number;
  mitgliedNr: string | null;
  ausgebucht: boolean;
}) {
  const [istLaufend, startTransition] = useTransition();
  const [ergebnis, setErgebnis] = useState<{ ok: boolean; nachricht: string } | null>(null);
  const router = useRouter();

  function buchen() {
    startTransition(async () => {
      const res = await bucheTermin(terminId, mitgliedNr);
      setErgebnis(res);
      if (res.ok) router.refresh();
    });
  }

  const deaktiviert = istLaufend || !mitgliedNr;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={buchen}
        disabled={deaktiviert}
        className="inline-flex items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {istLaufend ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {ausgebucht ? "Trotzdem versuchen" : "Platz buchen"}
      </button>
      {!mitgliedNr ? (
        <p className="text-xs text-muted">Bitte oben auswaehlen, wer du bist.</p>
      ) : null}
      {ergebnis ? (
        <p
          className={`flex items-center gap-1.5 text-sm ${ergebnis.ok ? "text-accent" : "text-ink"}`}
          role="status"
        >
          {ergebnis.ok ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <TriangleAlert className="h-4 w-4 text-accent" aria-hidden />
          )}
          {ergebnis.nachricht}
        </p>
      ) : null}
    </div>
  );
}
