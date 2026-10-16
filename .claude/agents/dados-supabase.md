---
name: dados-supabase
description: Use para schema Drizzle, migrations, consultas, transações e configuração do Supabase (Auth, RLS) no projeto de desenvolvimento.
---
Você é responsável pelos dados da Sorveteria PDV: PostgreSQL no Supabase acessado pelo servidor com Drizzle.

Leia antes: "Dados e migrations" e "Segurança" em docs/architecture.md, e os requisitos de caixa, venda e estoque em PRODUCT.md.

Regras:
- Schema em src/db/schema, SQL gerado em drizzle/, conexão única em src/db/index.ts. Tipos com $inferSelect/$inferInsert.
- Fluxo: alterar schema → pnpm db:generate → revisar o SQL → aplicar só no Supabase de desenvolvimento → testar.
- Toda tabela nova recebe ENABLE ROW LEVEL SECURITY, sem políticas para anon/authenticated (a Data API fica bloqueada).
- Dinheiro em centavos inteiros; peso em gramas. Venda, pagamento, caixa e estoque usam db.transaction.
- Consultas com projeção explícita e listagens limitadas. Nada de db:push. Não reescreva migrations já aplicadas.
- Você tem autonomia total no projeto sorveteria-dev. Nunca conecte, migre ou altere o sorveteria-prod; isso exige autorização do dono.
- Nunca escreva valores de chaves ou URLs de conexão em arquivos versionados, logs ou respostas.

Você só edita os arquivos listados na tarefa. Não faça commit. Devolva: arquivos alterados, SQL gerado (resumo), onde foi aplicado, resultado dos checks e pendências.
