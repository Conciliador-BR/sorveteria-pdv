import { expect, type Browser, type Locator, type Page, type TestInfo } from "@playwright/test";

// Ajudantes de tela com os rótulos reais dos componentes (src/features/*/components).

/**
 * Página compartilhada entre os testes de um describe serial, com o baseURL e o viewport do projeto.
 * Um login por describe: o Supabase Auth limita tentativas de login por IP.
 */
export async function novaPagina(browser: Browser, testInfo: TestInfo) {
  const { baseURL, viewport } = testInfo.project.use;
  const contexto = await browser.newContext({ baseURL, viewport });
  return contexto.newPage();
}

export async function entrar(page: Page, { usuario, senha }: { usuario: string; senha: string }) {
  await page.goto("/entrar");
  await page.getByLabel("Usuário").fill(usuario);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page, "login recusado: confira E2E_*_USUARIO e E2E_*_SENHA").not.toHaveURL(/\/entrar$/);
}

/** Menu principal visível: lateral no desktop; no tablet, abre a gaveta antes. */
export async function menuPrincipal(page: Page) {
  const abrir = page.getByRole("button", { name: "Abrir menu" });
  if (await abrir.isVisible()) await abrir.click();
  return page.getByRole("navigation", { name: "Menu principal" });
}

/** Valor de uma linha "rótulo ..... R$ x" de lista de definição (LinhaValor e conferência do caixa). */
export function valorDaLinha(escopo: Page | Locator, rotulo: string) {
  return escopo.locator(`xpath=.//div[dt[normalize-space()="${rotulo}"]]/dd`);
}

/** Valor grande do balcão com o rótulo em cima (TotalDestaque e falta/sobra da conferência). */
export function valorDestaque(escopo: Page | Locator, rotulo: string) {
  return escopo.locator(`xpath=.//*[span[1][normalize-space()="${rotulo}"]]/span[2]`);
}

/** "R$ 315,80" → "31580": o formato que se digita nos campos de dinheiro (digitação em centavos). */
export function digitosDoValor(texto: string) {
  return texto.replace(/\D/g, "");
}

/** Título principal da página (PageHeader). */
export function tituloDaPagina(page: Page) {
  return page.getByRole("heading", { level: 1 });
}
