import type { Metadata } from "next";
import { Teko, Noto_Sans } from "next/font/google";
import "./globals.css";

const tekoFont = Teko({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Génesis Arq — Estudio de Arquitectura",
  description:
    "Estudio de arquitectura en Buenos Aires. Espacios habitables, luz medida y materia honesta.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${tekoFont.variable} ${notoSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
