export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">FitZone Berlin</p>
      <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
        Kurse online buchen
      </h1>
      <p className="max-w-prose text-lg text-muted">
        Das technische Grundgeruest steht. Die Buchungsfunktionen folgen in Feature F-001.
      </p>
      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <p className="text-sm text-muted">
          Grundgeruest aktiv. Naechster Schritt: Kursplan, Kurstermin-Detailseite und Buchung.
        </p>
      </div>
    </main>
  );
}