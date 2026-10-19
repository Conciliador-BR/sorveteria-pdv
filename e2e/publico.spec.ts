import { expect, test } from "@playwright/test";
import { motivoParaPular, VARIAVEIS_AUTH } from "./ambiente";
import { tituloDaPagina } from "./telas";

// Smoke público: sem login e sem banco.

test("apresentação abre com título e link para entrar", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Sorveteria PDV");
  await expect(tituloDaPagina(page)).toHaveText("A fila anda rápido. O caixa fecha certinho.");
  const acessar = page.getByRole("link", { name: "Acessar o sistema" });
  await expect(acessar).toHaveAttribute("href", "/entrar");
});

test("app instalável: manifesto e ícones respondem", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBe("/manifest.webmanifest");
  const manifesto = await (await request.get(href!)).json();
  expect(manifesto).toMatchObject({ start_url: "/entrar", display: "standalone" });
  for (const { src } of manifesto.icons as { src: string }[]) {
    const icone = await request.get(src);
    expect(icone.ok(), src).toBe(true);
    expect(icone.headers()["content-type"]).toBe("image/png");
  }
});

// /entrar e a área logada leem a sessão com o Supabase Auth do servidor. Sem SUPABASE_URL e
// SUPABASE_PUBLISHABLE_KEY essas páginas respondem 500 ("Invalid or missing environment variable");
// só a apresentação abre sem as variáveis (docs/architecture.md, "Login e sessão").
test.describe("login e proteção da área logada", () => {
  const motivo = motivoParaPular(VARIAVEIS_AUTH);
  test.skip(motivo !== undefined, motivo);

  test("link da apresentação leva ao login com usuário e senha rotulados", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Acessar o sistema" }).click();
    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page).toHaveTitle("Entrar · Sorveteria PDV");
    await expect(page.getByRole("heading", { name: "Entrar no sistema" })).toBeVisible();
    await expect(page.getByLabel("Usuário")).toHaveAttribute("autocomplete", "username");
    await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeEnabled();
  });

  for (const rota of ["/caixa", "/vender", "/dashboard"]) {
    test(`sem sessão, ${rota} leva ao login`, async ({ page }) => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/entrar$/);
      await expect(page.getByLabel("Usuário")).toBeVisible();
    });
  }
});
