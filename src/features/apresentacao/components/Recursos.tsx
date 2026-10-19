import {
  Check,
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

type Recurso = { titulo: string; texto: string; Icone: LucideIcon; tom: string };

const recursos: Recurso[] = [
  {
    titulo: "Venda no balcão",
    texto: "Busca por nome ou código, produto por unidade ou no peso e total sempre grande na tela.",
    Icone: ShoppingCart,
    tom: "bg-primaria-suave text-primaria-escura",
  },
  {
    titulo: "Comandas",
    texto: "A família pede aos poucos, qualquer funcionário lança e tudo é cobrado de uma vez no final.",
    Icone: ClipboardList,
    tom: "bg-secundaria-suave text-secundaria-escura",
  },
  {
    titulo: "Pagamento do jeito do cliente",
    texto: "Dinheiro com troco, Pix, débito e crédito por bandeira, e dá para dividir entre formas.",
    Icone: CreditCard,
    tom: "bg-acento-suave text-texto",
  },
  {
    titulo: "Caixa conferido",
    texto: "Fundo de troco, sangria, suprimento e fechamento com a diferença na hora.",
    Icone: Wallet,
    tom: "bg-sucesso-suave text-sucesso-escuro",
  },
  {
    titulo: "Estoque à mão",
    texto: "Entradas e saídas lançadas no balcão, com aviso do que está acabando.",
    Icone: Package,
    tom: "bg-sucesso-suave text-sucesso-escuro",
  },
  {
    titulo: "Painel do dono",
    texto: "Faturamento do dia, da semana e do mês, ticket médio e vendas por forma e por funcionário.",
    Icone: LayoutDashboard,
    tom: "bg-primaria-suave text-primaria-escura",
  },
  {
    titulo: "Permissões por funcionário",
    texto: "Cada um entra com o próprio login e só vê o que o dono liberou.",
    Icone: ShieldCheck,
    tom: "bg-secundaria-suave text-secundaria-escura",
  },
  {
    titulo: "Histórico e planilha",
    texto: "Filtre vendas por dia, funcionário ou forma de pagamento e baixe em planilha.",
    Icone: History,
    tom: "bg-acento-suave text-texto",
  },
];

const antes = [
  "Troco feito de cabeça com a fila crescendo",
  "Fim do dia contando nota sem saber quanto devia ter",
  "Sorvete acabando sem ninguém perceber",
];

const depois = [
  "Troco aparece assim que o valor recebido é digitado",
  "Fechamento mostra esperado, contado e a diferença",
  "Estoque baixo avisa no painel do dono",
];

function TituloSecao({ id, chapeu, titulo, texto }: { id: string; chapeu: string; titulo: string; texto: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <span className="text-sm font-bold tracking-widest text-secundaria-escura uppercase">{chapeu}</span>
      <h2 id={id} className="text-3xl font-extrabold sm:text-4xl">
        {titulo}
      </h2>
      <p className="text-xl text-texto-suave text-pretty">{texto}</p>
    </div>
  );
}

export function AntesDepois() {
  return (
    <section aria-labelledby="titulo-antes-depois" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <TituloSecao
        id="titulo-antes-depois"
        chapeu="Chega de caderninho"
        titulo="Menos conta de cabeça, mais sorvete servido"
        texto="Tudo que hoje depende de memória e calculadora passa a ficar registrado."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-modal border border-borda bg-superficie p-6 sm:p-8">
          <h3 className="text-xl text-texto-suave">Sem sistema</h3>
          <ul className="mt-5 flex flex-col gap-4">
            {antes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-perigo-suave text-perigo">
                  <X aria-hidden="true" className="size-4" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-modal bg-tinta p-6 text-superficie shadow-elevada sm:p-8">
          <span aria-hidden="true" className="absolute -top-20 -right-20 size-56 rounded-full bg-primaria/50 blur-3xl" />
          <h3 className="relative text-xl">Com o Sorveteria PDV</h3>
          <ul className="relative mt-5 flex flex-col gap-4">
            {depois.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sucesso text-texto">
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Recursos() {
  return (
    <section id="recursos" aria-labelledby="titulo-recursos" className="scroll-mt-20 bg-superficie py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <TituloSecao
          id="titulo-recursos"
          chapeu="Tudo num lugar só"
          titulo="Do primeiro picolé ao fechamento do caixa"
          texto="Feito para o balcão: botões grandes, poucos toques e nada de tela complicada."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recursos.map(({ titulo, texto, Icone, tom }) => (
            <li
              key={titulo}
              className="flex flex-col gap-3 rounded-card border border-borda bg-fundo p-5 transition-all duration-150 hover:-translate-y-1 hover:bg-superficie hover:shadow-elevada"
            >
              <span aria-hidden="true" className={`grid size-12 place-items-center rounded-botao ${tom}`}>
                <Icone className="size-6" />
              </span>
              <h3 className="text-xl">{titulo}</h3>
              <p className="text-texto-suave">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const passos = [
  { titulo: "Abra o caixa", texto: "Confirme sua senha e informe o fundo de troco. Pronto para vender." },
  { titulo: "Venda e anote comandas", texto: "Toque nos produtos, cobre do jeito que o cliente quiser e siga para o próximo." },
  { titulo: "Feche e confira", texto: "Conte o dinheiro da gaveta: o sistema mostra o esperado e a diferença na hora." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <TituloSecao
        id="titulo-como-funciona"
        chapeu="Como funciona"
        titulo="Três passos, todo dia"
        texto="O funcionário aprende no primeiro turno."
      />
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {passos.map((passo, indice) => (
          <li key={passo.titulo} className="relative flex flex-col gap-3 rounded-modal border border-borda bg-superficie p-6 shadow-suave sm:p-8">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-linear-135 from-primaria to-primaria-escura font-titulo text-xl font-extrabold text-superficie shadow-brilho-primaria"
            >
              {indice + 1}
            </span>
            <h3 className="text-2xl">{passo.titulo}</h3>
            <p className="text-texto-suave">{passo.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
