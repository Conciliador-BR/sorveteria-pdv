import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type SecaoPainelProps = {
  titulo: string;
  descricao?: string;
  /** Quando verdadeiro, mostra `mensagemVazia` no lugar do conteúdo. */
  vazio?: boolean;
  mensagemVazia?: string;
  children: ReactNode;
};

// Bloco do painel com título e estado vazio amigável.
export function SecaoPainel({ titulo, descricao, vazio = false, mensagemVazia = "Ainda não há vendas este mês.", children }: SecaoPainelProps) {
  const idTitulo = useId();
  return (
    <section aria-labelledby={idTitulo}>
      <Card className="flex h-full flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-0.5">
          <h2 id={idTitulo} className="text-xl font-semibold">
            {titulo}
          </h2>
          {descricao ? <p className="text-sm text-texto-suave">{descricao}</p> : null}
        </div>
        {vazio ? <p className="text-texto-suave">{mensagemVazia}</p> : children}
      </Card>
    </section>
  );
}
