"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Ticket } from "lucide-react";

const LINKS = [
  { href: "/", label: "Kursplan", icon: CalendarDays },
  { href: "/meine-buchungen", label: "Meine Buchungen", icon: Ticket },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const aktiv = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={aktiv ? "page" : undefined}
            className={`flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium transition ${
              aktiv ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
