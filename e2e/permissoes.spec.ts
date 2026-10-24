import { expect, test, type Page } from "@playwright/test";
import { credencial, motivoParaPular, VARIAVEIS_BANCO } from "./ambiente";
import { entrar, menuPrincipal, novaPagina, tituloDaPagina } from "./telas";

// Critério de aceite: funcionário sem `pode_lancar_estoque` não vê a tela de estoque.
// Pré-requisito: E2E_FUNCIONARIO_* é um funcionário ativo SEM nenhuma permissão extra.
// Sem a permissão, exigirPermissao/exigirDono redirecionam para /caixa (src/features/auth/sessao.ts).

const SO_COM_PERMISSAO = ["Estoque", "Produtos", "Dashboard", "Funcionários", "Configurações"];
const DE_TODOS = ["Caixa", "Vender e comandas", "Histórico"];

test.describe("funcionário sem permissões extras", () => {
  const motivo = motivoParaPular([...VARIAVEIS_BANCO, "E2E_FUNCIONARIO_USUARIO", "E2E_FUNCIONARIO_SENHA"]);
  test.skip(motivo !== undefined, motivo);
  test.describe.configure({ mode: "serial" });

  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    page = await novaPagina(browser, testInfo);
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test("entra pelo caixa", async () => {
    await entrar(page, credencial("E2E_FUNCIONARIO"));
    await expect(page).toHaveURL(/\/caixa$/);
  });

  test("menu mostra só as telas do balcão", async () => {
    const menu = await menuPrincipal(page);
    for (const rotulo of DE_TODOS) await expect(menu.getByRole("link", { name: rotulo, exact: true })).toBeVisible();
    for (const rotulo of SO_COM_PERMISSAO) await expect(menu.getByRole("link", { name: rotulo, exact: true })).toHaveCount(0);
  });

  for (const rota of ["/estoque", "/produtos", "/dashboard", "/funcionarios", "/configuracoes"]) {
    test(`acesso direto a ${rota} volta para o caixa`, async () => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/caixa$/);
      await expect(tituloDaPagina(page)).toHaveText(/^(Caixa|Abrir caixa)$/);
    });
  }

  // Modo caixa: com o caixa aberto, o funcionário só sai da tela de vendas fechando o caixa.
  // O caixa é aberto sem fundo e fechado logo depois, sem vendas (contado R$ 0,00 = esperado).
  test("com o caixa aberto fica preso na tela de vendas até fechar", async () => {
    await page.goto("/caixa");
    await page.getByLabel("Sua senha").fill(credencial("E2E_FUNCIONARIO").senha);
    await page.getByLabel("Abrir sem fundo").check();
    await page.getByRole("button", { name: "Abrir caixa" }).click();
    await expect(page).toHaveURL(/\/vender$/);

    await page.keyboard.press("Escape");
    const aviso = page.getByRole("dialog", { name: "Sair da tela de vendas?" });
    await expect(aviso).toBeVisible();
    await expect(aviso.getByRole("button", { name: "Sair sem fechar o caixa" })).toHaveCount(0);
    await aviso.getByRole("link", { name: "Fechar o caixa" }).click();
    await expect(page).toHaveURL(/\/vender\/caixa#fechar$/);

    for (const rota of ["/vendas", "/estoque", "/caixa/fechamento/00000000-0000-4000-8000-000000000000"]) {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/vender$/);
    }

    await page.goto("/vender/caixa");
    const fechar = page.getByRole("region", { name: "Fechar caixa" });
    await fechar.getByLabel("Sua senha").fill(credencial("E2E_FUNCIONARIO").senha);
    await fechar.getByLabel("Dinheiro contado na gaveta").fill("0");
    await fechar.getByRole("button", { name: "Fechar caixa" }).click();
    await expect(page).toHaveURL(/\/caixa\/fechamento\/[0-9a-f-]{36}$/);
    await expect(await menuPrincipal(page)).toBeVisible();
  });
});

test.describe("dono", () => {
  const motivo = motivoParaPular([...VARIAVEIS_BANCO, "E2E_DONO_USUARIO", "E2E_DONO_SENHA"]);
  test.skip(motivo !== undefined, motivo);

  test("entra pelo dashboard e vê todas as telas no menu", async ({ page }) => {
    await entrar(page, credencial("E2E_DONO"));
    await expect(page).toHaveURL(/\/dashboard$/);
    const menu = await menuPrincipal(page);
    for (const rotulo of [...DE_TODOS, ...SO_COM_PERMISSAO]) {
      await expect(menu.getByRole("link", { name: rotulo, exact: true })).toBeVisible();
    }
  });
});
