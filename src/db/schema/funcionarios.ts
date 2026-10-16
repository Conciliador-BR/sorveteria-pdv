import { sql } from "drizzle-orm";
import { boolean, check, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const papelFuncionario = pgEnum("papel_funcionario", ["funcionario", "dono"]);

// Perfil de cada login do Supabase Auth. RLS sem políticas: só o servidor (Drizzle) acessa.
// Apagar o login no Auth é bloqueado (restrict): funcionário com histórico é desativado, não apagado.
// `usuario` segue a mesma regra do login (minúsculas), então o unique já ignora maiúsculas.
export const funcionarios = pgTable("funcionarios", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "restrict" }),
  nome: text("nome").notNull(),
  usuario: text("usuario").notNull().unique(),
  papel: papelFuncionario("papel").notNull().default("funcionario"),
  podeLancarEstoque: boolean("pode_lancar_estoque").notNull().default(false),
  podeGerenciarProdutos: boolean("pode_gerenciar_produtos").notNull().default(false),
  podeCancelarVenda: boolean("pode_cancelar_venda").notNull().default(false),
  podeVerHistorico: boolean("pode_ver_historico").notNull().default(false),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("funcionarios_usuario_formato", sql`${t.usuario} ~ '^[a-z0-9._-]{3,32}$'`),
]).enableRLS();

export type Funcionario = typeof funcionarios.$inferSelect;
