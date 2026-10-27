// Portão focado em promessas (async) com tipos; roda separado com `pnpm lint:typed` (base: vibe-coding-toolkit).
import defaultConfig from "./eslint.config.mjs";

const config = [
  ...defaultConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Medido em 27/10/2026: 1 violação corrigida, então as duas regras entram como erro.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];

export default config;
