"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { formatarPeso, formatarReais } from "@/lib/dinheiro";
import { totalDaLinha, type LinhaCarrinho } from "../regras";

type LinhaDoCarrinhoProps = {
  linha: LinhaCarrinho;
  aoAlterarQuantidade: (quantidade: number) => void;
  aoDefinirPeso: (pesoGramas: number | null) => void;
  aoRemover: () => void;
};

export function LinhaDoCarrinho({ linha, aoAlterarQuantidade, aoDefinirPeso, aoRemover }: LinhaDoCarrinhoProps) {
  const { produto } = linha;
  const porPeso = produto.tipoVenda === "peso";

  return (
    <li className="flex flex-col gap-2 border-b border-borda py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{produto.nome}</p>
          <p className="text-sm text-texto-suave tabular-nums">
            {formatarReais(produto.precoCentavos)}
            {porPeso ? " o kg" : " cada"}
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums">{formatarReais(totalDaLinha(linha))}</p>
      </div>

      <div className="flex items-end gap-2">
        {porPeso ? (
          <div className="flex-1">
            <Campo
              rotulo={`Peso de ${produto.nome} (gramas)`}
              inputMode="numeric"
              autoComplete="off"
              // Linha nova de peso já recebe o foco para digitar o que a balança mostrou.
              autoFocus={linha.pesoGramas === null}
              value={linha.pesoGramas ?? ""}
              onChange={(evento) => {
                const digitos = evento.target.value.replace(/\D/g, "").slice(0, 6);
                aoDefinirPeso(digitos ? Number(digitos) : null);
              }}
              placeholder="Ex.: 350"
              dica={linha.pesoGramas === null ? "Digite o peso que a balança mostrou." : formatarPeso(linha.pesoGramas)}
              className="text-right text-xl tabular-nums"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2" role="group" aria-label={`Quantidade de ${produto.nome}`}>
            <Button variante="secundario" className="w-12 px-0" aria-label={`Diminuir ${produto.nome}`} onClick={() => aoAlterarQuantidade(linha.quantidade - 1)}>
              <Minus aria-hidden="true" className="size-5" />
            </Button>
            <output aria-live="polite" className="min-w-10 text-center text-xl font-bold tabular-nums">
              {linha.quantidade}
            </output>
            <Button variante="secundario" className="w-12 px-0" aria-label={`Aumentar ${produto.nome}`} onClick={() => aoAlterarQuantidade(linha.quantidade + 1)}>
              <Plus aria-hidden="true" className="size-5" />
            </Button>
          </div>
        )}
        <Button variante="fantasma" className="w-12 px-0 text-perigo" aria-label={`Tirar ${produto.nome} do carrinho`} onClick={aoRemover}>
          <Trash2 aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </li>
  );
}
