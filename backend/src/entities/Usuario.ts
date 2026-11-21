import { ValidationError } from "../errors/AppError.js";
import type { PasswordVerifier } from "../services/passwordHasher.js";
import { isValidCpf, normalizeCpf } from "../validators/cpf.js";
import { EMAIL_REGEX } from "../validators/email.js";
import { Entidade, type DadosEntidade } from "./Entidade.js";

export interface UsuarioResposta {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  criadoEm: Date;
}

export interface UsuarioProps extends DadosEntidade {
  nome: string;
  email: string;
  cpf: string;
  senhaHash: string;
}

const HASH_BCRYPT = /^\$2[aby]\$\d{2}\$/;

export class Usuario extends Entidade<UsuarioResposta> {
  #nome: string;
  /** Imutável depois do cadastro: não existe método para trocar o e-mail. */
  readonly #email: string;
  #cpf: string;
  /** Nunca sai da entidade em respostas; só em `paraPersistencia()`. */
  #senhaHash: string;

  constructor(props: UsuarioProps) {
    super(props);
    const email = props.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) throw new ValidationError("E-mail inválido.");

    this.#nome = Usuario.#validarNome(props.nome);
    this.#email = email;
    this.#cpf = Usuario.#validarCpf(props.cpf);
    this.#senhaHash = Usuario.#validarHash(props.senhaHash);
  }

  get nome(): string { return this.#nome; }
  get email(): string { return this.#email; }
  get cpf(): string { return this.#cpf; }

  alterarNome(novoNome: string): void {
    this.#nome = Usuario.#validarNome(novoNome);
  }

  alterarCpf(novoCpf: string): void {
    this.#cpf = Usuario.#validarCpf(novoCpf);
  }

  alterarSenhaHash(novoHash: string): void {
    this.#senhaHash = Usuario.#validarHash(novoHash);
  }

  /** O hash nunca sai da entidade: quem quer conferir a senha entrega o verificador. */
  verificarSenha(senha: string, verificador: PasswordVerifier): Promise<boolean> {
    return verificador.comparar(senha, this.#senhaHash);
  }

  paraPersistencia(): { nome: string; email: string; cpf: string; senhaHash: string } {
    return { nome: this.#nome, email: this.#email, cpf: this.#cpf, senhaHash: this.#senhaHash };
  }

  paraResposta(): UsuarioResposta {
    const { id, criadoEm } = this.metadados();
    return { id, nome: this.#nome, email: this.#email, cpf: this.#cpf, criadoEm };
  }

  static #validarNome(valor: string): string {
    const nome = valor.trim();
    if (nome.length < 2 || nome.length > 120) throw new ValidationError("Nome inválido.", { nome: ["Informe o nome completo."] });
    return nome;
  }

  static #validarCpf(valor: string): string {
    const cpf = normalizeCpf(valor);
    if (!isValidCpf(cpf)) throw new ValidationError("CPF inválido.", { cpf: ["Informe um CPF válido."] });
    return cpf;
  }

  static #validarHash(hash: string): string {
    if (!HASH_BCRYPT.test(hash)) throw new ValidationError("Hash de senha inválido.");
    return hash;
  }
}
