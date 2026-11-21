import type { UsuarioResposta } from "../entities/Usuario.js";
import { UnauthorizedError } from "../errors/AppError.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { LoginInput } from "../validators/auth.validator.js";
import type { PasswordVerifier } from "./passwordHasher.js";
import type { ITokenService } from "./JwtTokenService.js";

export interface ResultadoLogin {
  token: string;
  usuario: UsuarioResposta;
}

/**
 * Hash bcrypt válido de uma senha qualquer. Quando o e-mail não existe, comparamos contra ele
 * para o tempo de resposta ser parecido com o de senha errada (evita enumerar e-mails).
 */
const HASH_FICTICIO = "$2b$12$Y4eKjFfSaK17MV8xdCAH6Os5Eka1WZ6MVZ4qMH6vJlyOYPWBnYgBq";

export const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

export class AutenticarUsuarioService {
  constructor(
    private readonly usuarios: IUsuarioRepository,
    private readonly verificador: PasswordVerifier,
    private readonly tokens: ITokenService
  ) {}

  async executar(input: LoginInput): Promise<ResultadoLogin> {
    const usuario = await this.usuarios.buscarPorEmail(input.email);

    if (!usuario) {
      await this.verificador.comparar(input.senha, HASH_FICTICIO);
      throw new UnauthorizedError(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    const senhaConfere = await usuario.verificarSenha(input.senha, this.verificador);
    if (!senhaConfere) throw new UnauthorizedError(MENSAGEM_CREDENCIAIS_INVALIDAS);

    const resposta = usuario.paraResposta();
    return { token: this.tokens.gerar(resposta.id), usuario: resposta };
  }
}
