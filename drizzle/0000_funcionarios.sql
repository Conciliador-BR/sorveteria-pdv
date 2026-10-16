CREATE TYPE "public"."papel_funcionario" AS ENUM('funcionario', 'dono');--> statement-breakpoint
CREATE TABLE "funcionarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"usuario" text NOT NULL,
	"papel" "papel_funcionario" DEFAULT 'funcionario' NOT NULL,
	"pode_lancar_estoque" boolean DEFAULT false NOT NULL,
	"pode_gerenciar_produtos" boolean DEFAULT false NOT NULL,
	"pode_cancelar_venda" boolean DEFAULT false NOT NULL,
	"pode_ver_historico" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "funcionarios_usuario_unique" UNIQUE("usuario")
);
--> statement-breakpoint
ALTER TABLE "funcionarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;