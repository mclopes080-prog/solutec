import { describe, expect, it } from "vitest";
import { cadastroUsuarioSchema } from "../src/validators/usuario.validator.js";

describe("schema de cadastro", () => {
  const valido = { nome: "Pessoa de Teste", email: "TESTE@EXEMPLO.COM", cpf: "529.982.247-25", senha: "Camera@2026" };

  it("normaliza e-mail e CPF", () => {
    expect(cadastroUsuarioSchema.parse(valido)).toMatchObject({ email: "teste@exemplo.com", cpf: "52998224725" });
  });

  it("rejeita campos ausentes", () => {
    expect(cadastroUsuarioSchema.safeParse({} ).success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    expect(cadastroUsuarioSchema.safeParse({ ...valido, email: "invalido" }).success).toBe(false);
  });
});
