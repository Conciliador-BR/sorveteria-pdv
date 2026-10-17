import "server-only";
import { databaseUrlSchema, logLevelSchema, parseEnv, supabaseKeySchema, supabaseUrlSchema } from "./env-schema";

export function getDatabaseUrl() {
  return parseEnv("DATABASE_URL", process.env.DATABASE_URL, databaseUrlSchema);
}

export function getLogLevel() {
  return parseEnv("LOG_LEVEL", process.env.LOG_LEVEL, logLevelSchema);
}

export function getSupabaseUrl() {
  return parseEnv("SUPABASE_URL", process.env.SUPABASE_URL, supabaseUrlSchema);
}

// Chave pública (publishable/anon) usada só pelo Auth no servidor; nunca vai ao navegador.
export function getSupabasePublishableKey() {
  return parseEnv("SUPABASE_PUBLISHABLE_KEY", process.env.SUPABASE_PUBLISHABLE_KEY, supabaseKeySchema);
}

// Chave secreta (service_role/secret): só para o dono criar e editar logins. Nunca sai do servidor.
export function getSupabaseServiceRoleKey() {
  return parseEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY, supabaseKeySchema);
}
