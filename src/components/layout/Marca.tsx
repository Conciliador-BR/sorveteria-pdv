import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";

type MarcaProps = {
  nome?: string;
  /** "escuro" para fundos em azul-noite (menu lateral, rodapé da apresentação). */
  fundo?: "claro" | "escuro";
  className?: string;
};

// Sem `nome`, mostra o nome do sistema (telas públicas). Na área logada, recebe o nome salvo pelo dono.
export function Marca({ nome = "Sorveteria PDV", fundo = "claro", className }: MarcaProps) {
  return (
    <span
      translate="no"
      className={cn(
        "inline-flex items-center gap-2.5 font-titulo text-xl font-extrabold tracking-tight",
        fundo === "claro" ? "text-primaria-escura" : "text-superficie",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-botao bg-linear-135 from-secundaria via-secundaria to-acento text-superficie shadow-brilho-secundaria"
      >
        <IceCreamCone className="size-6" />
      </span>
      <span className="min-w-0 break-words">{nome}</span>
    </span>
  );
}
