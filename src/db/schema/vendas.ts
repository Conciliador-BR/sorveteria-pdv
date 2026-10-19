import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { caixas } from "./caixa";
import { funcionarios } from "./funcionarios";
import { produtos, tipoVenda } from "./produtos";

export const tipoBandeira = pgEnum("tipo_bandeira", ["debito", "credito"]);

// Editável pelo dono em /configuracoes; não se apaga (pagamentos apontam para ela), só se desativa.
// O índice sem diferenciar maiúsculas impede "Visa" e "visa" no mesmo tipo.
export const bandeiras = pgTable("bandeiras", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: tipoBandeira("tipo").notNull(),
  ordem: integer("ordem").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
}, (t) => [
  unique("bandeiras_nome_tipo_unico").on(t.nome, t.tipo),
  uniqueIndex("bandeiras_nome_tipo_sem_caixa_unico").on(sql`lower(${t.nome})`, t.tipo),
]).enableRLS();

export const tipoVendaOrigem = pgEnum("tipo_venda_origem", ["balcao", "comanda"]);
export const statusVenda = pgEnum("status_venda", ["aberta", "concluida", "cancelada"]);

// Comanda = venda `aberta`. `caixa_id` é o caixa de quem abriu; ao cobrar, passa a ser o caixa de quem cobrou.
export const vendas = pgTable("vendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  numero: integer("numero").generatedAlwaysAsIdentity().notNull().unique(),
  caixaId: uuid("caixa_id").notNull().references(() => caixas.id, { onDelete: "restrict" }),
  funcionarioId: uuid("funcionario_id").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  tipo: tipoVendaOrigem("tipo").notNull(),
  identificacao: text("identificacao"),
  status: statusVenda("status").notNull(),
  totalCentavos: integer("total_centavos").notNull().default(0),
  trocoCentavos: integer("troco_centavos").notNull().default(0),
  abertaEm: timestamp("aberta_em", { withTimezone: true }).notNull().defaultNow(),
  concluidaEm: timestamp("concluida_em", { withTimezone: true }),
  concluidaPor: uuid("concluida_por").references(() => funcionarios.id, { onDelete: "restrict" }),
  canceladaEm: timestamp("cancelada_em", { withTimezone: true }),
  canceladaPor: uuid("cancelada_por").references(() => funcionarios.id, { onDelete: "restrict" }),
  motivoCancelamento: text("motivo_cancelamento"),
}, (t) => [
  check("vendas_valores_positivos", sql`${t.totalCentavos} >= 0 and ${t.trocoCentavos} >= 0`),
  check("vendas_comanda_identificada", sql`${t.tipo} = 'balcao' or ${t.identificacao} is not null`),
  index("vendas_caixa_idx").on(t.caixaId),
  index("vendas_status_idx").on(t.status),
  index("vendas_concluida_em_idx").on(t.concluidaEm),
]).enableRLS();

// Nome e preço copiados do produto: mudar o cadastro não altera vendas antigas.
export const vendaItens = pgTable("venda_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendaId: uuid("venda_id").notNull().references(() => vendas.id, { onDelete: "restrict" }),
  produtoId: uuid("produto_id").notNull().references(() => produtos.id, { onDelete: "restrict" }),
  nomeProduto: text("nome_produto").notNull(),
  tipoVenda: tipoVenda("tipo_venda").notNull(),
  quantidade: integer("quantidade").notNull().default(1),
  pesoGramas: integer("peso_gramas"),
  // Produto por peso cobrado pelo valor que a balança mostrou: as gramas são estimadas.
  pesoPeloValor: boolean("peso_pelo_valor").notNull().default(false),
  precoUnitarioCentavos: integer("preco_unitario_centavos").notNull(),
  totalCentavos: integer("total_centavos").notNull(),
  lancadoPor: uuid("lancado_por").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("venda_itens_quantidade_positiva", sql`${t.quantidade} > 0`),
  check("venda_itens_peso_coerente", sql`(${t.tipoVenda} = 'peso') = (${t.pesoGramas} is not null and ${t.pesoGramas} > 0)`),
  check("venda_itens_peso_pelo_valor_coerente", sql`not ${t.pesoPeloValor} or ${t.tipoVenda} = 'peso'`),
  check("venda_itens_valores_positivos", sql`${t.precoUnitarioCentavos} >= 0 and ${t.totalCentavos} >= 0`),
  index("venda_itens_venda_idx").on(t.vendaId),
  index("venda_itens_produto_idx").on(t.produtoId),
]).enableRLS();

export const formaPagamento = pgEnum("forma_pagamento", ["dinheiro", "pix", "debito", "credito"]);

export const pagamentos = pgTable("pagamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendaId: uuid("venda_id").notNull().references(() => vendas.id, { onDelete: "restrict" }),
  forma: formaPagamento("forma").notNull(),
  bandeiraId: uuid("bandeira_id").references(() => bandeiras.id, { onDelete: "restrict" }),
  valorCentavos: integer("valor_centavos").notNull(),
  valorRecebidoCentavos: integer("valor_recebido_centavos"),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("pagamentos_valor_positivo", sql`${t.valorCentavos} > 0`),
  check("pagamentos_bandeira_so_cartao", sql`(${t.forma} in ('debito', 'credito')) = (${t.bandeiraId} is not null)`),
  check(
    "pagamentos_recebido_so_dinheiro",
    sql`${t.forma} = 'dinheiro' or ${t.valorRecebidoCentavos} is null`,
  ),
  index("pagamentos_venda_idx").on(t.vendaId),
]).enableRLS();

export type Venda = typeof vendas.$inferSelect;
