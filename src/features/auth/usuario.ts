import { z } from "zod";

// O Supabase Auth exige e-mail; o funcionário digita só o usuário.
export const DOMINIO_LOGIN = "sorveteria.local";

export const usuarioSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,32}$/, "Use de 3 a 32 letras, números, ponto, hífen ou sublinhado.");

export const loginSchema = z.object({
  usuario: usuarioSchema,
  senha: z.string().min(6, "A senha tem pelo menos 6 caracteres.").max(72),
});

export function usuarioParaEmail(usuario: string) {
  return `${usuarioSchema.parse(usuario)}@${DOMINIO_LOGIN}`;
}
