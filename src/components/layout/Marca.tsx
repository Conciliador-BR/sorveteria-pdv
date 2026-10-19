import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";

// Sem `nome`, mostra o nome do sistema (telas públicas). Na área logada, recebe o nome salvo pelo dono.
export function Marca({ nome = "Sorveteria PDV", className }: { nome?: string; className?: string }) {
  return (
    <span translate="no" className={cn("inline-flex items-center gap-2 font-titulo text-xl font-bold text-primaria-escura", className)}>
      <span className="grid size-10 place-items-center rounded-full bg-secundaria-suave text-secundaria" aria-hidden="true">
        <IceCreamCone className="size-6" />
      </span>
      <span className="min-w-0 break-words">{nome}</span>
    </span>
  );
}
