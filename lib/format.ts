import type { Format } from "@/lib/rules";

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONATE = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Formatiert ein Datum als "Di, 25. November". */
export function formatiereDatum(datum: Date): string {
  const d = new Date(datum);
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]}`;
}

/** Formatiert eine Uhrzeit als "19:00 Uhr". */
export function formatiereUhrzeit(datum: Date): string {
  const d = new Date(datum);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} Uhr`;
}

export function formatiereFormat(format: Format | string): string {
  return format === "Online" ? "Online" : "Studio";
}
