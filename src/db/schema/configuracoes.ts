import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Configurações da loja numa linha só: `id` fixo em 1 (CHECK) impede uma segunda linha.
// `nome_loja` vazio (null) mostra o nome padrão do sistema.
export const configuracoes = pgTable("configuracoes", {
  id: integer("id").primaryKey().default(1),
  nomeLoja: text("nome_loja"),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("configuracoes_linha_unica", sql`${t.id} = 1`),
  check("configuracoes_nome_loja_tamanho", sql`char_length(${t.nomeLoja}) between 1 and 60`),
]).enableRLS();
