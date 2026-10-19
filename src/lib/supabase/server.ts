import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";
import { opcoesCookieSessao } from "./cookies";

// Cliente do Supabase Auth para Server Components e Server Actions.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookieOptions: opcoesCookieSessao,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components não gravam cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
