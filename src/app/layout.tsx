import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Inter (texto e números) e Plus Jakarta Sans (títulos) são fontes variáveis: todos os pesos vêm juntos.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sorveteria PDV",
  description: "Sistema de vendas da sorveteria",
  appleWebApp: { title: "Sorveteria" },
};

// Cor da barra do navegador e do app instalado (--color-primaria).
export const viewport: Viewport = {
  themeColor: "#0e7c9b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
