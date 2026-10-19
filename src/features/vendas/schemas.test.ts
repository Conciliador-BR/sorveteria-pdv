import { describe, expect, it } from "vitest";
import { itensSchema } from "./schemas";

const produtoId = "6f1c2a4e-8b3d-4c5e-9f7a-1b2c3d4e5f60";

describe("itensSchema com valor da balança", () => {
  it("aceita valor inteiro de 1 centavo até R$ 100.000,00", () => {
    expect(itensSchema.safeParse([{ produtoId, valorCentavos: 1 }]).success).toBe(true);
    expect(itensSchema.safeParse([{ produtoId, valorCentavos: 10_000_000 }]).success).toBe(true);
  });

  it("recusa valor zero, quebrado ou acima do limite", () => {
    for (const valorCentavos of [0, 12.5, 10_000_001]) {
      expect(itensSchema.safeParse([{ produtoId, valorCentavos }]).success).toBe(false);
    }
  });
});
