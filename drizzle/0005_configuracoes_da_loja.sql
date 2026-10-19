CREATE TABLE "configuracoes" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"nome_loja" text,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "configuracoes_linha_unica" CHECK ("configuracoes"."id" = 1),
	CONSTRAINT "configuracoes_nome_loja_tamanho" CHECK (char_length("configuracoes"."nome_loja") between 1 and 60)
);
--> statement-breakpoint
ALTER TABLE "configuracoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "bandeiras_nome_tipo_sem_caixa_unico" ON "bandeiras" USING btree (lower("nome"),"tipo");--> statement-breakpoint
-- Linha única das configurações; nome vazio mostra "Sorveteria PDV" até o dono definir.
INSERT INTO "configuracoes" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;
