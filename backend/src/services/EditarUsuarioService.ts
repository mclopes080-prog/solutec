import type { UsuarioResposta } from "../entities/Usuario.js";
import { ConflictError, NotFoundError } from "../errors/AppError.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { EditarUsuarioInput } from "../validators/usuario.validator.js";
import type { PasswordHasher } from "./passwordHasher.js";

/** PUT /usuarios/me: edita o PRÓPRIO usuário. O id sempre vem do token, nunca do body/URL. */
export class EditarUsuarioService {
  constructor(
    private readonly usuarios: IUsuarioRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async executar(usuarioId: string, input: EditarUsuarioInput): Promise<UsuarioResposta> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundError("Usuário não encontrado.");

    const donoDoCpf = await this.usuarios.buscarPorCpf(input.cpf);
    if (donoDoCpf && donoDoCpf.id !== usuarioId) {
      throw new ConflictError("CPF já cadastrado.", { cpf: ["CPF já cadastrado."] });
    }

    usuario.alterarNome(input.nome);
    usuario.alterarCpf(input.cpf);
    usuario.alterarSenhaHash(await this.passwordHasher.hash(input.senha));

    const atualizado = await this.usuarios.atualizar(usuario);
    return atualizado.paraResposta();
  }
}
