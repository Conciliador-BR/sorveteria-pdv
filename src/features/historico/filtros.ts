import { z } from "zod";

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined);

// Filtros vindos da URL (?de=2026-10-01&ate=2026-10-17&funcionario=…&forma=…&status=…).
export const filtrosSchema = z.object({
  de: data,
  ate: data,
  funcionario: z.uuid().optional().catch(undefined),
  forma: z.enum(["dinheiro", "pix", "debito", "credito"]).optional().catch(undefined),
  bandeira: z.uuid().optional().catch(undefined),
  status: z.enum(["concluida", "cancelada", "aberta"]).optional().catch(undefined),
});

export type FiltrosHistorico = z.infer<typeof filtrosSchema>;

export function lerFiltros(params: Record<string, string | string[] | undefined>) {
  const simples = Object.fromEntries(Object.entries(params).map(([chave, valor]) => [chave, Array.isArray(valor) ? valor[0] : valor || undefined]));
  return filtrosSchema.parse(simples);
}

// Período em dias do fuso da loja, convertido para instantes UTC.
export const FUSO_LOJA = "America/Sao_Paulo";

export function hojeNaLoja(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_LOJA, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

// CSV com ; (Excel em português) e campos entre aspas.
export function linhaCsv(campos: (string | number | null | undefined)[]) {
  return campos.map((campo) => `"${String(campo ?? "").replace(/"/g, '""')}"`).join(";");
}

// Filtros que valem de fato: sem período escolhido, mostra hoje; sem permissão de histórico,
// o funcionário só vê as próprias vendas, não importa o que venha na URL.
export function filtrosEfetivos(filtros: FiltrosHistorico, acesso: { veTodas: boolean; funcionarioId: string }, hoje = hojeNaLoja()): FiltrosHistorico {
  const semPeriodo = !filtros.de && !filtros.ate;
  return {
    ...filtros,
    de: semPeriodo ? hoje : filtros.de,
    ate: semPeriodo ? hoje : filtros.ate,
    funcionario: acesso.veTodas ? filtros.funcionario : acesso.funcionarioId,
  };
}

// Mesmos filtros como query string (para o link de exportar CSV).
export function consultaDosFiltros(filtros: FiltrosHistorico) {
  const consulta = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) if (valor) consulta.set(chave, valor);
  return consulta.toString();
}
