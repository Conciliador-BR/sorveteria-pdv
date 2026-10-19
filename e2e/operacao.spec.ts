import { expect, test, type Page } from "@playwright/test";
import { credencial, motivoParaPular, VARIAVEIS_BANCO } from "./ambiente";
import { digitosDoValor, entrar, novaPagina, tituloDaPagina, valorDaLinha, valorDestaque } from "./telas";

// Dia de loja do dono, de ponta a ponta, no Supabase de DESENVOLVIMENTO.
//
// Para os valores exatos, o fluxo começa com um caixa NOVO: se o dono já tiver um caixa aberto,
// ele é fechado antes com o contado igual ao esperado (sem diferença). Comanda aberta vinculada a
// esse caixa impede o fechamento, e o teste para com a mensagem da tela.
//
// Cria dados de verdade (produtos "E2E …", vendas, comanda, movimentos de caixa e estoque), com
// sufixo de data e hora para não colidir entre execuções. Requer bandeira de crédito "Hipercard" ativa.

const sufixo = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const PICOLE = `E2E Picolé ${sufixo}`;
const SORVETE_KG = `E2E Sorvete kg ${sufixo}`;
const COMANDA = `E2E ${sufixo}`;

test.describe("operação da loja pelo dono", () => {
  const motivo = motivoParaPular([...VARIAVEIS_BANCO, "E2E_DONO_USUARIO", "E2E_DONO_SENHA"]);
  test.skip(motivo !== undefined, motivo);
  // Só no projeto tablet (ver playwright.config.ts); cada passo depende do anterior.
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  const { senha } = credencial("E2E_DONO");
  const vendas = { balcao: "", peso: "", comanda: "" };
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    page = await novaPagina(browser, testInfo);
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test("dono entra e vai para o dashboard", async () => {
    await entrar(page, credencial("E2E_DONO"));
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("abre um caixa novo com fundo de R$ 300,00", async () => {
    await page.goto("/caixa");
    await expect(tituloDaPagina(page)).toHaveText(/^(Caixa|Abrir caixa)$/);
    if ((await tituloDaPagina(page).textContent()) === "Caixa") await fecharCaixaSemDiferenca(page, senha);

    await page.goto("/caixa");
    await expect(tituloDaPagina(page)).toHaveText("Abrir caixa");
    await page.getByLabel("Sua senha").fill(senha);
    await page.getByLabel("Fundo de troco").fill("30000");
    await expect(page.getByLabel("Fundo de troco")).toHaveValue("R$ 300,00");
    await page.getByRole("button", { name: "Abrir caixa" }).click();

    await expect(tituloDaPagina(page)).toHaveText("Caixa");
    await expect(valorDaLinha(page, "Fundo de troco")).toHaveText("R$ 300,00");
    await expect(valorDaLinha(page, "= Esperado na gaveta")).toHaveText("R$ 300,00");
  });

  test("cadastra um produto por unidade e um por kg", async () => {
    await page.goto("/produtos");
    const novo = page.getByRole("region", { name: "Novo produto" });

    await novo.getByLabel("Nome", { exact: true }).fill(PICOLE);
    await expect(novo.getByRole("radio", { name: "Por unidade" })).toBeChecked();
    await novo.getByLabel("Preço", { exact: true }).fill("2580");
    await expect(novo.getByRole("checkbox", { name: /Baixa automática na venda/ })).toBeChecked();
    await novo.getByRole("button", { name: "Cadastrar produto" }).click();
    await expect(page.locator("summary", { hasText: PICOLE })).toContainText("R$ 25,80");

    await novo.getByLabel("Nome", { exact: true }).fill(SORVETE_KG);
    await novo.getByRole("radio", { name: "Por peso (kg)" }).check();
    await novo.getByLabel("Preço do quilo").fill("5990");
    // Padrão do produto por peso: baixa desligada (controle por balde).
    await expect(novo.getByRole("checkbox", { name: /Baixa automática na venda/ })).not.toBeChecked();
    await novo.getByRole("button", { name: "Cadastrar produto" }).click();
    await expect(page.locator("summary", { hasText: SORVETE_KG })).toContainText("R$ 59,90/kg");
  });

  test("lança entrada de 10 unidades no estoque", async () => {
    await page.goto("/estoque");
    const lancamento = page.getByRole("region", { name: "Novo lançamento" });
    await lancamento.getByLabel("Produto", { exact: true }).selectOption({ label: `${PICOLE} (0 un)` });
    await lancamento.getByRole("radio", { name: "Entrada" }).check();
    await lancamento.getByLabel("Motivo", { exact: true }).selectOption("compra");
    await lancamento.getByLabel("Quantidade (em unidades)").fill("10");
    await lancamento.getByRole("button", { name: "Registrar lançamento" }).click();

    await expect(lancamento.getByRole("status").filter({ hasText: "Lançamento registrado." })).toBeVisible();
    await expect(linhaDoSaldo(page, PICOLE)).toContainText("10 un");
  });

  test("venda no balcão de R$ 25,80 com R$ 30,00 em dinheiro mostra troco de R$ 4,20", async () => {
    await page.goto("/vender");
    await escolherProduto(page, PICOLE);
    await expect(valorDestaque(page, "Total")).toHaveText("R$ 25,80");
    await page.getByRole("button", { name: "Cobrar", exact: true }).click();

    await page.getByRole("group", { name: "Forma de pagamento" }).getByRole("button", { name: "Dinheiro" }).click();
    await page.getByLabel("Valor recebido").fill("3000");
    await expect(valorDestaque(page, "Troco")).toHaveText("R$ 4,20");
    await page.getByRole("button", { name: "Confirmar pagamento" }).click();

    vendas.balcao = await numeroDaVendaConfirmada(page, "Venda registrada");
    await expect(valorDestaque(page, "Total")).toHaveText("R$ 25,80");
    await expect(valorDestaque(page, "Troco")).toHaveText("R$ 4,20");
    await page.getByRole("button", { name: "Nova venda" }).click();
  });

  test("venda de 350 g a R$ 59,90/kg dá R$ 20,97, paga no crédito Hipercard", async () => {
    await expect(page.getByLabel("Buscar produto")).toBeVisible();
    await escolherProduto(page, SORVETE_KG);
    await page.getByLabel(`Peso de ${SORVETE_KG} (gramas)`).fill("350");
    await expect(valorDestaque(page, "Total")).toHaveText("R$ 20,97");
    await page.getByRole("button", { name: "Cobrar", exact: true }).click();

    await page.getByRole("group", { name: "Forma de pagamento" }).getByRole("button", { name: "Cartão" }).click();
    await page.getByRole("group", { name: "Tipo de cartão" }).getByRole("button", { name: "Crédito" }).click();
    await page.getByRole("group", { name: "Bandeira do crédito" }).getByRole("button", { name: "Hipercard" }).click();
    await expect(page.getByLabel("Valor no cartão")).toHaveValue("R$ 20,97");
    await page.getByRole("button", { name: "Confirmar pagamento" }).click();

    vendas.peso = await numeroDaVendaConfirmada(page, "Venda registrada");
    await expect(valorDestaque(page, "Total")).toHaveText("R$ 20,97");
    await expect(valorDestaque(page, "Troco")).toHaveText("R$ 0,00");
  });

  test("comanda: abre, lança item, cobra no Pix e sai das abertas", async () => {
    await page.goto("/vender");
    await page.getByLabel("Nome ou número da comanda").fill(COMANDA);
    await page.getByRole("button", { name: "Abrir comanda" }).click();
    await expect(page).toHaveURL(/\/comandas\/[0-9a-f-]{36}$/);
    await expect(tituloDaPagina(page)).toHaveText(`Comanda ${COMANDA}`);

    await escolherProduto(page, PICOLE);
    await page.getByRole("button", { name: "Lançar na comanda" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Itens lançados na comanda." })).toBeVisible();
    const itens = page.getByRole("region", { name: "Itens da comanda" });
    await expect(itens.getByText(`1 × ${PICOLE}`)).toBeVisible();
    await expect(valorDestaque(itens, "Total da comanda")).toHaveText("R$ 25,80");

    await page.getByRole("button", { name: "Cobrar comanda" }).click();
    await page.getByRole("group", { name: "Forma de pagamento" }).getByRole("button", { name: "Pix" }).click();
    await expect(page.getByLabel("Valor no Pix")).toHaveValue("R$ 25,80");
    await page.getByRole("button", { name: "Pix recebido" }).click();
    vendas.comanda = await numeroDaVendaConfirmada(page, "Comanda cobrada");

    await page.getByRole("link", { name: "Voltar às comandas" }).click();
    await expect(tituloDaPagina(page)).toHaveText("Vender e comandas");
    await expect(page.getByRole("heading", { name: COMANDA, exact: true })).toHaveCount(0);
  });

  test("sangria de R$ 10,00 com motivo", async () => {
    await page.goto("/caixa");
    const gaveta = page.getByRole("region", { name: "Sangria e suprimento" });
    await gaveta.getByLabel("Tipo", { exact: true }).selectOption("sangria");
    await gaveta.getByLabel("Valor", { exact: true }).fill("1000");
    await gaveta.getByLabel("Motivo", { exact: true }).fill("E2E depósito no banco");
    await gaveta.getByRole("button", { name: "Registrar" }).click();
    await expect(gaveta.getByRole("status").filter({ hasText: "Sangria de R$ 10,00 registrada." })).toBeVisible();

    // Esperado = fundo 300,00 + dinheiro 25,80 (valor da venda, não o recebido) − sangria 10,00.
    await expect(valorDaLinha(page, "+ Vendas em dinheiro")).toHaveText("R$ 25,80");
    await expect(valorDaLinha(page, "− Sangrias")).toHaveText("R$ 10,00");
    await expect(valorDaLinha(page, "= Esperado na gaveta")).toHaveText("R$ 315,80");
  });

  test("fechamento com R$ 5,00 a menos mostra a falta, exige observação e resume por forma e bandeira", async () => {
    const fechar = page.getByRole("region", { name: "Fechar caixa" });
    await fechar.getByLabel("Sua senha").fill(senha);
    await fechar.getByLabel("Dinheiro contado na gaveta").fill("31080");
    await fechar.getByRole("button", { name: "Fechar caixa" }).click();

    await expect(valorDaLinha(fechar, "Esperado na gaveta")).toHaveText("R$ 315,80");
    await expect(valorDaLinha(fechar, "Contado")).toHaveText("R$ 310,80");
    await expect(valorDestaque(fechar, "Falta")).toHaveText("R$ 5,00");
    await expect(fechar.getByText("Explique a diferença para fechar o caixa.")).toBeVisible();
    await expect(page).toHaveURL(/\/caixa$/);

    await fechar.getByLabel("Observação (obrigatória: explique a diferença)").fill("E2E: diferença de teste");
    await fechar.getByRole("button", { name: "Fechar caixa" }).click();

    await expect(page).toHaveURL(/\/caixa\/fechamento\/[0-9a-f-]{36}$/);
    await expect(tituloDaPagina(page)).toHaveText("Fechamento de caixa");
    await expect(valorDestaque(page, "Falta")).toHaveText("R$ 5,00");
    await expect(page.getByText("E2E: diferença de teste")).toBeVisible();
    const resumo = {
      "Fundo de troco": "R$ 300,00",
      "+ Vendas em dinheiro": "R$ 25,80",
      "− Sangrias": "R$ 10,00",
      Dinheiro: "R$ 25,80",
      Pix: "R$ 25,80",
      Débito: "R$ 0,00",
      Crédito: "R$ 20,97",
      "Total vendido": "R$ 72,57",
      Hipercard: "R$ 20,97",
    };
    for (const [rotulo, valor] of Object.entries(resumo)) await expect(valorDaLinha(page, rotulo), rotulo).toHaveText(valor);
  });

  test("histórico mostra as vendas do dia e o detalhe com itens e pagamento", async () => {
    await page.goto("/vendas");
    for (const numero of Object.values(vendas)) await expect(linkDaVenda(page, numero)).toBeVisible();
    await expect(linkDaVenda(page, vendas.comanda)).toContainText(`Comanda ${COMANDA}`);

    await linkDaVenda(page, vendas.balcao).click();
    await expect(tituloDaPagina(page)).toHaveText(`Venda nº ${vendas.balcao}`);
    const itemBalcao = page.getByRole("region", { name: "Itens da venda" }).getByRole("row", { name: PICOLE });
    await expect(itemBalcao).toContainText("1 un");
    await expect(itemBalcao).toContainText("R$ 25,80");
    const pagamentoBalcao = page.getByRole("region", { name: "Pagamento" });
    await expect(valorDaLinha(pagamentoBalcao, "Troco")).toHaveText("R$ 4,20");
    await expect(pagamentoBalcao).toContainText("Recebido R$ 30,00");

    await page.goto("/vendas");
    await linkDaVenda(page, vendas.peso).click();
    await expect(tituloDaPagina(page)).toHaveText(`Venda nº ${vendas.peso}`);
    const itemPeso = page.getByRole("region", { name: "Itens da venda" }).getByRole("row", { name: SORVETE_KG });
    await expect(itemPeso).toContainText("350 g");
    await expect(itemPeso).toContainText("R$ 59,90/kg");
    await expect(itemPeso).toContainText("R$ 20,97");
    await expect(page.getByRole("region", { name: "Pagamento" })).toContainText("Crédito · Hipercard");
  });

  test("estoque baixou as duas unidades vendidas", async () => {
    await page.goto("/estoque");
    // 10 de entrada − 1 no balcão − 1 na comanda (baixa automática ligada).
    await expect(linhaDoSaldo(page, PICOLE)).toContainText("8 un");
  });

  test("dashboard abre para o dono", async () => {
    await page.goto("/dashboard");
    await expect(tituloDaPagina(page)).toHaveText("Dashboard");
    await expect(page.getByRole("heading", { name: "Hoje", exact: true })).toBeVisible();
  });
});

async function escolherProduto(page: Page, nome: string) {
  await page.getByLabel("Buscar produto").fill(nome);
  await page.getByRole("button", { name: nome }).click();
}

async function numeroDaVendaConfirmada(page: Page, titulo: string) {
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
  const texto = (await page.getByText(/^Venda nº \d+$/).textContent()) ?? "";
  const numero = /\d+/.exec(texto)?.[0];
  expect(numero, "número da venda na confirmação").toBeTruthy();
  return numero ?? "";
}

function linhaDoSaldo(page: Page, produto: string) {
  return page.getByRole("region", { name: "Saldo de estoque por produto" }).getByRole("row", { name: produto });
}

function linkDaVenda(page: Page, numero: string) {
  return page.getByRole("link", { name: new RegExp(`^Nº ${numero}\\s`) });
}

/** Fecha o caixa já aberto contando exatamente o esperado, para o fluxo começar do zero. */
async function fecharCaixaSemDiferenca(page: Page, senha: string) {
  const esperado = (await valorDaLinha(page, "= Esperado na gaveta").textContent()) ?? "";
  const fechar = page.getByRole("region", { name: "Fechar caixa" });
  await fechar.getByLabel("Sua senha").fill(senha);
  await fechar.getByLabel("Dinheiro contado na gaveta").fill(digitosDoValor(esperado) || "0");
  await fechar.getByRole("button", { name: "Fechar caixa" }).click();
  // Comanda aberta neste caixa bloqueia o fechamento: o alerta da tela explica o que fazer.
  await expect(page, "caixa anterior não fechou (comanda aberta?)").toHaveURL(/\/caixa\/fechamento\//);
}
