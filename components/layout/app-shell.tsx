import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="rail">
        <Link href="/dashboard" className="mark">
          <strong>
            Ops<span>Leak</span>
          </strong>
          <small>Parte de obra</small>
        </Link>
        <AppNav />
      </aside>
      <div className="stage">{children}</div>
    </div>
  );
}
