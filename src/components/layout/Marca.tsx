import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";

// Nome provisório: o nome da loja ainda será definido pelo dono.
export function Marca({ className }: { className?: string }) {
  return (
    <span translate="no" className={cn("inline-flex items-center gap-2 font-titulo text-xl font-bold text-primaria-escura", className)}>
      <span className="grid size-10 place-items-center rounded-full bg-secundaria-suave text-secundaria" aria-hidden="true">
        <IceCreamCone className="size-6" />
      </span>
      Sorveteria PDV
    </span>
  );
}
