import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { codigoPostgres } from "@/db/erros";
import { bandeiras, configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";
import { nomeDaLoja } from "./regras";

export async function buscarNomeLojaSalvo() {
  const [linha] = await getDb().select({ nomeLoja: configuracoes.nomeLoja }).from(configuracoes).where(eq(configuracoes.id, 1)).limit(1);
  return linha?.nomeLoja ?? null;
}

export async function buscarDadosFiscais() {
  const [linha] = await getDb()
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
    .limit(1);
  return linha ?? { emitirNfce: false, razaoSocial: null, cnpj: null, inscricaoEstadual: null, endereco: null, uf: null };
}

export type DadosFiscais = Awaited<ReturnType<typeof buscarDadosFiscais>>;

// Para o cabeçalho da área logada: uma falha ao ler o nome não pode derrubar o balcão.
export async function buscarNomeLoja() {
  try {
    return nomeDaLoja(await buscarNomeLojaSalvo());
  } catch (erro) {
    logger.warn({ code: codigoPostgres(erro) }, "Falha ao ler o nome da loja");
    return nomeDaLoja(null);
  }
}

// Todas as bandeiras, ativas e desativadas, para o dono editar.
export async function listarBandeiras() {
  return getDb()
    .select({ id: bandeiras.id, nome: bandeiras.nome, tipo: bandeiras.tipo, ativo: bandeiras.ativo })
    .from(bandeiras)
    .orderBy(asc(bandeiras.tipo), asc(bandeiras.ordem), asc(bandeiras.nome))
    .limit(100);
}

export type BandeiraLista = Awaited<ReturnType<typeof listarBandeiras>>[number];
