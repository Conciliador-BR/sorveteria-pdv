CREATE TYPE "public"."unidade_insumo" AS ENUM('g', 'ml', 'un');--> statement-breakpoint
CREATE TABLE "custos_fixos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"valor_mensal_centavos" integer NOT NULL,
	CONSTRAINT "custos_fixos_valor_positivo" CHECK ("custos_fixos"."valor_mensal_centavos" >= 0)
);
--> statement-breakpoint
ALTER TABLE "custos_fixos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ficha_tecnica_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"insumo_id" uuid NOT NULL,
	"quantidade" integer NOT NULL,
	CONSTRAINT "ficha_tecnica_itens_quantidade_positiva" CHECK ("ficha_tecnica_itens"."quantidade" > 0)
);
--> statement-breakpoint
ALTER TABLE "ficha_tecnica_itens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"unidade" "unidade_insumo" NOT NULL,
	"embalagem_quantidade" integer NOT NULL,
	"embalagem_preco_centavos" integer NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insumos_embalagem_quantidade_positiva" CHECK ("insumos"."embalagem_quantidade" > 0),
	CONSTRAINT "insumos_embalagem_preco_positivo" CHECK ("insumos"."embalagem_preco_centavos" >= 0)
);
--> statement-breakpoint
ALTER TABLE "insumos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "maquinas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"valor_compra_centavos" integer NOT NULL,
	"valor_residual_centavos" integer DEFAULT 0 NOT NULL,
	"vida_util_meses" integer NOT NULL,
	CONSTRAINT "maquinas_valores_validos" CHECK ("maquinas"."valor_residual_centavos" >= 0 and "maquinas"."valor_residual_centavos" <= "maquinas"."valor_compra_centavos"),
	CONSTRAINT "maquinas_vida_util_positiva" CHECK ("maquinas"."vida_util_meses" > 0)
);
--> statement-breakpoint
ALTER TABLE "maquinas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "precificacao_parametros" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"faturamento_mensal_centavos" integer,
	"imposto_percentual" integer DEFAULT 0 NOT NULL,
	"taxa_cartao_percentual" integer DEFAULT 0 NOT NULL,
	"parte_cartao_percentual" integer DEFAULT 0 NOT NULL,
	"perdas_percentual" integer DEFAULT 0 NOT NULL,
	"margem_padrao_percentual" integer DEFAULT 3000 NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "precificacao_parametros_linha_unica" CHECK ("precificacao_parametros"."id" = 1),
	CONSTRAINT "precificacao_parametros_faturamento_positivo" CHECK ("precificacao_parametros"."faturamento_mensal_centavos" > 0),
	CONSTRAINT "precificacao_parametros_percentuais_faixa" CHECK ("precificacao_parametros"."imposto_percentual" between 0 and 9900 and "precificacao_parametros"."taxa_cartao_percentual" between 0 and 9900 and "precificacao_parametros"."parte_cartao_percentual" between 0 and 10000 and "precificacao_parametros"."perdas_percentual" between 0 and 9900 and "precificacao_parametros"."margem_padrao_percentual" between 0 and 9900)
);
--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "precificacao_produtos" (
	"produto_id" uuid PRIMARY KEY NOT NULL,
	"rendimento" integer NOT NULL,
	"margem_percentual" integer,
	CONSTRAINT "precificacao_produtos_rendimento_positivo" CHECK ("precificacao_produtos"."rendimento" > 0),
	CONSTRAINT "precificacao_produtos_margem_faixa" CHECK ("precificacao_produtos"."margem_percentual" between 0 and 9900)
);
--> statement-breakpoint
ALTER TABLE "precificacao_produtos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ficha_tecnica_itens" ADD CONSTRAINT "ficha_tecnica_itens_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_tecnica_itens" ADD CONSTRAINT "ficha_tecnica_itens_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precificacao_produtos" ADD CONSTRAINT "precificacao_produtos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ficha_tecnica_itens_produto_insumo_unico" ON "ficha_tecnica_itens" USING btree ("produto_id","insumo_id");--> statement-breakpoint
CREATE INDEX "ficha_tecnica_itens_insumo_idx" ON "ficha_tecnica_itens" USING btree ("insumo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "insumos_nome_sem_caixa_unico" ON "insumos" USING btree (lower("nome"));--> statement-breakpoint
-- Linha única dos parâmetros da precificação; começa com margem padrão de 30% e o resto zerado.
INSERT INTO "precificacao_parametros" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;
