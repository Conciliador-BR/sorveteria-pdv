CREATE TYPE "public"."motivo_movimento_estoque" AS ENUM('compra', 'perda', 'consumo_interno', 'ajuste_contagem', 'venda', 'cancelamento', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimento_estoque" AS ENUM('entrada', 'saida', 'ajuste', 'venda', 'cancelamento');--> statement-breakpoint
CREATE TYPE "public"."tipo_venda" AS ENUM('unidade', 'peso');--> statement-breakpoint
CREATE TYPE "public"."status_caixa" AS ENUM('aberto', 'fechado');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimento_caixa" AS ENUM('sangria', 'suprimento');--> statement-breakpoint
CREATE TYPE "public"."forma_pagamento" AS ENUM('dinheiro', 'pix', 'debito', 'credito');--> statement-breakpoint
CREATE TYPE "public"."status_venda" AS ENUM('aberta', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."tipo_bandeira" AS ENUM('debito', 'credito');--> statement-breakpoint
CREATE TYPE "public"."tipo_venda_origem" AS ENUM('balcao', 'comanda');--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "categorias_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "estoque_movimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"tipo" "tipo_movimento_estoque" NOT NULL,
	"motivo" "motivo_movimento_estoque" NOT NULL,
	"quantidade" integer NOT NULL,
	"observacao" text,
	"venda_id" uuid,
	"funcionario_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "estoque_movimentos_quantidade_nao_zero" CHECK ("estoque_movimentos"."quantidade" <> 0)
);
--> statement-breakpoint
ALTER TABLE "estoque_movimentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"categoria_id" uuid,
	"tipo_venda" "tipo_venda" DEFAULT 'unidade' NOT NULL,
	"preco_centavos" integer NOT NULL,
	"codigo" text,
	"estoque_minimo" integer DEFAULT 0 NOT NULL,
	"baixa_automatica" boolean DEFAULT true NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produtos_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "produtos_preco_positivo" CHECK ("produtos"."preco_centavos" >= 0),
	CONSTRAINT "produtos_estoque_minimo_positivo" CHECK ("produtos"."estoque_minimo" >= 0)
);
--> statement-breakpoint
ALTER TABLE "produtos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "caixa_movimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caixa_id" uuid NOT NULL,
	"tipo" "tipo_movimento_caixa" NOT NULL,
	"valor_centavos" integer NOT NULL,
	"motivo" text NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caixa_movimentos_valor_positivo" CHECK ("caixa_movimentos"."valor_centavos" > 0)
);
--> statement-breakpoint
ALTER TABLE "caixa_movimentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "caixas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"status" "status_caixa" DEFAULT 'aberto' NOT NULL,
	"aberto_em" timestamp with time zone DEFAULT now() NOT NULL,
	"fundo_centavos" integer NOT NULL,
	"sem_fundo" boolean DEFAULT false NOT NULL,
	"fechado_em" timestamp with time zone,
	"esperado_centavos" integer,
	"contado_centavos" integer,
	"diferenca_centavos" integer,
	"observacao" text,
	"reaberto_por" uuid,
	"reaberto_em" timestamp with time zone,
	CONSTRAINT "caixas_fundo_positivo" CHECK ("caixas"."fundo_centavos" >= 0),
	CONSTRAINT "caixas_sem_fundo_coerente" CHECK ("caixas"."sem_fundo" = ("caixas"."fundo_centavos" = 0))
);
--> statement-breakpoint
ALTER TABLE "caixas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bandeiras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_bandeira" NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "bandeiras_nome_tipo_unico" UNIQUE("nome","tipo")
);
--> statement-breakpoint
ALTER TABLE "bandeiras" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venda_id" uuid NOT NULL,
	"forma" "forma_pagamento" NOT NULL,
	"bandeira_id" uuid,
	"valor_centavos" integer NOT NULL,
	"valor_recebido_centavos" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pagamentos_valor_positivo" CHECK ("pagamentos"."valor_centavos" > 0),
	CONSTRAINT "pagamentos_bandeira_so_cartao" CHECK (("pagamentos"."forma" in ('debito', 'credito')) = ("pagamentos"."bandeira_id" is not null)),
	CONSTRAINT "pagamentos_recebido_so_dinheiro" CHECK ("pagamentos"."forma" = 'dinheiro' or "pagamentos"."valor_recebido_centavos" is null)
);
--> statement-breakpoint
ALTER TABLE "pagamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "venda_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venda_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"nome_produto" text NOT NULL,
	"tipo_venda" "tipo_venda" NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"peso_gramas" integer,
	"preco_unitario_centavos" integer NOT NULL,
	"total_centavos" integer NOT NULL,
	"lancado_por" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "venda_itens_quantidade_positiva" CHECK ("venda_itens"."quantidade" > 0),
	CONSTRAINT "venda_itens_peso_coerente" CHECK (("venda_itens"."tipo_venda" = 'peso') = ("venda_itens"."peso_gramas" is not null and "venda_itens"."peso_gramas" > 0)),
	CONSTRAINT "venda_itens_valores_positivos" CHECK ("venda_itens"."preco_unitario_centavos" >= 0 and "venda_itens"."total_centavos" >= 0)
);
--> statement-breakpoint
ALTER TABLE "venda_itens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vendas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "vendas_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"caixa_id" uuid NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"tipo" "tipo_venda_origem" NOT NULL,
	"identificacao" text,
	"status" "status_venda" NOT NULL,
	"total_centavos" integer DEFAULT 0 NOT NULL,
	"troco_centavos" integer DEFAULT 0 NOT NULL,
	"aberta_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluida_em" timestamp with time zone,
	"concluida_por" uuid,
	"cancelada_em" timestamp with time zone,
	"cancelada_por" uuid,
	"motivo_cancelamento" text,
	CONSTRAINT "vendas_numero_unique" UNIQUE("numero"),
	CONSTRAINT "vendas_valores_positivos" CHECK ("vendas"."total_centavos" >= 0 and "vendas"."troco_centavos" >= 0),
	CONSTRAINT "vendas_comanda_identificada" CHECK ("vendas"."tipo" = 'balcao' or "vendas"."identificacao" is not null)
);
--> statement-breakpoint
ALTER TABLE "vendas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estoque_movimentos" ADD CONSTRAINT "estoque_movimentos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimentos" ADD CONSTRAINT "estoque_movimentos_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa_movimentos" ADD CONSTRAINT "caixa_movimentos_caixa_id_caixas_id_fk" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa_movimentos" ADD CONSTRAINT "caixa_movimentos_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixas" ADD CONSTRAINT "caixas_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixas" ADD CONSTRAINT "caixas_reaberto_por_funcionarios_id_fk" FOREIGN KEY ("reaberto_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_bandeira_id_bandeiras_id_fk" FOREIGN KEY ("bandeira_id") REFERENCES "public"."bandeiras"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_lancado_por_funcionarios_id_fk" FOREIGN KEY ("lancado_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_caixa_id_caixas_id_fk" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_concluida_por_funcionarios_id_fk" FOREIGN KEY ("concluida_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cancelada_por_funcionarios_id_fk" FOREIGN KEY ("cancelada_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "estoque_movimentos_produto_idx" ON "estoque_movimentos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX "estoque_movimentos_venda_idx" ON "estoque_movimentos" USING btree ("venda_id");--> statement-breakpoint
CREATE INDEX "produtos_categoria_idx" ON "produtos" USING btree ("categoria_id");--> statement-breakpoint
CREATE INDEX "caixa_movimentos_caixa_idx" ON "caixa_movimentos" USING btree ("caixa_id");--> statement-breakpoint
CREATE UNIQUE INDEX "caixas_um_aberto_por_funcionario" ON "caixas" USING btree ("funcionario_id") WHERE "caixas"."status" = 'aberto';--> statement-breakpoint
CREATE INDEX "caixas_aberto_em_idx" ON "caixas" USING btree ("aberto_em");--> statement-breakpoint
CREATE INDEX "pagamentos_venda_idx" ON "pagamentos" USING btree ("venda_id");--> statement-breakpoint
CREATE INDEX "venda_itens_venda_idx" ON "venda_itens" USING btree ("venda_id");--> statement-breakpoint
CREATE INDEX "venda_itens_produto_idx" ON "venda_itens" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX "vendas_caixa_idx" ON "vendas" USING btree ("caixa_id");--> statement-breakpoint
CREATE INDEX "vendas_status_idx" ON "vendas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendas_concluida_em_idx" ON "vendas" USING btree ("concluida_em");