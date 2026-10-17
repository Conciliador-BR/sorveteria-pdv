import { describe, expect, it } from "vitest";
import { consultaDosFiltros, filtrosEfetivos, hojeNaLoja, lerFiltros, linhaCsv } from "./filtros";

describe("lerFiltros", () => {
  it("ignora valores inválidos em vez de quebrar a página", () => {
    expect(lerFiltros({ de: "2026-10-01", ate: "ontem", forma: "cheque", status: "concluida" })).toEqual({
      de: "2026-10-01",
      ate: undefined,
      forma: undefined,
      status: "concluida",
      funcionario: undefined,
      bandeira: undefined,
    });
  });
});

describe("hojeNaLoja", () => {
  it("usa o dia de São Paulo, não o UTC", () => {
    expect(hojeNaLoja(new Date("2026-10-17T02:30:00Z"))).toBe("2026-10-16");
  });
});

describe("linhaCsv", () => {
  it("separa por ponto e vírgula e escapa aspas", () => {
    expect(linhaCsv(["Picolé \"limão\"", 12, null])).toBe('"Picolé ""limão""";"12";""');
  });
});

describe("filtrosEfetivos", () => {
  const outro = "6f1c2a8e-3b5d-4c7e-9a1f-2b3c4d5e6f70";
  const eu = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

  it("sem período usa hoje na loja", () => {
    expect(filtrosEfetivos({}, { veTodas: true, funcionarioId: eu }, "2026-10-17")).toMatchObject({ de: "2026-10-17", ate: "2026-10-17" });
  });

  it("mantém o período escolhido, mesmo só com uma ponta", () => {
    expect(filtrosEfetivos({ de: "2026-10-01" }, { veTodas: true, funcionarioId: eu }, "2026-10-17")).toMatchObject({ de: "2026-10-01", ate: undefined });
  });

  it("sem permissão de histórico, força as próprias vendas", () => {
    expect(filtrosEfetivos({ funcionario: outro }, { veTodas: false, funcionarioId: eu }).funcionario).toBe(eu);
  });

  it("com permissão, respeita o funcionário escolhido ou todos", () => {
    expect(filtrosEfetivos({ funcionario: outro }, { veTodas: true, funcionarioId: eu }).funcionario).toBe(outro);
    expect(filtrosEfetivos({}, { veTodas: true, funcionarioId: eu }).funcionario).toBeUndefined();
  });
});

describe("consultaDosFiltros", () => {
  it("leva só os filtros preenchidos", () => {
    expect(consultaDosFiltros({ de: "2026-10-01", ate: undefined, forma: "pix" })).toBe("de=2026-10-01&forma=pix");
  });
});
