import type { NextFunction, Request, Response } from "express";
import { CadastrarUsuarioService } from "../services/CadastrarUsuarioService.js";
import { cadastroUsuarioSchema } from "../validators/usuario.validator.js";

export class UsuarioController {
  constructor(private readonly cadastrarUsuario: CadastrarUsuarioService) {}

  cadastro = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = cadastroUsuarioSchema.parse(request.body);
      const usuario = await this.cadastrarUsuario.executar(input);
      response.status(201).json({
        success: true,
        message: "Cadastro realizado com sucesso.",
        data: { usuario }
      });
    } catch (error) {
      next(error);
    }
  };
}
