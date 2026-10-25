# Sorveteria PDV

Sistema de vendas e controle manual de estoque para a sorveteria da Praia do Morro.

## Problema e objetivo

A loja não tem sistema: vendas, dinheiro do caixa e estoque são controlados sem registro confiável. O dono não consegue saber quanto entrou por forma de pagamento, qual funcionário vendeu, quanto dinheiro deve haver na gaveta no fim do dia nem o que está acabando no estoque.

O produto deve registrar cada venda com data, hora, funcionário, itens e forma de pagamento; controlar abertura e fechamento de caixa com conferência de dinheiro; permitir comandas para grupos; e manter um estoque lançado à mão, sem nota fiscal.

## Público e papéis

| Papel | Contexto de uso | Acesso |
|---|---|---|
| Funcionário | Balcão, em computador ou tablet, com fila e mãos geladas | Abrir/fechar o próprio caixa, vender, abrir e cobrar comandas |
| Funcionário com permissões extras | Mesmo contexto | O dono liga por funcionário: lançar estoque, gerenciar produtos, cancelar venda, ver histórico de todos |
| Dono | Celular ou computador, dentro ou fora da loja | Tudo: dashboard, precificação, histórico, estoque, funcionários, permissões e configurações |

Permissões extras: `pode_lancar_estoque`, `pode_gerenciar_produtos`, `pode_cancelar_venda`, `pode_ver_historico`. Dashboard, precificação, funcionários e configurações são exclusivos do dono.

## Fluxos da versão inicial

1. **Entrar:** apresentação → botão "Acessar o sistema" → login com usuário e senha → funcionário sem caixa aberto vai para "Abrir caixa"; dono vai para o dashboard.
2. **Abrir caixa:** funcionário confirma a própria senha e informa o fundo de troco (obrigatório) → caixa aberto → o sistema entra direto na **tela de vendas (modo caixa)**: tela cheia estilo caixa de supermercado, só com Vender (balcão e comandas) e Caixa (sangria, suprimento e fechamento), sem menu nem configurações. Esc (ou o botão "Sair") pergunta como sair: o dono sai sem fechar o caixa; o funcionário só sai fechando o caixa.
3. **Venda no balcão:** escolher produtos (por unidade ou por peso, digitando as gramas ou o valor em reais que a balança mostrou) → total → pagamento → venda registrada.
4. **Comanda:** abrir comanda com nome ou número ("Família Silva", "Mesa 4") → lançar itens ao longo do tempo, por qualquer funcionário com caixa aberto → total atualizado → fechar e cobrar.
5. **Pagamento:** dinheiro (valor recebido e troco calculado na hora), Pix (confirmação manual) ou cartão: card "Débito" ou "Crédito" → cards das bandeiras → toque na bandeira → finalizar; pagamento dividido entre formas.
6. **Sangria e suprimento:** retirar ou colocar dinheiro na gaveta, com motivo.
7. **Fechar caixa:** confirmar senha → informar o dinheiro contado → ver esperado, contado e diferença → resumo por forma de pagamento e bandeira.
8. **Estoque:** cadastrar produto (com foto opcional: imagem pronta da galeria ou foto enviada pelo celular/computador, que aparece nos cartões da venda); lançar entrada ou saída com motivo; ver saldo e valor em estoque (o alerta de mínimo fica no dashboard).
9. **Histórico:** filtrar vendas por período, funcionário, forma, bandeira e status; ver detalhe; exportar CSV.
10. **Dashboard:** faturamento do dia, semana e mês; ticket médio; vendas por dia, hora, forma de pagamento, bandeira, produto e funcionário; fechamentos com diferença; estoque baixo.
11. **Funcionários:** dono cria login, define papel e liga/desliga permissões extras; redefine senha; desativa sem apagar histórico.
12. **Precificação (dono):** cadastrar insumos (preço e tamanho da embalagem), custos fixos do mês e máquinas (depreciação) → informar faturamento médio, imposto, taxa de cartão, parte das vendas no cartão, perdas e margem padrão → em cada produto, montar a ficha técnica (insumos e quantidades da receita e quanto ela rende) e digitar a margem desejada → ver custo, preço sugerido, lucro, markup equivalente e a margem do preço atual → opcionalmente "Usar este preço no caixa".

