import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { funcionarios } from "./funcionarios";
import { vendas } from "./vendas";

// Por enquanto só homologação: a emissão é simulada e nenhuma nota tem valor fiscal.
export const ambienteFiscal = pgEnum("ambiente_fiscal", ["homologacao", "producao"]);

// Dados do emitente copiados na hora da emissão: mudar as configurações não altera notas antigas.
export type EmitenteNota = { razaoSocial: string; cnpj: string; inscricaoEstadual: string; endereco: string; uf: string };

// Uma NFC-e (modelo 65) por venda. Sem `protocolo` enquanto a emissão for simulada.
export const notasFiscais = pgTable("notas_fiscais", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendaId: uuid("venda_id").notNull().unique().references(() => vendas.id, { onDelete: "restrict" }),
  ambiente: ambienteFiscal("ambiente").notNull(),
  serie: integer("serie").notNull(),
  numero: integer("numero").notNull(),
  chaveAcesso: text("chave_acesso").notNull().unique(),
  protocolo: text("protocolo"),
  emitente: jsonb("emitente").$type<EmitenteNota>().notNull(),
  emitidaEm: timestamp("emitida_em", { withTimezone: true }).notNull().defaultNow(),
  emitidaPor: uuid("emitida_por").notNull().references(() => funcionarios.id, { onDelete: "restrict" }),
}, (t) => [
  unique("notas_fiscais_serie_numero_unico").on(t.ambiente, t.serie, t.numero),
  check("notas_fiscais_chave_formato", sql`${t.chaveAcesso} ~ '^[0-9]{6}[0-9A-Z]{12}[0-9]{26}$'`),
  check("notas_fiscais_producao_com_protocolo", sql`${t.ambiente} = 'homologacao' or ${t.protocolo} is not null`),
  index("notas_fiscais_emitida_em_idx").on(t.emitidaEm),
]).enableRLS();
