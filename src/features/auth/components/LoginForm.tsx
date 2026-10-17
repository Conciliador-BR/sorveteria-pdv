"use client";

import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { entrar, type EstadoLogin } from "../actions";

const estadoInicial: EstadoLogin = {};

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);
  const senhaRef = useRef<HTMLInputElement>(null);

  // Depois de um erro, o foco volta para a senha (o React limpa o formulário).
  useEffect(() => {
    if (estado.tentativa) senhaRef.current?.focus();
  }, [estado.tentativa]);

  const descritoPor = estado.erro ? "erro-login" : undefined;

  return (
    <form action={acao} className="flex w-full flex-col gap-5" noValidate>
      <Campo
        rotulo="Usuário"
        name="usuario"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={estado.usuario}
        aria-invalid={!!estado.credencial}
        aria-describedby={descritoPor}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        required
        ref={senhaRef}
        aria-invalid={!!estado.credencial}
        aria-describedby={descritoPor}
      />
      {/* A key muda a cada tentativa para o mesmo erro ser anunciado de novo. */}
      {estado.erro ? (
        <Aviso key={estado.tentativa} id="erro-login" tipo="erro">
          {estado.erro}
        </Aviso>
      ) : null}
      <Button type="submit" tamanho="lg" className="w-full" carregando={enviando} textoCarregando="Entrando…">
        Entrar
      </Button>
    </form>
  );
}
