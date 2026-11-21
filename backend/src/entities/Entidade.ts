export interface DadosEntidade {
  id?: string | undefined;
  criadoEm?: Date | undefined;
  atualizadoEm?: Date | undefined;
}

export interface MetadadosPersistidos {
  id: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Base de todas as entidades de domínio: guarda identidade e datas (encapsuladas em `#campos`)
 * e obriga cada subclasse a definir sua própria representação pública via `paraResposta()`.
 */
export abstract class Entidade<TResposta> {
  readonly #id: string | undefined;
  readonly #criadoEm: Date | undefined;
  readonly #atualizadoEm: Date | undefined;

  protected constructor(dados: DadosEntidade) {
    this.#id = dados.id;
    this.#criadoEm = dados.criadoEm;
    this.#atualizadoEm = dados.atualizadoEm;
  }

  get id(): string | undefined {
    return this.#id;
  }

  get criadoEm(): Date | undefined {
    return this.#criadoEm;
  }

  get atualizadoEm(): Date | undefined {
    return this.#atualizadoEm;
  }

  get persistida(): boolean {
    return this.#id !== undefined;
  }

  /** Metadados obrigatórios para montar respostas; falha se a entidade ainda não foi salva. */
  protected metadados(): MetadadosPersistidos {
    if (!this.#id || !this.#criadoEm || !this.#atualizadoEm) {
      throw new Error(`${this.constructor.name} ainda não foi persistido(a).`);
    }
    return { id: this.#id, criadoEm: this.#criadoEm, atualizadoEm: this.#atualizadoEm };
  }

  abstract paraResposta(): TResposta;
}
