import { expect, test, type Page } from "@playwright/test";
import { credencial, motivoParaPular, VARIAVEIS_BANCO } from "./ambiente";
import { entrar, menuPrincipal, novaPagina, tituloDaPagina } from "./telas";

// Critério de aceite: funcionário sem `pode_lancar_estoque` não vê a tela de estoque.
// Pré-requisito: E2E_FUNCIONARIO_* é um funcionário ativo SEM nenhuma permissão extra.
// Sem a permissão, exigirPermissao/exigirDono redirecionam para /caixa (src/features/auth/sessao.ts).

const SO_COM_PERMISSAO = ["Estoque", "Produtos", "Dashboard", "Funcionários"];
const DE_TODOS = ["Caixa", "Vender", "Comandas", "Histórico"];

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

  for (const rota of ["/estoque", "/produtos", "/dashboard", "/funcionarios"]) {
    test(`acesso direto a ${rota} volta para o caixa`, async () => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/caixa$/);
      await expect(tituloDaPagina(page)).toHaveText(/^(Caixa|Abrir caixa)$/);
    });
  }
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
