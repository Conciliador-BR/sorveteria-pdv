CREATE TABLE "comanda_lancamentos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"venda_id" uuid NOT NULL,
	"lancado_por" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comanda_lancamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comanda_lancamentos" ADD CONSTRAINT "comanda_lancamentos_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comanda_lancamentos" ADD CONSTRAINT "comanda_lancamentos_lancado_por_funcionarios_id_fk" FOREIGN KEY ("lancado_por") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comanda_lancamentos_venda_idx" ON "comanda_lancamentos" USING btree ("venda_id");