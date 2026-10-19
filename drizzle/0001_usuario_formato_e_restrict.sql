ALTER TABLE "funcionarios" DROP CONSTRAINT "funcionarios_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_usuario_formato" CHECK ("funcionarios"."usuario" ~ '^[a-z0-9._-]{3,32}$');