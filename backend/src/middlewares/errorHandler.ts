import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

/** express.json() sinaliza JSON malformado com `type = "entity.parse.failed"`. */
const isJsonMalformado = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    const fields = error.issues.reduce<Record<string, string[]>>((accumulator, issue) => {
      const field = String(issue.path[0] ?? "body");
      const mensagens = accumulator[field] ?? [];
      if (!mensagens.includes(issue.message)) accumulator[field] = [...mensagens, issue.message];
      return accumulator;
    }, {});

    response.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Verifique os dados informados.", fields }
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {})
      }
    });
    return;
  }

  // Rede de segurança para corridas entre a checagem do serviço e o banco.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapa: Record<string, { status: number; code: string; message: string }> = {
      P2002: { status: 409, code: "CONFLICT", message: "Registro duplicado." },
      P2003: { status: 409, code: "CONFLICT", message: "Operação bloqueada por registros relacionados." },
      P2025: { status: 404, code: "NOT_FOUND", message: "Recurso não encontrado." }
    };
    const traduzido = mapa[error.code];
    if (traduzido) {
      response.status(traduzido.status).json({ success: false, error: { code: traduzido.code, message: traduzido.message } });
      return;
    }
  }

  if (isJsonMalformado(error)) {
    response.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "JSON malformado." }
    });
    return;
  }

  console.error("Erro interno não tratado:", error);
  response.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Não foi possível concluir a operação." }
  });
};
