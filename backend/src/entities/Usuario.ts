import { ValidationError } from "../errors/AppError.js";
import { isValidCpf, normalizeCpf } from "../validators/cpf.js";

export interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  cpf: string;
  senhaHash: string;
  criadoEm?: Date;
}

export class Usuario {
  readonly #id: string | undefined;
  #nome: string;
  readonly #email: string;
  readonly #cpf: string;
  #senhaHash: string;
  readonly #criadoEm: Date | undefined;

  constructor(props: UsuarioProps) {
    const nome = props.nome.trim();
    const email = props.email.trim().toLowerCase();
    const cpf = normalizeCpf(props.cpf);

    if (nome.length < 2 || nome.length > 120) throw new ValidationError("Nome inválido.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError("E-mail inválido.");
    if (!isValidCpf(cpf)) throw new ValidationError("CPF inválido.");
    if (!/^\$2[aby]\$\d{2}\$/.test(props.senhaHash)) throw new ValidationError("Hash de senha inválido.");

    this.#id = props.id;
    this.#nome = nome;
    this.#email = email;
    this.#cpf = cpf;
    this.#senhaHash = props.senhaHash;
    this.#criadoEm = props.criadoEm;
  }

  get id(): string | undefined { return this.#id; }
  get nome(): string { return this.#nome; }
  get email(): string { return this.#email; }
  get cpf(): string { return this.#cpf; }
  get criadoEm(): Date | undefined { return this.#criadoEm; }

  alterarNome(novoNome: string): void {
    const nome = novoNome.trim();
    if (nome.length < 2 || nome.length > 120) throw new ValidationError("Nome inválido.");
    this.#nome = nome;
  }

  alterarSenhaHash(novoHash: string): void {
    if (!/^\$2[aby]\$\d{2}\$/.test(novoHash)) throw new ValidationError("Hash de senha inválido.");
    this.#senhaHash = novoHash;
  }

  paraPersistencia(): { nome: string; email: string; cpf: string; senhaHash: string } {
    return { nome: this.#nome, email: this.#email, cpf: this.#cpf, senhaHash: this.#senhaHash };
  }

  paraResposta(): { id: string; nome: string; email: string; cpf: string; criadoEm: Date } {
    if (!this.#id || !this.#criadoEm) throw new Error("Usuário ainda não foi persistido.");
    return { id: this.#id, nome: this.#nome, email: this.#email, cpf: this.#cpf, criadoEm: this.#criadoEm };
  }
}
