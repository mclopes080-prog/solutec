import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from "../src/errors/AppError.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";

const executar = (erro: unknown) => {
  const json = vi.fn();
  const response = { status: vi.fn().mockReturnValue({ json }) } as unknown as Response;
  errorHandler(erro, {} as Request, response, vi.fn() as NextFunction);
  const status = vi.mocked(response.status).mock.calls[0]?.[0];
  return { status, corpo: json.mock.calls[0]?.[0] as { error: { code: string; message: string } } };
};

describe("errorHandler", () => {
  it.each([
    [new ValidationError("x"), 400, "VALIDATION_ERROR"],
    [new UnauthorizedError(), 401, "UNAUTHORIZED"],
    [new ForbiddenError(), 403, "FORBIDDEN"],
    [new NotFoundError(), 404, "NOT_FOUND"],
    [new ConflictError("x"), 409, "CONFLICT"],
    [new BusinessRuleError("x"), 422, "BUSINESS_RULE"]
  ])("traduz %s para %i", (erro, status, code) => {
    const resultado = executar(erro);
    expect(resultado.status).toBe(status);
    expect(resultado.corpo.error.code).toBe(code);
  });

  it("agrupa erros do Zod por campo", () => {
    const parse = z.object({ nome: z.string().min(2) }).safeParse({ nome: "" });
    const resultado = executar(parse.error);
    expect(resultado.status).toBe(400);
    expect(resultado.corpo.error).toMatchObject({ fields: { nome: expect.any(Array) } });
  });

  it("erro inesperado vira 500 genérico, sem vazar a mensagem interna", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const resultado = executar(new Error("SELECT * FROM usuarios falhou na tabela X"));
    expect(resultado.status).toBe(500);
    expect(JSON.stringify(resultado.corpo)).not.toContain("SELECT");
    log.mockRestore();
  });
});
