import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Mesmo carregamento de `.env*` do Next: os testes decidem o que pular pelas variáveis presentes.
loadEnvConfig(process.cwd());

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
// Navegador já instalado fora do cache do Playwright (ex.: /opt/pw-browsers/chromium na nuvem).
const executablePath = process.env.PW_CHROMIUM_PATH;
const chromium = { ...devices["Desktop Chrome"], launchOptions: executablePath ? { executablePath } : {} };

export default defineConfig({
  testDir: "e2e",
  // Os fluxos mexem no mesmo caixa do dono: um worker, sem paralelismo.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    // Tablet do balcão (768 px): alvo principal, roda tudo.
    { name: "tablet", use: { ...chromium, viewport: { width: 768, height: 1024 } } },
    // Desktop (1280 px) só nas telas sem efeito no banco: o fluxo de operação não roda duas vezes.
    { name: "desktop", testMatch: ["publico.spec.ts", "permissoes.spec.ts"], use: { ...chromium, viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
