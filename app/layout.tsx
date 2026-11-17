import type { Metadata } from "next";
import { Anybody, Atkinson_Hyperlegible } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const display = Anybody({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "OpsLeak",
  description:
    "Inteligencia operacional para equipos en campo, servicios y logística.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
