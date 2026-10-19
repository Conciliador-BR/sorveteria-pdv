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
