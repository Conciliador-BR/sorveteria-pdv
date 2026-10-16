"use client";

import { useActionState, useEffect, useRef } from "react";
import { entrar, type EstadoLogin } from "../actions";

const estadoInicial: EstadoLogin = {};

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);
  const senhaRef = useRef<HTMLInputElement>(null);

  // Depois de um erro, o foco volta para a senha (o React limpa o formulário).
  useEffect(() => {
    if (estado.tentativa) senhaRef.current?.focus();
  }, [estado.tentativa]);

  return (
    <form action={acao} className="flex w-full max-w-sm flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Usuário</span>
        <input
          name="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={estado.usuario}
          aria-invalid={!!estado.credencial}
          aria-describedby={estado.erro ? "erro-login" : undefined}
          className="h-12 rounded-lg border border-foreground/20 bg-background px-3 text-base"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Senha</span>
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          ref={senhaRef}
          aria-invalid={!!estado.credencial}
          aria-describedby={estado.erro ? "erro-login" : undefined}
          className="h-12 rounded-lg border border-foreground/20 bg-background px-3 text-base"
        />
      </label>
      <p key={estado.tentativa} id="erro-login" role="alert" className="min-h-5 text-sm font-medium">
        {estado.erro}
      </p>
      <button
        type="submit"
        disabled={enviando}
        className="h-12 rounded-xl bg-foreground font-semibold text-background disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
