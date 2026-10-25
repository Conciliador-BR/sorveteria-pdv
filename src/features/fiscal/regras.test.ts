import { describe, expect, it } from "vitest";
import { anoMesNoFuso, cnpjValido, digitoChave, formatarChave, formatarCnpj, limparCnpj, montarChaveAcesso } from "./regras";

describe("cnpjValido", () => {
  it("aceita CNPJ numérico com ou sem máscara", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
  });

  it("aceita o CNPJ alfanumérico do exemplo da Receita Federal", () => {
    expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
    expect(cnpjValido("12abc34501de35")).toBe(true);
  });

  it("recusa dígito errado, tamanho errado, letra no dígito e caracteres repetidos", () => {
    expect(cnpjValido("11.222.333/0001-82")).toBe(false);
    expect(cnpjValido("12.ABC.345/01DE-36")).toBe(false);
    expect(cnpjValido("1122233300018")).toBe(false);
    expect(cnpjValido("12ABC34501DEA5")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
  });
});

describe("formatarCnpj", () => {
  it("limpa e põe a máscara", () => {
    expect(limparCnpj(" 12.abc.345/01de-35 ")).toBe("12ABC34501DE35");
    expect(formatarCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatarCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
  });
});

describe("chave de acesso", () => {
  it("monta 44 caracteres na ordem oficial, com modelo 65 e dígito verificador", () => {
    const chave = montarChaveAcesso({ uf: "ES", ano: 2026, mes: 10, cnpj: "11.222.333/0001-81", serie: 1, numero: 42, codigo: 12345678 });
    expect(chave).toHaveLength(44);
    expect(chave.slice(0, 43)).toBe("3226101122233300018165001000000042112345678");
    expect(chave.at(-1)).toBe(String(digitoChave(chave.slice(0, 43))));
  });

  it("calcula o dígito por módulo 11 com pesos 2 a 9", () => {
    // Soma 1×2 + 2×3 = 8; 11 − 8 = 3.
    expect(digitoChave("21")).toBe(3);
    // Resto 0 ou 1 vira 0: 6×2 = 12, resto 1.
    expect(digitoChave("6")).toBe(0);
  });

  it("aceita CNPJ alfanumérico dentro da chave", () => {
    const chave = montarChaveAcesso({ uf: "SP", ano: 2026, mes: 1, cnpj: "12ABC34501DE35", serie: 2, numero: 1, codigo: 1 });
    expect(chave).toMatch(/^[0-9]{6}[0-9A-Z]{12}[0-9]{26}$/);
  });

  it("agrupa de 4 em 4 para o DANFE", () => {
    expect(formatarChave("123456789")).toBe("1234 5678 9");
  });
});

describe("anoMesNoFuso", () => {
  it("usa o mês de São Paulo, não o de UTC", () => {
    // 1º/11 às 01:30 em UTC ainda é 31/10 em São Paulo.
    expect(anoMesNoFuso(new Date("2026-11-01T01:30:00Z"), "America/Sao_Paulo")).toEqual({ ano: 2026, mes: 10 });
  });
});
