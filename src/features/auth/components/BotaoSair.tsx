import { sair } from "../actions";

export function BotaoSair() {
  return (
    <form action={sair}>
      <button type="submit" className="h-12 rounded-xl border border-foreground/20 px-4 font-medium">
        Sair
      </button>
    </form>
  );
}
