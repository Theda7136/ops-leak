import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
      <body className={`${inter.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
