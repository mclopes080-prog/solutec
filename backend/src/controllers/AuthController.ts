import type { Request, Response } from "express";
import type { AutenticarUsuarioService } from "../services/AutenticarUsuarioService.js";
import { loginSchema } from "../validators/auth.validator.js";

export class AuthController {
  constructor(private readonly autenticarUsuario: AutenticarUsuarioService) {}

  login = async (request: Request, response: Response): Promise<void> => {
    const input = loginSchema.parse(request.body);
    const resultado = await this.autenticarUsuario.executar(input);
    response.status(200).json({ success: true, message: "Login realizado com sucesso.", data: resultado });
  };
}
