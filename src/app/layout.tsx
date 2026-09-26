import type { Metadata, Viewport } from "next";
import { Montserrat, Bricolage_Grotesque } from "next/font/google";
import { BotonAyuda } from "@/components/ayuda";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Segunda tipografía, SOLO para titulares grandes (ver --font-display en tokens.css).
 * Montserrat es geométrica y ancha; Bricolage es estrecha y con formas algo irregulares,
 * así que a 40 px o más se lee como una voz distinta y no como "Montserrat más grande".
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${montserrat.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Vive en todas las pantallas: un defecto puede aparecer en cualquiera */}
        <BotonAyuda />
      </body>
    </html>
  );
}
