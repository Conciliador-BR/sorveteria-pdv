import type { MetadataRoute } from "next";

// Torna o sistema instalável no tablet e no celular ("Adicionar à tela inicial").
// Cores iguais a --color-fundo e --color-primaria de globals.css (o manifesto não lê CSS).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sorveteria PDV",
    short_name: "Sorveteria",
    description: "Sistema de vendas da sorveteria",
    lang: "pt-BR",
    start_url: "/entrar",
    scope: "/",
    display: "standalone",
    background_color: "#f3f5f7",
    theme_color: "#0e7c9b",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
