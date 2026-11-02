import { Prisma } from "@prisma/client";
import { Usuario } from "../entities/Usuario.js";
import { ConflictError } from "../errors/AppError.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { CadastroUsuarioInput } from "../validators/usuario.validator.js";
import type { PasswordHasher } from "./passwordHasher.js";

export class CadastrarUsuarioService {
  constructor(
    private readonly usuarios: IUsuarioRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async executar(input: CadastroUsuarioInput): Promise<ReturnType<Usuario["paraResposta"]>> {
    const [emailExistente, cpfExistente] = await Promise.all([
      this.usuarios.buscarPorEmail(input.email),
      this.usuarios.buscarPorCpf(input.cpf)
    ]);

    if (emailExistente) {
      throw new ConflictError("E-mail já cadastrado.", { email: ["E-mail já cadastrado."] });
    }
    if (cpfExistente) {
      throw new ConflictError("CPF já cadastrado.", { cpf: ["CPF já cadastrado."] });
    }

    const senhaHash = await this.passwordHasher.hash(input.senha);
    const usuario = new Usuario({ ...input, senhaHash });

    try {
      const criado = await this.usuarios.criar(usuario);
      return criado.paraResposta();
    } catch (error) {
      // A constraint única também protege contra duas requisições simultâneas.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("E-mail ou CPF já cadastrado.");
      }
      throw error;
    }
  }
}
