"use client";

import { startTransition, useEffect, useRef, useState, type FormEvent } from "react";

type EstadoEnvio = { ok?: string; campos?: Record<string, string>; envio?: number };

type Opcoes = {
  /** Foca o primeiro campo depois do sucesso (formulário recriado pela `key` para começar outro registro). */
  focarAposSucesso?: boolean;
};

/**
 * Envia o formulário para a action do useActionState sem o reset automático do React 19,
 * que apaga os campos não controlados mesmo quando a action devolve erro.
 * Depois de um envio com erro de campo, leva o foco ao primeiro campo inválido.
 */
export function useEnvioSemReset(acao: (dados: FormData) => void, estado: EstadoEnvio, { focarAposSucesso = false }: Opcoes = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  // `key` do formulário: muda a cada sucesso (limpa os campos) e não volta atrás num erro seguinte.
  const [chave, setChave] = useState<number | string>("inicial");
  if (estado.ok && estado.envio !== undefined && estado.envio !== chave) setChave(estado.envio);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => acao(dados));
  }

  useEffect(() => {
    const form = formRef.current;
    if (!form || estado.envio === undefined) return;
    if (estado.campos && Object.keys(estado.campos).length > 0) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    } else if (estado.ok && focarAposSucesso) {
      form.querySelector<HTMLElement>("input:not([type=hidden]):not(:disabled), select:not(:disabled), textarea:not(:disabled)")?.focus();
    }
  }, [estado, focarAposSucesso]);

  return { formRef, enviar, chave };
}
