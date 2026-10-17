CREATE TABLE "auditoria" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tabela" text NOT NULL,
	"registro_id" text NOT NULL,
	"acao" text NOT NULL,
	"dados" jsonb,
	"funcionario_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auditoria" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditoria_registro_idx" ON "auditoria" USING btree ("tabela","registro_id");