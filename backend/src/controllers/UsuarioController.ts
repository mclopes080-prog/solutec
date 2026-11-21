import type { Request, Response } from "express";
import { usuarioAutenticado } from "../middlewares/autenticar.js";
import type { CadastrarUsuarioService } from "../services/CadastrarUsuarioService.js";
import type { EditarUsuarioService } from "../services/EditarUsuarioService.js";
import type { ObterUsuarioService } from "../services/ObterUsuarioService.js";
import { cadastroUsuarioSchema, parseEditarUsuario } from "../validators/usuario.validator.js";

export class UsuarioController {
  constructor(
    private readonly cadastrarUsuario: CadastrarUsuarioService,
    private readonly obterUsuario: ObterUsuarioService,
    private readonly editarUsuario: EditarUsuarioService
  ) {}

  // Express 5 encaminha rejeições de handlers async ao errorHandler; não precisa de try/catch.
  cadastro = async (request: Request, response: Response): Promise<void> => {
    const input = cadastroUsuarioSchema.parse(request.body);
    const usuario = await this.cadastrarUsuario.executar(input);
    response.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso.",
      data: { usuario }
    });
  };

  me = async (request: Request, response: Response): Promise<void> => {
    const usuario = await this.obterUsuario.executar(usuarioAutenticado(request));
    response.status(200).json({ success: true, data: { usuario } });
  };

  atualizarMe = async (request: Request, response: Response): Promise<void> => {
    const input = parseEditarUsuario(request.body);
    const usuario = await this.editarUsuario.executar(usuarioAutenticado(request), input);
    response.status(200).json({ success: true, message: "Dados atualizados com sucesso.", data: { usuario } });
  };
}