## MVP

Em ordem de prioridade:

1. Login, funcionários e permissões.
2. Produtos, categorias e estoque manual.
3. Caixa: abertura com fundo, sangria/suprimento, fechamento com conferência.
4. PDV: venda rápida, produto por peso, comandas.
5. Pagamento: dinheiro com troco, Pix, cartão por bandeira, pagamento dividido, cancelamento com permissão.
6. Histórico de vendas com filtros.
7. Dashboard do dono.
8. Página de apresentação e PWA instalável no tablet.

Cronograma de referência (cada entrega é um ou mais PRs aprovados pelo dono):

| Semana | Período | Entrega |
|---|---|---|
| 0 | 16 a 19/out | Repositório, Supabase dev/prod, prompt 10 na máquina, bootstrap (prompt 11) |
| 1 | 20 a 26/out | Tokens visuais e componentes base, apresentação, login, funcionários e permissões |
| 2 | 27/out a 02/nov | Produtos, categorias e estoque; caixa completo |
| 3 | 03 a 09/nov | PDV, produto por peso, comandas, pagamento, cancelamento |
| 4 | 10 a 16/nov | Histórico, dashboard, E2E, revisão de segurança, PWA, produção com autorização |

Se faltar tempo, saem nesta ordem: exportação CSV, modo escuro, gráfico por hora. Caixa, venda, comanda, pagamento, estoque e permissões não saem.

## Fora de escopo

Nota fiscal (NFC-e), integração automática com maquininha ou banco (Pix é confirmado à mão), delivery, fidelidade, impressão em impressora térmica, múltiplas lojas.

## Requisitos

**Caixa**

- Um funcionário tem no máximo um caixa aberto. Sem caixa aberto não há venda; toda venda pertence a um caixa.
- Fundo de abertura obrigatório; R$ 0,00 só com a opção explícita "Abrir sem fundo", registrada.
- Dinheiro esperado na gaveta = fundo + vendas em dinheiro (valor da venda, já descontado o troco) + suprimentos − sangrias. Exemplo: fundo R$ 300 + R$ 400 vendidos em dinheiro = R$ 700.
- Pix e cartão aparecem no resumo, mas não entram no dinheiro esperado.
- Caixa não fecha com comanda aberta vinculada a ele. Observação obrigatória quando houver diferença.
- Caixa fechado não é editado; só o dono reabre, com registro.
- Abertura e fechamento pedem a senha do próprio funcionário de novo.
- Com o caixa aberto, o funcionário fica na tela de vendas: qualquer outra tela do sistema, mesmo digitada no endereço, volta para ela. Só fechando o caixa ele volta ao menu. O dono sai e volta quando quiser, com o caixa aberto.

**Venda, comanda e pagamento**

- Valores monetários em centavos inteiros; peso em gramas. Item por peso = preço do kg × gramas ÷ 1000, arredondado ao centavo mais próximo (meio centavo para cima). Quando o funcionário digita o valor da balança, o item vale esse valor e as gramas são estimadas (valor × 1000 ÷ preço do kg, arredondado, mínimo 1 g) só para o estoque; por isso preço × gramas pode não fechar exatamente com o total. Produto por peso sem preço do kg não aceita o valor. O item guarda que foi informado pelo valor, e o histórico e a comanda mostram o peso como estimado ("≈ 334 g (pelo valor)").
- O preço e o nome do produto são copiados para o item da venda; mudanças posteriores não alteram vendas antigas.
- Comanda é uma venda com status `aberta`; cada item registra quem lançou e quando.
- Troco = valor recebido em dinheiro − parte em dinheiro da venda; nunca negativo. Valor recebido menor que a parte em dinheiro bloqueia a confirmação.
- A soma dos pagamentos deve ser igual ao total para concluir.
- Bandeiras iniciais, cada uma um card na tela. Débito: Visa, Mastercard, Elo. Crédito: Visa, Mastercard, Elo, Hipercard, Amex (o "P-Card" do pedido é o Hipercard, confirmado pelo dono em 16/10/2026). Lista editável pelo dono.
- Sem parcelamento: o "cortar" do pedido era "card" (confirmado pelo dono em 16/10/2026).
- Venda concluída não é editada: corrige-se cancelando (com permissão e motivo) e vendendo de novo. Cancelamento devolve estoque e sai dos totais do caixa.

