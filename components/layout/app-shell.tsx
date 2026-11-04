import { Radar } from "lucide-react";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-sky-300">
            <Radar className="size-4" />
            OpsLeak
          </Link>
          <AppNav />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        {children}
      </div>
    </div>
  );
}
