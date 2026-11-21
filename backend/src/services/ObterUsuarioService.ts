import type { UsuarioResposta } from "../entities/Usuario.js";
import { NotFoundError } from "../errors/AppError.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";

/** GET /usuarios/me: dados públicos do PRÓPRIO usuário. O id sempre vem do token. */
export class ObterUsuarioService {
  constructor(private readonly usuarios: IUsuarioRepository) {}

  async executar(usuarioId: string): Promise<UsuarioResposta> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundError("Usuário não encontrado.");
    return usuario.paraResposta();
  }
}