**Estoque**

- O saldo vem das movimentações (entrada, saída, ajuste, venda, cancelamento); ninguém edita o saldo direto.
- Motivos de entrada/saída: compra, perda/derreteu, consumo interno, ajuste de contagem, outro.
- Produto tem "baixa automática na venda" (padrão: sim para unidade, não para peso, onde o controle é por balde).
- Estoque negativo gera alerta, mas não bloqueia a venda.
- A tela de estoque mostra o valor de cada saldo e o total geral pelo preço de venda (não há custo cadastrado); saldo negativo conta como zero. Na tabela, a situação é só "Negativo" ou "OK"; o estoque mínimo avisa no dashboard.

**Precificação**

- Item "Precificação" no menu, abaixo do Dashboard, só para o dono (nem `pode_gerenciar_produtos` dá acesso): custos e margem são informação do dono.
- Custo do insumo = preço da embalagem ÷ quantidade (g, ml ou unidades). Custo do produto = soma dos insumos da receita ÷ rendimento (por unidade, ou por kg no produto por peso). Produto de revenda (picolé comprado pronto) usa ele mesmo como insumo.
- Custos mensais = custos fixos + depreciação linear das máquinas ((compra − valor no fim) ÷ vida útil em meses). Entram no preço como percentual do faturamento médio informado.
- Despesas sobre a venda = custos mensais ÷ faturamento + imposto + taxa da maquininha × parte das vendas no cartão + perdas.
- Imposto pelo regime da loja: **MEI** (o DAS mensal soma aos custos fixos, sem % por venda), **Simples Nacional** (alíquota efetiva = (receita de 12 meses × alíquota nominal − parcela a deduzir) ÷ receita de 12 meses, pelas tabelas dos Anexos I, comércio, e II, indústria, da LC 123/2006; sem a receita de 12 meses, usa o faturamento médio × 12; acima de R$ 4,8 milhões avisa e usa a última faixa) ou **outro** (o dono digita o %). O anexo certo é confirmado com o contador.
- Preço sugerido = custo ÷ (1 − despesas − margem), arredondado para cima ao centavo. A margem é sobre o preço de venda; a tela mostra o markup equivalente (quanto o preço está acima do custo) e explica a diferença. Despesas + margem ≥ 100% não têm preço.
- A tela só sugere: o preço do caixa muda apenas com "Usar … no caixa", que o servidor recalcula, recusa se o valor mudou e grava na `auditoria`. Vendas antigas não mudam.

**Gerais**

- Interface em português do Brasil, moeda R$, datas `dd/mm/aaaa HH:mm`, fuso America/Sao_Paulo.
- Funciona em tablet (a partir de 768 px) e desktop (1280 px); área do dono também no celular. Alvo de toque mínimo de 48 px.
- Acessibilidade: HTML semântico, teclado, foco visível, contraste WCAG AA, movimento reduzido.
- Auditoria: tudo que mexe em dinheiro ou estoque registra quem, quando e o quê.
- Segurança: nenhuma chave ou acesso ao banco no navegador; autorização conferida no servidor; funcionário desativado não entra.

## Restrições e decisões técnicas

