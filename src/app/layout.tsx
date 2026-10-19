import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// Inter é fonte variável (todos os pesos); Poppins não é, então os pesos vão explícitos.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
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
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
