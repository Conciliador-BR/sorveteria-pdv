import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { produtos } from "./produtos";

// Precificação (exclusiva do dono). Percentuais em centésimos de ponto: 3000 = 30%.

export const unidadeInsumo = pgEnum("unidade_insumo", ["g", "ml", "un"]);
// percentual = o dono digita o %; simples = alíquota efetiva pelo anexo e receita de 12 meses; mei = DAS fixo do mês.
export const regimeImposto = pgEnum("regime_imposto", ["percentual", "simples", "mei"]);
export const anexoSimples = pgEnum("anexo_simples", ["I", "II"]);

// O que a loja compra para fabricar: o custo sai do preço da embalagem ÷ quantidade que vem nela.
export const insumos = pgTable("insumos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  unidade: unidadeInsumo("unidade").notNull(),
  embalagemQuantidade: integer("embalagem_quantidade").notNull(),
  embalagemPrecoCentavos: integer("embalagem_preco_centavos").notNull(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("insumos_embalagem_quantidade_positiva", sql`${t.embalagemQuantidade} > 0`),
  check("insumos_embalagem_preco_positivo", sql`${t.embalagemPrecoCentavos} >= 0`),
  uniqueIndex("insumos_nome_sem_caixa_unico").on(sql`lower(${t.nome})`),
]).enableRLS();

// Receita do produto: quanto de cada insumo ela leva (na unidade do insumo).
export const fichaTecnicaItens = pgTable("ficha_tecnica_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  produtoId: uuid("produto_id").notNull().references(() => produtos.id, { onDelete: "cascade" }),
  insumoId: uuid("insumo_id").notNull().references(() => insumos.id, { onDelete: "restrict" }),
  quantidade: integer("quantidade").notNull(),
}, (t) => [
  check("ficha_tecnica_itens_quantidade_positiva", sql`${t.quantidade} > 0`),
  uniqueIndex("ficha_tecnica_itens_produto_insumo_unico").on(t.produtoId, t.insumoId),
  index("ficha_tecnica_itens_insumo_idx").on(t.insumoId),
]).enableRLS();

// Rendimento da receita (unidades, ou gramas para produto por peso) e margem própria do produto.
// Sem linha: rende 1 unidade (ou 1 kg) e usa a margem padrão.
export const precificacaoProdutos = pgTable("precificacao_produtos", {
  produtoId: uuid("produto_id").primaryKey().references(() => produtos.id, { onDelete: "cascade" }),
  rendimento: integer("rendimento").notNull(),
  margemPercentual: integer("margem_percentual"),
}, (t) => [
  check("precificacao_produtos_rendimento_positivo", sql`${t.rendimento} > 0`),
  check("precificacao_produtos_margem_faixa", sql`${t.margemPercentual} between 0 and 9900`),
]).enableRLS();

export const custosFixos = pgTable("custos_fixos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  valorMensalCentavos: integer("valor_mensal_centavos").notNull(),
}, (t) => [check("custos_fixos_valor_positivo", sql`${t.valorMensalCentavos} >= 0`)]).enableRLS();

// Depreciação linear: (compra − residual) ÷ vida útil, somada aos custos fixos do mês.
export const maquinas = pgTable("maquinas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  valorCompraCentavos: integer("valor_compra_centavos").notNull(),
  valorResidualCentavos: integer("valor_residual_centavos").notNull().default(0),
  vidaUtilMeses: integer("vida_util_meses").notNull(),
}, (t) => [
  check("maquinas_valores_validos", sql`${t.valorResidualCentavos} >= 0 and ${t.valorResidualCentavos} <= ${t.valorCompraCentavos}`),
  check("maquinas_vida_util_positiva", sql`${t.vidaUtilMeses} > 0`),
]).enableRLS();

// Linha única (id = 1, semeada pela migration).
export const precificacaoParametros = pgTable("precificacao_parametros", {
  id: integer("id").primaryKey().default(1),
  faturamentoMensalCentavos: integer("faturamento_mensal_centavos"),
  impostoPercentual: integer("imposto_percentual").notNull().default(0),
  taxaCartaoPercentual: integer("taxa_cartao_percentual").notNull().default(0),
  parteCartaoPercentual: integer("parte_cartao_percentual").notNull().default(0),
  perdasPercentual: integer("perdas_percentual").notNull().default(0),
  margemPadraoPercentual: integer("margem_padrao_percentual").notNull().default(3000),
  regimeImposto: regimeImposto("regime_imposto").notNull().default("percentual"),
  anexoSimples: anexoSimples("anexo_simples").notNull().default("I"),
  receita12MesesCentavos: integer("receita_12_meses_centavos"),
  dasMensalCentavos: integer("das_mensal_centavos"),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("precificacao_parametros_linha_unica", sql`${t.id} = 1`),
  check("precificacao_parametros_faturamento_positivo", sql`${t.faturamentoMensalCentavos} > 0`),
  check("precificacao_parametros_receita_12_meses_positiva", sql`${t.receita12MesesCentavos} > 0`),
  check("precificacao_parametros_das_positivo", sql`${t.dasMensalCentavos} >= 0`),
  check(
    "precificacao_parametros_percentuais_faixa",
    sql`${t.impostoPercentual} between 0 and 9900 and ${t.taxaCartaoPercentual} between 0 and 9900 and ${t.parteCartaoPercentual} between 0 and 10000 and ${t.perdasPercentual} between 0 and 9900 and ${t.margemPadraoPercentual} between 0 and 9900`,
  ),
]).enableRLS();
