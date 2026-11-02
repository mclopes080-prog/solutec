import { describe, expect, it } from "vitest";
import { isValidCpf, normalizeCpf } from "../src/validators/cpf.js";

describe("validação de CPF", () => {
  it("aceita CPF fictício válido com e sem pontuação", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("rejeita dígitos verificadores inválidos e sequências repetidas", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("normaliza a pontuação", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
  });
});
