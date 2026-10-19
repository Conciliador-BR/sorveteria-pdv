import { CabecalhoApresentacao } from "@/features/apresentacao/components/CabecalhoApresentacao";
import { Heroi } from "@/features/apresentacao/components/Heroi";
import { PainelDonoDestaque } from "@/features/apresentacao/components/PainelDonoDestaque";
import { ChamadaFinal, Perguntas, Rodape } from "@/features/apresentacao/components/Perguntas";
import { AntesDepois, ComoFunciona, Recursos } from "@/features/apresentacao/components/Recursos";

// Apresentação pública: promessa e chamada para entrar logo na primeira tela; o resto convence quem rola.
export default function Home() {
  return (
    <>
      <CabecalhoApresentacao />
      <main className="flex flex-1 flex-col">
        <Heroi />
        <AntesDepois />
        <Recursos />
        <ComoFunciona />
        <PainelDonoDestaque />
        <Perguntas />
        <ChamadaFinal />
      </main>
      <Rodape />
    </>
  );
}
