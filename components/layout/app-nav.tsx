"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Parte del día" },
  { href: "/projects/new", label: "Nuevo proyecto" },
  { href: "/reports/new", label: "Nueva jornada" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Principal">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link key={link.href} href={link.href} data-active={active}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
