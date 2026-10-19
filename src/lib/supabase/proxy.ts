import "server-only";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";
import { opcoesCookieSessao } from "./cookies";

// Renova o token de sessão a cada requisição (padrão do Supabase SSR para Next.js).
export async function updateSession(request: NextRequest) {
  // Visitante sem cookie de sessão não tem o que renovar.
  if (!request.cookies.getAll().some(({ name }) => name.startsWith("sb-"))) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookieOptions: opcoesCookieSessao,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
  // Nada entre createServerClient e getClaims: evita sessões perdidas.
  await supabase.auth.getClaims();
  return response;
}
