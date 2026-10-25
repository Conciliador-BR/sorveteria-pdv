CREATE TYPE "public"."anexo_simples" AS ENUM('I', 'II');--> statement-breakpoint
CREATE TYPE "public"."regime_imposto" AS ENUM('percentual', 'simples', 'mei');--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD COLUMN "regime_imposto" "regime_imposto" DEFAULT 'percentual' NOT NULL;--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD COLUMN "anexo_simples" "anexo_simples" DEFAULT 'I' NOT NULL;--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD COLUMN "receita_12_meses_centavos" integer;--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD COLUMN "das_mensal_centavos" integer;--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD CONSTRAINT "precificacao_parametros_receita_12_meses_positiva" CHECK ("precificacao_parametros"."receita_12_meses_centavos" > 0);--> statement-breakpoint
ALTER TABLE "precificacao_parametros" ADD CONSTRAINT "precificacao_parametros_das_positivo" CHECK ("precificacao_parametros"."das_mensal_centavos" >= 0);