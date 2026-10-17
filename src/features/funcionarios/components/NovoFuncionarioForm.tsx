"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { criarFuncionario } from "../actions";
import { CamposPermissoes } from "./CamposPermissoes";

export function NovoFuncionarioForm() {
  const [estado, acao, enviando] = useActionState(criarFuncionario, {} as EstadoFormulario);
  const erro = estado.campos ?? {};

  return (
    // A key limpa o formulário depois de um cadastro com sucesso.
    <form key={estado.ok ? estado.envio : "novo"} action={acao} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo name="nome" rotulo="Nome" autoComplete="off" required erro={erro.nome} />
      <Campo
        name="usuario"
        rotulo="Usuário para entrar"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        required
        dica="3 a 32 letras minúsculas, números, ponto, hífen ou sublinhado. Ex.: joana"
        erro={erro.usuario}
      />
      <Campo name="senha" type="password" rotulo="Senha inicial" autoComplete="new-password" required dica="Pelo menos 6 caracteres." erro={erro.senha} />
      <Selecao name="papel" rotulo="Papel" defaultValue="funcionario" erro={erro.papel}>
        <option value="funcionario">Funcionário</option>
        <option value="dono">Dono (acesso total)</option>
      </Selecao>
      <CamposPermissoes />
      <Button type="submit" carregando={enviando} textoCarregando="Criando…">
        Criar funcionário
      </Button>
    </form>
  );
}
