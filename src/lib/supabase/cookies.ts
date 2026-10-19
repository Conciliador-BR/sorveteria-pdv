import type { CookieOptionsWithName } from "@supabase/ssr";

// O navegador nunca usa o Supabase aqui, então o cookie de sessão fica fora do alcance do JavaScript.
export const opcoesCookieSessao: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
