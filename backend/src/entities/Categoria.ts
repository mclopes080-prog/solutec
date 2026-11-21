import { Entidade, type DadosEntidade } from "./Entidade.js";
import { textoObrigatorio, textoOpcional } from "./validacoes.js";

export interface CategoriaProps extends DadosEntidade {
  nome: string;
  descricao: string | null;
}

/** Campos editáveis pelo cliente (DTO de criação e de edição). */
export type DadosCategoria = Pick<CategoriaProps, "nome" | "descricao">;

export interface CategoriaResposta {
  id: string;
  nome: string;
  descricao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class Categoria extends Entidade<CategoriaResposta> {
  #nome!: string;
  #descricao!: string | null;

  constructor(props: CategoriaProps) {
    super(props);
    this.atualizar(props);
  }

  get nome(): string {
    return this.#nome;
  }

  get descricao(): string | null {
    return this.#descricao;
  }

  /** Única porta de alteração: valida tudo antes de trocar o estado. */
  atualizar(dados: DadosCategoria): void {
    const nome = textoObrigatorio(dados.nome, "nome", "Nome", 2, 80);
    const descricao = textoOpcional(dados.descricao, "descricao", "Descrição", 255);
    this.#nome = nome;
    this.#descricao = descricao;
  }

  paraPersistencia(): DadosCategoria {
    return { nome: this.#nome, descricao: this.#descricao };
  }

  paraResposta(): CategoriaResposta {
    return { ...this.metadados(), nome: this.#nome, descricao: this.#descricao };
  }
}
