import type { Request, RequestHandler } from "express";
import { UnauthorizedError } from "../errors/AppError.js";
import type { ITokenService } from "../services/JwtTokenService.js";

/** Cria o middleware que exige `Authorization: Bearer <token>` e injeta `req.usuarioId`. */
export const criarMiddlewareAutenticar = (tokens: ITokenService): RequestHandler =>
  (request, _response, next) => {
    const header = request.headers.authorization;
    const [esquema, token] = header?.split(" ") ?? [];

    if (esquema !== "Bearer" || !token) {
      next(new UnauthorizedError("Token de acesso ausente."));
      return;
    }

    try {
      request.usuarioId = tokens.verificar(token);
      next();
    } catch (error) {
      next(error);
    }
  };

/** Lê o id injetado pelo middleware; falha com 401 se a rota não estiver protegida. */
export const usuarioAutenticado = (request: Request): string => {
  if (!request.usuarioId) throw new UnauthorizedError();
  return request.usuarioId;
};
