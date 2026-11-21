import { describe, expect, it } from "vitest";
import { loginSchema } from "../src/validators/auth.validator.js";

describe("schema de login", () => {
  it("normaliza o e-mail", () => {
    expect(loginSchema.parse({ email: " TESTE@Exemplo.com ", senha: "x" }).email).toBe("teste@exemplo.com");
  });

  it.each(["sem-arroba", "a@b", "a@b.c", "a b@exemplo.com"])("rejeita e-mail fora da regex: %s", (email) => {
    expect(loginSchema.safeParse({ email, senha: "x" }).success).toBe(false);
  });

  it("exige senha", () => {
    expect(loginSchema.safeParse({ email: "teste@exemplo.com", senha: "" }).success).toBe(false);
  });
});
