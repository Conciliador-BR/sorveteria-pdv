import { z } from "zod";

// Estado padrão devolvido pelas Server Actions de formulário.
export type EstadoFormulario = { ok?: string; erro?: string; campos?: Record<string, string>; envio?: number };

export const proximoEnvio = (anterior: EstadoFormulario) => (anterior.envio ?? 0) + 1;

export function lerFormulario(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

// Caixa de seleção: marcada chega como "on"; desmarcada não chega.
export const marcado = z.preprocess((valor) => valor === "on" || valor === "true" || valor === true, z.boolean());

export const vazioViraNulo = (valor: unknown) => (typeof valor === "string" && valor.trim() === "" ? null : valor);

// Primeiro erro de cada campo, para mostrar junto do campo.
export function errosPorCampo(erro: z.ZodError) {
  const erros: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "geral");
    erros[campo] ??= issue.message;
  }
  return erros;
}
