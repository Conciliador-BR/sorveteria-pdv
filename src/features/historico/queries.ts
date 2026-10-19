import "server-only";
import { and, asc, desc, eq, exists, gte, lt, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import { bandeiras, caixas, funcionarios, pagamentos, vendaItens, vendas } from "@/db/schema";
import { FUSO_LOJA, type FiltrosHistorico } from "./filtros";

const cancelador = alias(funcionarios, "cancelador");

// Início do dia (00:00 em São Paulo) como instante.
const inicioDoDia = (dia: string) => sql`(${dia}::date)::timestamp at time zone ${FUSO_LOJA}`;

function condicoes(filtros: FiltrosHistorico) {
  const lista: SQL[] = [];
  const momento = sql`coalesce(${vendas.concluidaEm}, ${vendas.abertaEm})`;
  if (filtros.de) lista.push(gte(momento, inicioDoDia(filtros.de)));
  if (filtros.ate) lista.push(lt(momento, sql`${inicioDoDia(filtros.ate)} + interval '1 day'`));
  if (filtros.funcionario) lista.push(eq(vendas.funcionarioId, filtros.funcionario));
  if (filtros.status) lista.push(eq(vendas.status, filtros.status));
  if (filtros.forma || filtros.bandeira) {
    const sub = [eq(pagamentos.vendaId, vendas.id)];
    if (filtros.forma) sub.push(eq(pagamentos.forma, filtros.forma));
    if (filtros.bandeira) sub.push(eq(pagamentos.bandeiraId, filtros.bandeira));
    lista.push(exists(getDb().select({ um: sql`1` }).from(pagamentos).where(and(...sub))));
  }
  return lista.length ? and(...lista) : undefined;
}

// Projeção comum da lista, do CSV e do cabeçalho do detalhe.
const colunasVenda = {
  id: vendas.id,
  numero: vendas.numero,
  tipo: vendas.tipo,
  identificacao: vendas.identificacao,
  status: vendas.status,
  totalCentavos: vendas.totalCentavos,
  trocoCentavos: vendas.trocoCentavos,
  abertaEm: vendas.abertaEm,
  concluidaEm: vendas.concluidaEm,
  canceladaEm: vendas.canceladaEm,
  funcionarioId: vendas.funcionarioId,
  funcionario: funcionarios.nome,
  canceladaPor: cancelador.nome,
  motivoCancelamento: vendas.motivoCancelamento,
  formas: sql<string | null>`(select string_agg(distinct ${pagamentos.forma}::text, ', ') from ${pagamentos} where ${pagamentos.vendaId} = ${vendas.id})`,
};

export async function listarVendas(filtros: FiltrosHistorico, limite = 200) {
  return getDb()
    .select(colunasVenda)
    .from(vendas)
    .innerJoin(funcionarios, eq(vendas.funcionarioId, funcionarios.id))
    .leftJoin(cancelador, eq(vendas.canceladaPor, cancelador.id))
    .where(condicoes(filtros))
    .orderBy(desc(vendas.numero))
    .limit(limite);
}

// Com `funcionarioId`, só acha a venda se ela for desse funcionário (quem não vê o histórico de todos).
export async function buscarVendaPorId(vendaId: string, funcionarioId?: string) {
  const filtro = funcionarioId ? and(eq(vendas.id, vendaId), eq(vendas.funcionarioId, funcionarioId)) : eq(vendas.id, vendaId);
  const [venda] = await getDb()
    .select({ ...colunasVenda, caixaId: vendas.caixaId, caixaStatus: caixas.status })
    .from(vendas)
    .innerJoin(funcionarios, eq(vendas.funcionarioId, funcionarios.id))
    .innerJoin(caixas, eq(vendas.caixaId, caixas.id))
    .leftJoin(cancelador, eq(vendas.canceladaPor, cancelador.id))
    .where(filtro)
    .limit(1);
  return venda ?? null;
}

export type VendaCabecalho = NonNullable<Awaited<ReturnType<typeof buscarVendaPorId>>>;

// Opções dos filtros: inclui desativados, que continuam no histórico.
export async function listarFuncionariosDoFiltro() {
  return getDb().select({ id: funcionarios.id, nome: funcionarios.nome }).from(funcionarios).orderBy(asc(funcionarios.nome)).limit(200);
}

export async function listarBandeirasDoFiltro() {
  return getDb()
    .select({ id: bandeiras.id, nome: bandeiras.nome, tipo: bandeiras.tipo })
    .from(bandeiras)
    .orderBy(asc(bandeiras.tipo), asc(bandeiras.ordem), asc(bandeiras.nome))
    .limit(100);
}

export type VendaLista = Awaited<ReturnType<typeof listarVendas>>[number];

export async function detalheDaVenda(vendaId: string) {
  const db = getDb();
  const [itens, pagos] = await Promise.all([
    db
      .select({
        id: vendaItens.id,
        nome: vendaItens.nomeProduto,
        tipoVenda: vendaItens.tipoVenda,
        quantidade: vendaItens.quantidade,
        pesoGramas: vendaItens.pesoGramas,
        precoUnitarioCentavos: vendaItens.precoUnitarioCentavos,
        totalCentavos: vendaItens.totalCentavos,
        lancadoPor: funcionarios.nome,
        criadoEm: vendaItens.criadoEm,
      })
      .from(vendaItens)
      .innerJoin(funcionarios, eq(vendaItens.lancadoPor, funcionarios.id))
      .where(eq(vendaItens.vendaId, vendaId))
      .orderBy(vendaItens.criadoEm),
    db
      .select({
        id: pagamentos.id,
        forma: pagamentos.forma,
        bandeira: bandeiras.nome,
        valorCentavos: pagamentos.valorCentavos,
        valorRecebidoCentavos: pagamentos.valorRecebidoCentavos,
      })
      .from(pagamentos)
      .leftJoin(bandeiras, eq(pagamentos.bandeiraId, bandeiras.id))
      .where(eq(pagamentos.vendaId, vendaId))
      .orderBy(pagamentos.criadoEm),
  ]);
  return { itens, pagamentos: pagos };
}

export type DetalheVenda = Awaited<ReturnType<typeof detalheDaVenda>>;
