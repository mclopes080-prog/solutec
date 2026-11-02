import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    const fields = error.issues.reduce<Record<string, string[]>>((accumulator, issue) => {
      const field = String(issue.path[0] ?? "body");
      accumulator[field] = [...(accumulator[field] ?? []), issue.message];
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

  console.error("Erro interno não tratado:", error);
  response.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Não foi possível concluir a operação." }
  });
};
