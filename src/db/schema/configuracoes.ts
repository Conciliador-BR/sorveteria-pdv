import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Configurações da loja numa linha só: `id` fixo em 1 (CHECK) impede uma segunda linha.
// `nome_loja` vazio (null) mostra o nome padrão do sistema.
// Dados fiscais (emitente da NFC-e): só ficam obrigatórios quando `emitir_nfce` está ligado.
export const configuracoes = pgTable("configuracoes", {
  id: integer("id").primaryKey().default(1),
  nomeLoja: text("nome_loja"),
  emitirNfce: boolean("emitir_nfce").notNull().default(false),
  razaoSocial: text("razao_social"),
  cnpj: text("cnpj"),
  inscricaoEstadual: text("inscricao_estadual"),
  endereco: text("endereco"),
  uf: text("uf"),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("configuracoes_linha_unica", sql`${t.id} = 1`),
  check("configuracoes_nome_loja_tamanho", sql`char_length(${t.nomeLoja}) between 1 and 60`),
  check("configuracoes_cnpj_formato", sql`${t.cnpj} ~ '^[0-9A-Z]{12}[0-9]{2}$'`),
  check("configuracoes_uf_formato", sql`${t.uf} ~ '^[A-Z]{2}$'`),
  check(
    "configuracoes_nfce_com_emitente",
    sql`not ${t.emitirNfce} or (${t.razaoSocial} is not null and ${t.cnpj} is not null and ${t.inscricaoEstadual} is not null and ${t.endereco} is not null and ${t.uf} is not null)`,
  ),
]).enableRLS();
