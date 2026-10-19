"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { CaixaSelecao } from "@/components/ui/CaixaSelecao";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { editarFuncionario, redefinirSenha } from "../actions";
import type { FuncionarioLista } from "../queries";
import { CamposPermissoes } from "./CamposPermissoes";

export function EditarFuncionarioForm({ funcionario, ehVoce }: { funcionario: FuncionarioLista; ehVoce: boolean }) {
  const [estado, acao, enviando] = useActionState(editarFuncionario, {} as EstadoFormulario);
  const [estadoSenha, acaoSenha, trocando] = useActionState(redefinirSenha, {} as EstadoFormulario);

  return (
    <div className="flex flex-col gap-6">
      <form action={acao} className="flex flex-col gap-4" noValidate>
        <RetornoFormulario estado={estado} />
        <input type="hidden" name="id" value={funcionario.id} />
        <Campo name="nome" rotulo="Nome" defaultValue={funcionario.nome} required erro={estado.campos?.nome} />
        <Selecao name="papel" rotulo="Papel" defaultValue={funcionario.papel} disabled={ehVoce}>
          <option value="funcionario">Funcionário</option>
          <option value="dono">Dono (acesso total)</option>
        </Selecao>
        {/* Campo desabilitado não é enviado: repete o valor para o dono não perder o próprio papel. */}
        {ehVoce ? <input type="hidden" name="papel" value={funcionario.papel} /> : null}
        <CamposPermissoes valores={funcionario} />
        {ehVoce ? (
          <input type="hidden" name="ativo" value="on" />
        ) : (
          <CaixaSelecao name="ativo" rotulo="Ativo" dica="Desmarque para impedir o login. O histórico fica guardado." defaultChecked={funcionario.ativo} />
        )}
        <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
          Salvar alterações
        </Button>
      </form>

      <form key={estadoSenha.ok ? estadoSenha.envio : "senha"} action={acaoSenha} className="flex flex-col gap-4 border-t border-borda pt-4" noValidate>
        <RetornoFormulario estado={estadoSenha} />
        <input type="hidden" name="id" value={funcionario.id} />
        <Campo name="senha" type="password" rotulo="Nova senha" autoComplete="new-password" required erro={estadoSenha.campos?.senha} />
        <Button type="submit" variante="secundario" carregando={trocando} textoCarregando="Trocando…">
          Trocar senha
        </Button>
      </form>
    </div>
  );
}
