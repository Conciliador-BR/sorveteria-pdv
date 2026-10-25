CREATE TABLE "produto_fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"conteudo" "bytea" NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produto_fotos_tipo" CHECK ("produto_fotos"."tipo" in ('image/webp', 'image/jpeg', 'image/png')),
	CONSTRAINT "produto_fotos_tamanho" CHECK (octet_length("produto_fotos"."conteudo") between 1 and 307200)
);
--> statement-breakpoint
ALTER TABLE "produto_fotos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "imagem" text;--> statement-breakpoint
ALTER TABLE "produtos" ADD COLUMN "foto_id" uuid;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_foto_id_produto_fotos_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."produto_fotos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_imagem_formato" CHECK ("produtos"."imagem" ~ '^[a-z0-9-]{1,60}$');--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_uma_imagem" CHECK ("produtos"."imagem" is null or "produtos"."foto_id" is null);