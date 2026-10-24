import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";

type FotoProdutoProps = { className?: string };

// Espaço da foto do produto nos cartões de venda. Enquanto o produto não tiver foto, mostra um desenho neutro.
// A foto (padrão ou enviada no cadastro) entra aqui, ocupando a mesma área.
export function FotoProduto({ className }: FotoProdutoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid aspect-[16/9] w-full place-items-center bg-linear-135 from-primaria-suave to-acento-suave text-primaria/60", className)}
    >
      <IceCreamCone className="size-8" />
    </span>
  );
}
