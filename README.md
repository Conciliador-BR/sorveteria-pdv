# Sorveteria PDV

Sistema de vendas da sorveteria da Praia do Morro: caixa com abertura e fechamento conferidos, vendas no balcão e em comandas, pagamento em dinheiro com troco, Pix ou cartão por bandeira, estoque lançado à mão e painel do dono. Detalhes em [PRODUCT.md](PRODUCT.md).

## Executar

MVP implementado, com o banco de desenvolvimento migrado; produção ainda não publicada. Requer Node.js 24 LTS e pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # preencha com a conexão do Supabase de desenvolvimento
pnpm dev
pnpm check                   # lint, lint com tipos, tipos, regras, testes e build
```

Precisa de um projeto Supabase de desenvolvimento. As credenciais ficam em `.env.local` (no seu computador) e nas variáveis do host ou do ambiente na nuvem, nunca no Git.

## Documentação

- [Produto e escopo](PRODUCT.md).
- [Preparação local](docs/onboarding.md).
- [Estrutura e decisões técnicas](docs/architecture.md).
- [Design e acessibilidade](docs/design.md).
- [Checks de qualidade](docs/quality.md).
- [Instruções para agentes](AGENTS.md).
- [Setup e evidências](docs/setup.md).

## Próxima entrega

Teste do dono no computador da loja e autorização para publicar em produção (Supabase `sorveteria-prod` e Vercel). Pendências em `docs/setup.md`.
