import { bigserial, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { funcionarios } from "./funcionarios";

// Registro de quem mexeu em dinheiro, estoque, preços e acessos.
export const auditoria = pgTable("auditoria", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  tabela: text("tabela").notNull(),
  registroId: text("registro_id").notNull(),
  acao: text("acao").notNull(),
  dados: jsonb("dados"),
  funcionarioId: uuid("funcionario_id").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("auditoria_registro_idx").on(t.tabela, t.registroId)]).enableRLS();
