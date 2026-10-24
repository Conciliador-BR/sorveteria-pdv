"use client";

import { useActionState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { CaixaSelecao } from "@/components/ui/CaixaSelecao";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import { formatarCnpj, UFS } from "@/features/fiscal/regras";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarDadosFiscais } from "../actions";
import type { DadosFiscais } from "../queries";

export function DadosFiscaisForm({ dados }: { dados: DadosFiscais }) {
  const [estado, acao, enviando] = useActionState(salvarDadosFiscais, {} as EstadoFormulario);
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado);

  return (
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Aviso tipo="info" role="note">
        Modo de teste: as notas saem com &quot;sem valor fiscal&quot; até o emissor oficial ser contratado. Desligado, a venda imprime um recibo simples.
      </Aviso>
      <CaixaSelecao
        name="emitirNfce"
        rotulo="Emitir NFC-e nas vendas"
        dica="Ao concluir a venda, emite a nota e imprime o DANFE NFC-e."
        defaultChecked={dados.emitirNfce}
      />
      <Campo name="razaoSocial" rotulo="Razão social" defaultValue={dados.razaoSocial ?? ""} maxLength={120} autoComplete="organization" erro={estado.campos?.razaoSocial} />
      <Campo
        name="cnpj"
        rotulo="CNPJ"
        defaultValue={dados.cnpj ? formatarCnpj(dados.cnpj) : ""}
        maxLength={18}
        autoCapitalize="characters"
        spellCheck={false}
        dica="Aceita o CNPJ com letras (novo formato)."
        erro={estado.campos?.cnpj}
      />
      <Campo name="inscricaoEstadual" rotulo="Inscrição estadual" defaultValue={dados.inscricaoEstadual ?? ""} maxLength={20} inputMode="numeric" erro={estado.campos?.inscricaoEstadual} />
      <Campo
        name="endereco"
        rotulo="Endereço"
        defaultValue={dados.endereco ?? ""}
        maxLength={160}
        autoComplete="street-address"
        dica="Rua, número, bairro e cidade, como sai no cupom."
        erro={estado.campos?.endereco}
      />
      <Selecao name="uf" rotulo="UF" defaultValue={dados.uf ?? "ES"} erro={estado.campos?.uf}>
        {UFS.map((uf) => (
          <option key={uf} value={uf}>
            {uf}
          </option>
        ))}
      </Selecao>
      <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
        Salvar nota fiscal
      </Button>
    </form>
  );
}
