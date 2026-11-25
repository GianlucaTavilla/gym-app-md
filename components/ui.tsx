import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  );
}

type BadgeTon = "accent" | "neutral" | "muted";

export function Badge({ children, ton = "neutral" }: { children: ReactNode; ton?: BadgeTon }) {
  const stil =
    ton === "accent"
      ? "bg-accent-soft text-accent"
      : ton === "muted"
        ? "bg-paper text-muted"
        : "bg-paper text-ink";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${stil}`}>
      {children}
    </span>
  );
}

export function LeererZustand({
  titel,
  text,
  icon,
}: {
  titel: string;
  text: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      {icon ? <div className="text-accent">{icon}</div> : null}
      <p className="font-display text-xl">{titel}</p>
      <p className="max-w-sm text-sm text-muted">{text}</p>
    </div>
  );
}
