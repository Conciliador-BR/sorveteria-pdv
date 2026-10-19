import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sair } from "../actions";

export function BotaoSair() {
  return (
    <form action={sair}>
      <Button type="submit" variante="secundario">
        <LogOut aria-hidden="true" className="size-5" />
        Sair
      </Button>
    </form>
  );
}
