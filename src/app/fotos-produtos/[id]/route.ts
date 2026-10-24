import { z } from "zod";
import { getFuncionarioAtual } from "@/features/auth/sessao";
import { buscarFotoProduto } from "@/features/produtos/queries";

// Entrega a foto enviada de um produto. Só para quem está logado.
// Cada troca de foto gera um id novo, então o navegador pode guardar a imagem sem prazo.
export async function GET(_request: Request, ctx: RouteContext<"/fotos-produtos/[id]">) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });
  if (!(await getFuncionarioAtual())) return new Response(null, { status: 401 });

  const foto = await buscarFotoProduto(id);
  if (!foto) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(foto.conteudo), {
    headers: {
      "Content-Type": foto.tipo,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
