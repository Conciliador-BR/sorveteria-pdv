import type { ReactNode } from "react";

type PageHeaderProps = {
  titulo: string;
  descricao?: ReactNode;
  /** Botões da página, alinhados à direita no desktop. */
  acoes?: ReactNode;
};

export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-3xl font-bold text-primaria-escura">{titulo}</h1>
        {descricao ? <p className="text-texto-suave">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex flex-wrap gap-3">{acoes}</div> : null}
    </header>
  );
}
