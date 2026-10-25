import { sql } from "drizzle-orm";
import { boolean, check, customType, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { funcionarios } from "./funcionarios";

export const tipoVenda = pgEnum("tipo_venda", ["unidade", "peso"]);

export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull().unique(),
  ordem: integer("ordem").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
}).enableRLS();

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

// Foto enviada pelo dono, já reduzida no navegador (até 300 KB). Fica no banco para não depender de
// outro serviço nem expor chave; cada troca cria uma linha nova (endereço novo, cache sem dor de cabeça).
export const produtoFotos = pgTable("produto_fotos", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: text("tipo").notNull(),
  conteudo: bytea("conteudo").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("produto_fotos_tipo", sql`${t.tipo} in ('image/webp', 'image/jpeg', 'image/png')`),
  check("produto_fotos_tamanho", sql`octet_length(${t.conteudo}) between 1 and 307200`),
]).enableRLS();

// Preço por unidade ou por kg (tipo `peso`). Estoque contado em unidades ou em gramas.
export const produtos = pgTable("produtos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  categoriaId: uuid("categoria_id").references(() => categorias.id, { onDelete: "restrict" }),
  tipoVenda: tipoVenda("tipo_venda").notNull().default("unidade"),
  precoCentavos: integer("preco_centavos").notNull(),
  codigo: text("codigo").unique(),
  estoqueMinimo: integer("estoque_minimo").notNull().default(0),
  baixaAutomatica: boolean("baixa_automatica").notNull().default(true),
  ativo: boolean("ativo").notNull().default(true),
  // Imagem da galeria padrão (nome do arquivo) ou foto enviada; nunca as duas.
  imagem: text("imagem"),
  fotoId: uuid("foto_id").references(() => produtoFotos.id, { onDelete: "set null" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("produtos_imagem_formato", sql`${t.imagem} ~ '^[a-z0-9-]{1,60}$'`),
  check("produtos_uma_imagem", sql`${t.imagem} is null or ${t.fotoId} is null`),
  check("produtos_preco_positivo", sql`${t.precoCentavos} >= 0`),
  check("produtos_estoque_minimo_positivo", sql`${t.estoqueMinimo} >= 0`),
  index("produtos_categoria_idx").on(t.categoriaId),
]).enableRLS();

export const tipoMovimentoEstoque = pgEnum("tipo_movimento_estoque", ["entrada", "saida", "ajuste", "venda", "cancelamento"]);
export const motivoMovimentoEstoque = pgEnum("motivo_movimento_estoque", [
  "compra",
  "perda",
  "consumo_interno",
  "ajuste_contagem",
  "venda",
  "cancelamento",
  "outro",
]);

// Saldo = soma de `quantidade` (com sinal). Ninguém edita saldo direto.
export const estoqueMovimentos = pgTable("estoque_movimentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  produtoId: uuid("produto_id").notNull().references(() => produtos.id, { onDelete: "restrict" }),
  tipo: tipoMovimentoEstoque("tipo").notNull(),
  motivo: motivoMovimentoEstoque("motivo").notNull(),
  quantidade: integer("quantidade").notNull(),
  observacao: text("observacao"),
  vendaId: uuid("venda_id"),
  funcionarioId: uuid("funcionario_id").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("estoque_movimentos_quantidade_nao_zero", sql`${t.quantidade} <> 0`),
  index("estoque_movimentos_produto_idx").on(t.produtoId),
  index("estoque_movimentos_venda_idx").on(t.vendaId),
]).enableRLS();

export type Produto = typeof produtos.$inferSelect;
