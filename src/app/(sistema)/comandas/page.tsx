import { redirect } from "next/navigation";

// As comandas abertas agora ficam em Vender; o endereço antigo continua valendo para favoritos e atalhos.
export default function ComandasPage() {
  redirect("/vender");
}
