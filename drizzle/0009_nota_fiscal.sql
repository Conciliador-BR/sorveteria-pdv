CREATE TYPE "public"."ambiente_fiscal" AS ENUM('homologacao', 'producao');--> statement-breakpoint
CREATE TABLE "notas_fiscais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venda_id" uuid NOT NULL,
	"ambiente" "ambiente_fiscal" NOT NULL,
	"serie" integer NOT NULL,
	"numero" integer NOT NULL,
	"chave_acesso" text NOT NULL,
	"protocolo" text,
	"emitente" jsonb NOT NULL,
	"emitida_em" timestamp with time zone DEFAULT now() NOT NULL,
	"emitida_por" uuid NOT NULL,
	CONSTRAINT "notas_fiscais_venda_id_unique" UNIQUE("venda_id"),
	CONSTRAINT "notas_fiscais_chave_acesso_unique" UNIQUE("chave_acesso"),
	CONSTRAINT "notas_fiscais_serie_numero_unico" UNIQUE("ambiente","serie","numero"),
	CONSTRAINT "notas_fiscais_chave_formato" CHECK ("notas_fiscais"."chave_acesso" ~ '^[0-9]{6}[0-9A-Z]{12}[0-9]{26}$'),
	CONSTRAINT "notas_fiscais_producao_com_protocolo" CHECK ("notas_fiscais"."ambiente" = 'homologacao' or "notas_fiscais"."protocolo" is not null)
);
--> statement-breakpoint
ALTER TABLE "notas_fiscais" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "emitir_nfce" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "razao_social" text;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "cnpj" text;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "inscricao_estadual" text;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "endereco" text;--> statement-breakpoint
ALTER TABLE "configuracoes" ADD COLUMN "uf" text;--> statement-breakpoint
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_emitida_por_funcionarios_id_fk" FOREIGN KEY ("emitida_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notas_fiscais_emitida_em_idx" ON "notas_fiscais" USING btree ("emitida_em");--> statement-breakpoint
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_cnpj_formato" CHECK ("configuracoes"."cnpj" ~ '^[0-9A-Z]{12}[0-9]{2}$');--> statement-breakpoint
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_uf_formato" CHECK ("configuracoes"."uf" ~ '^[A-Z]{2}$');--> statement-breakpoint
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_nfce_com_emitente" CHECK (not "configuracoes"."emitir_nfce" or ("configuracoes"."razao_social" is not null and "configuracoes"."cnpj" is not null and "configuracoes"."inscricao_estadual" is not null and "configuracoes"."endereco" is not null and "configuracoes"."uf" is not null));