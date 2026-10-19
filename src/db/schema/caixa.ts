import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { funcionarios } from "./funcionarios";

export const statusCaixa = pgEnum("status_caixa", ["aberto", "fechado"]);

// Um caixa por funcionário: no máximo um `aberto` por pessoa (índice único parcial).
export const caixas = pgTable("caixas", {
  id: uuid("id").primaryKey().defaultRandom(),
  funcionarioId: uuid("funcionario_id").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  status: statusCaixa("status").notNull().default("aberto"),
  abertoEm: timestamp("aberto_em", { withTimezone: true }).notNull().defaultNow(),
  fundoCentavos: integer("fundo_centavos").notNull(),
  semFundo: boolean("sem_fundo").notNull().default(false),
  fechadoEm: timestamp("fechado_em", { withTimezone: true }),
  esperadoCentavos: integer("esperado_centavos"),
  contadoCentavos: integer("contado_centavos"),
  diferencaCentavos: integer("diferenca_centavos"),
  observacao: text("observacao"),
  reabertoPor: uuid("reaberto_por").references(() => funcionarios.id, { onDelete: "restrict" }),
  reabertoEm: timestamp("reaberto_em", { withTimezone: true }),
}, (t) => [
  check("caixas_fundo_positivo", sql`${t.fundoCentavos} >= 0`),
  check("caixas_sem_fundo_coerente", sql`${t.semFundo} = (${t.fundoCentavos} = 0)`),
  uniqueIndex("caixas_um_aberto_por_funcionario").on(t.funcionarioId).where(sql`${t.status} = 'aberto'`),
  index("caixas_aberto_em_idx").on(t.abertoEm),
]).enableRLS();

export const tipoMovimentoCaixa = pgEnum("tipo_movimento_caixa", ["sangria", "suprimento"]);

export const caixaMovimentos = pgTable("caixa_movimentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  caixaId: uuid("caixa_id").notNull().references(() => caixas.id, { onDelete: "restrict" }),
  tipo: tipoMovimentoCaixa("tipo").notNull(),
  valorCentavos: integer("valor_centavos").notNull(),
  motivo: text("motivo").notNull(),
  funcionarioId: uuid("funcionario_id").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("caixa_movimentos_valor_positivo", sql`${t.valorCentavos} > 0`),
  index("caixa_movimentos_caixa_idx").on(t.caixaId),
]).enableRLS();

export type Caixa = typeof caixas.$inferSelect;
