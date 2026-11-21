import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../src/errors/AppError.js";
import { criarMiddlewareAutenticar } from "../src/middlewares/autenticar.js";
import type { ITokenService } from "../src/services/JwtTokenService.js";

const tokens: ITokenService = {
  gerar: vi.fn(),
  verificar: vi.fn((token: string) => {
    if (token !== "valido") throw new UnauthorizedError("Sessão inválida ou expirada.");
    return "usr_1";
  })
};
const autenticar = criarMiddlewareAutenticar(tokens);

const executar = (authorization?: string): { request: Request; next: NextFunction } => {
  const request = { headers: authorization ? { authorization } : {} } as Request;
  const next = vi.fn();
  autenticar(request, {} as Response, next);
  return { request, next };
};

describe("middleware autenticar", () => {
  it("injeta req.usuarioId com Bearer válido", () => {
    const { request, next } = executar("Bearer valido");
    expect(request.usuarioId).toBe("usr_1");
    expect(next).toHaveBeenCalledWith();
  });

  it.each([undefined, "valido", "Basic valido", "Bearer "])("rejeita cabeçalho ausente/malformado: %s", (header) => {
    const { next } = executar(header);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("rejeita token inválido", () => {
    const { request, next } = executar("Bearer adulterado");
    expect(request.usuarioId).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