- Next.js estável com App Router, TypeScript strict, Tailwind, ESLint, `src/` e alias `@/*`; pnpm.
- Persistência: Drizzle ORM + PostgreSQL (driver `pg`), com o banco hospedado no **Supabase**. O pedido do dono é usar Supabase; ele é PostgreSQL, então o default do toolkit se mantém.
- Autenticação: **Supabase Auth**, chamado só pelo servidor (Server Actions e Route Handlers). Login por usuário, mapeado para um e-mail técnico interno. Cadastro público desligado.
- Acesso ao banco só pelo servidor, via Drizzle. A Data API do Supabase fica bloqueada (RLS ligado sem políticas para `anon`/`authenticated`). Detalhes em [docs/architecture.md](docs/architecture.md).
- Hospedagem prevista: Vercel. Publicação só com autorização do dono.
- Prazo: cerca de um mês a partir de 16/10/2026.

## Hipóteses e pendências

| Item | Tipo | Impacto | Próximo passo |
|---|---|---|---|
| Sorvete vendido por peso (self-service por kg) | Hipótese reversível | Tipo de produto "peso" | Dono confirma |
| Um caixa por funcionário, cada um com sua conferência | Decidido pelo dono em 16/10/2026 | Modelo de caixa | — |
| Nome e logo da loja | Pendente | Apresentação e layout | Dono envia |
| Variáveis de ambiente do Supabase no host e no `.env.local` do dono | Pendente externo | Rodar o app com banco real | Dono cadastra quando o login estiver pronto |

## Critérios de aceitação

- Um funcionário sem caixa aberto não consegue registrar venda nem por chamada direta ao servidor.
- Abrindo com R$ 300 e vendendo R$ 400 em dinheiro, o fechamento mostra R$ 700 esperados; contando R$ 695, mostra falta de R$ 5 e exige observação.
- Venda de R$ 25,80 paga com R$ 30,00 mostra troco de R$ 4,20.
- 350 g de um produto de R$ 59,90/kg resultam em R$ 20,97.
- Comanda com itens lançados por dois funcionários mostra total correto e quem lançou cada item; o caixa não fecha enquanto ela estiver aberta.
- Pagamento por cartão grava forma (débito/crédito) e bandeira; o resumo do caixa mostra totais por bandeira.
- Funcionário sem `pode_lancar_estoque` não vê a tela de estoque e o servidor recusa o lançamento.
- O histórico mostra número, data, hora, funcionário, itens, total e pagamento de cada venda; cancelada aparece com quem cancelou e o motivo.
- Nenhuma chave do Supabase, URL de banco ou `service_role` aparece no bundle do navegador.
- Precificação: casquinha com 100 g de base (balde de 1 kg a R$ 20,00) e 1 casquinha (caixa de 100 a R$ 30,00) custa R$ 2,30; com R$ 6.000 de fixos, uma máquina de R$ 30.000 em 5 anos, faturamento de R$ 50.000, imposto de 6%, taxa de 2% em metade das vendas e margem de 30%, o preço sugerido é R$ 4,60 (lucro R$ 1,38, markup 100%). Somar 30% no custo daria R$ 2,99 e só 3% de lucro. No Simples, Anexo II, com R$ 420.000 vendidos em 12 meses, o imposto é 6,7% (faixa 3). Funcionário não vê nem abre `/precificacao`.

## Próxima entrega

Login no PR #2, visual e funcionários no PR #3. Operação da loja (caixa, produtos, estoque, venda no balcão, comandas, pagamento, histórico e dashboard) no PR seguinte, com as tabelas já criadas no Supabase de desenvolvimento. Falta o teste ponta a ponta com o primeiro usuário do dono e as variáveis de ambiente. Testes E2E no PR #5. App instalável (manifesto e ícones, abre em `/entrar`; sem modo offline, precisa de internet) no PR seguinte. Configurações da loja (nome no menu e bandeiras de cartão editáveis pelo dono) no próximo PR. Depois: produção com autorização.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em docs/architecture.md e docs/setup.md.
