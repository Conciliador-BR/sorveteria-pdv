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
| Dono | Celular ou computador, dentro ou fora da loja | Tudo: dashboard, histórico, estoque, funcionários, permissões e configurações |

Permissões extras: `pode_lancar_estoque`, `pode_gerenciar_produtos`, `pode_cancelar_venda`, `pode_ver_historico`. Dashboard, funcionários e configurações são exclusivos do dono.

## Fluxos da versão inicial

1. **Entrar:** apresentação → botão "Acessar o sistema" → login com usuário e senha → funcionário sem caixa aberto vai para "Abrir caixa"; dono vai para o dashboard.
2. **Abrir caixa:** funcionário confirma a própria senha e informa o fundo de troco (obrigatório) → caixa aberto.
3. **Venda no balcão:** escolher produtos (por unidade ou por peso em gramas) → total → pagamento → venda registrada.
4. **Comanda:** abrir comanda com nome ou número ("Família Silva", "Mesa 4") → lançar itens ao longo do tempo, por qualquer funcionário com caixa aberto → total atualizado → fechar e cobrar.
5. **Pagamento:** dinheiro (valor recebido e troco calculado na hora), Pix (confirmação manual) ou cartão: card "Débito" ou "Crédito" → cards das bandeiras → toque na bandeira → finalizar; pagamento dividido entre formas.
6. **Sangria e suprimento:** retirar ou colocar dinheiro na gaveta, com motivo.
7. **Fechar caixa:** confirmar senha → informar o dinheiro contado → ver esperado, contado e diferença → resumo por forma de pagamento e bandeira.
8. **Estoque:** cadastrar produto; lançar entrada ou saída com motivo; ver saldo e alerta de mínimo.
9. **Histórico:** filtrar vendas por período, funcionário, forma, bandeira e status; ver detalhe; exportar CSV.
10. **Dashboard:** faturamento do dia, semana e mês; ticket médio; vendas por dia, hora, forma de pagamento, bandeira, produto e funcionário; fechamentos com diferença; estoque baixo.
11. **Funcionários:** dono cria login, define papel e liga/desliga permissões extras; redefine senha; desativa sem apagar histórico.

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

**Venda, comanda e pagamento**

- Valores monetários em centavos inteiros; peso em gramas. Item por peso = preço do kg × gramas ÷ 1000, arredondado ao centavo mais próximo (meio centavo para cima).
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

## Próxima entrega

Login no PR #2, visual e funcionários no PR #3. Operação da loja (caixa, produtos, estoque, venda no balcão, comandas, pagamento, histórico e dashboard) no PR seguinte, com as tabelas já criadas no Supabase de desenvolvimento. Falta o teste ponta a ponta com o primeiro usuário do dono e as variáveis de ambiente. Depois: testes E2E, PWA, configurações da loja e produção com autorização.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em docs/architecture.md e docs/setup.md.
