import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "../src/errors/AppError.js";
import { JwtTokenService, expiracaoEmSegundos } from "../src/services/JwtTokenService.js";

const SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres";

describe("JwtTokenService", () => {
  const service = new JwtTokenService(SEGREDO, "2h");

  it("gera token HS256 com sub = id do usuário e expiração de 2h", () => {
    const token = service.gerar("usr_1");
    const decodificado = jwt.decode(token, { complete: true });

    expect(decodificado?.header.alg).toBe("HS256");
    expect(service.verificar(token)).toBe("usr_1");
    const payload = decodificado?.payload;
    if (typeof payload !== "object" || payload === null) throw new Error("payload ausente");
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(7200);
  });

  it("rejeita token assinado com outro segredo", () => {
    const falso = jwt.sign({}, "outro-segredo-qualquer-com-32-caracteres!", { subject: "usr_1" });
    expect(() => service.verificar(falso)).toThrow(UnauthorizedError);
  });

  it("rejeita token expirado", () => {
    const expirado = jwt.sign({ exp: Math.floor(Date.now() / 1000) - 10 }, SEGREDO, { subject: "usr_1" });
    expect(() => service.verificar(expirado)).toThrow(UnauthorizedError);
  });

  it("converte formatos de expiração", () => {
    expect(expiracaoEmSegundos("2h")).toBe(7200);
    expect(expiracaoEmSegundos("30m")).toBe(1800);
    expect(expiracaoEmSegundos("3600")).toBe(3600);
  });
});
