import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bursa — Aprende finanzas personales",
  description:
    "Plataforma de educación financiera para jóvenes colombianos. Aprende sobre dinero, ahorro, inversión y crédito con ejercicios interactivos.",
  keywords: [
    "educación financiera",
    "finanzas personales",
    "Colombia",
    "ahorro",
    "inversión",
    "crédito",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${montserrat.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
