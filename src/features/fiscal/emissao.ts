import "server-only";
import { randomInt } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { codigoPostgres } from "@/db/erros";
import { auditoria, configuracoes, notasFiscais, vendas } from "@/db/schema";
import { FUSO_LOJA } from "@/features/historico/filtros";
import { logger } from "@/lib/logger";
import { anoMesNoFuso, montarChaveAcesso, type Uf } from "./regras";

// Série fixa enquanto a emissão é simulada; o emissor real define a série da loja.
const SERIE_SIMULADA = 1;

export type ResultadoEmissao = "emitida" | "ja_emitida" | "desligada" | "venda_invalida";

// Emite a NFC-e da venda em homologação SIMULADA: monta número e chave no formato oficial,
// mas não fala com a SEFAZ (sem protocolo, sem valor fiscal). Uma nota por venda.
export async function emitirNfce(vendaId: string, funcionarioId: string): Promise<ResultadoEmissao> {
  return getDb().transaction(async (tx) => {
    // Trava a configuração: o dono não troca o emitente no meio da emissão.
    const [config] = await tx
      .select({
        emitirNfce: configuracoes.emitirNfce,
        razaoSocial: configuracoes.razaoSocial,
        cnpj: configuracoes.cnpj,
        inscricaoEstadual: configuracoes.inscricaoEstadual,
        endereco: configuracoes.endereco,
        uf: configuracoes.uf,
      })
      .from(configuracoes)
      .where(eq(configuracoes.id, 1))
      .for("share")
      .limit(1);
    if (!config?.emitirNfce || !config.razaoSocial || !config.cnpj || !config.inscricaoEstadual || !config.endereco || !config.uf) return "desligada";

    const [venda] = await tx
      .select({ numero: vendas.numero })
      .from(vendas)
      .where(and(eq(vendas.id, vendaId), eq(vendas.status, "concluida")))
      .limit(1);
    if (!venda) return "venda_invalida";

    const agora = new Date();
    // Simulação: o número da nota acompanha o da venda; o código aleatório não pode repetir o número.
    let codigo = randomInt(0, 100_000_000);
    if (codigo === venda.numero) codigo = (codigo + 1) % 100_000_000;
    const chaveAcesso = montarChaveAcesso({
      uf: config.uf as Uf,
      ...anoMesNoFuso(agora, FUSO_LOJA),
      cnpj: config.cnpj,
      serie: SERIE_SIMULADA,
      numero: venda.numero,
      codigo,
    });
    const emitente = { razaoSocial: config.razaoSocial, cnpj: config.cnpj, inscricaoEstadual: config.inscricaoEstadual, endereco: config.endereco, uf: config.uf };

    const [nota] = await tx
      .insert(notasFiscais)
      .values({ vendaId, ambiente: "homologacao", serie: SERIE_SIMULADA, numero: venda.numero, chaveAcesso, emitente, emitidaEm: agora, emitidaPor: funcionarioId })
      .onConflictDoNothing({ target: notasFiscais.vendaId })
      .returning({ id: notasFiscais.id });
    if (!nota) return "ja_emitida";
    await tx.insert(auditoria).values({
      tabela: "notas_fiscais",
      registroId: nota.id,
      acao: "criar",
      dados: { vendaId, ambiente: "homologacao", serie: SERIE_SIMULADA, numero: venda.numero, chaveAcesso },
      funcionarioId,
    });
    return "emitida";
  });
}

// Depois de concluir a venda: a falha na nota não desfaz a venda; o comprovante oferece emitir de novo.
export async function emitirNfceSeLigada(vendaId: string, funcionarioId: string) {
  try {
    await emitirNfce(vendaId, funcionarioId);
  } catch (erro) {
    logger.error({ code: codigoPostgres(erro), vendaId }, "Falha ao emitir a NFC-e da venda");
  }
}
