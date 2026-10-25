import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";
import { enderecoFoto } from "../galeria";

type FotoProdutoProps = {
  /** Sem imagem escolhida (ou sem produto), mostra um desenho neutro na mesma área. */
  produto?: { imagem: string | null; fotoId: string | null };
  className?: string;
};

// Foto do produto nos cartões de venda, na lista e no cadastro. Decorativa: o nome do produto já aparece ao lado.
// Imagem da galeria fica inteira sobre o fundo suave; foto enviada preenche a área.
export function FotoProduto({ produto, className }: FotoProdutoProps) {
  const endereco = produto ? enderecoFoto(produto) : null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid aspect-[16/9] w-full place-items-center overflow-hidden bg-linear-135 from-primaria-suave to-acento-suave text-primaria/60",
        className,
      )}
    >
      {endereco ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG da galeria e foto já reduzida: o otimizador do Next não ajuda aqui.
        <img
          src={endereco}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={produto?.fotoId ? "size-full object-cover" : "size-[78%] object-contain drop-shadow-sm"}
        />
      ) : (
        <IceCreamCone className="size-8" />
      )}
    </span>
  );
}
