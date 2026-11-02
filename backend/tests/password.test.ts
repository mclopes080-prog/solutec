import { describe, expect, it } from "vitest";
import { getPasswordCriteria, isStrongPassword } from "../src/validators/password.js";

describe("força da senha", () => {
  it("aceita senha que cumpre todos os critérios", () => {
    expect(isStrongPassword("Camera@2026")).toBe(true);
  });

  it.each(["Curta1!", "semsimbolo1A", "SEMMINUSCULA1!", "SemNumero!", "semespecial1A"])(
    "rejeita senha fraca: %s",
    (senha) => expect(isStrongPassword(senha)).toBe(false)
  );

  it("informa cada critério separadamente", () => {
    expect(getPasswordCriteria("abc")).toEqual({
      length: false, uppercase: false, lowercase: true, number: false, special: false
    });
  });
});
