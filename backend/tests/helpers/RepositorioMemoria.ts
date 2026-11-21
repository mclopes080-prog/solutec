import type { Entidade } from "../../src/entities/Entidade.js";
import type { Escopo, IRepositorio, Pagina } from "../../src/repositories/IRepositorio.js";
import type { ParametrosPaginacao } from "../../src/types/paginacao.js";

export interface ConfigMemoria<T> {
  /** Recria a entidade com id e datas (simula o que o banco devolve). */
  persistir: (entidade: T, id: string, datas: { criadoEm: Date; atualizadoEm: Date }) => T;
  /** Para recursos com dono: de quem é a entidade. */
  dono?: (entidade: T) => string;
}

/**
 * Implementação genérica de IRepositorio<T> em memória. Serve para testar serviços sem banco
 * e prova que os serviços dependem só da interface (DIP).
 */
export class RepositorioMemoria<T extends Entidade<unknown>> implements IRepositorio<T> {
  readonly itens = new Map<string, T>();
  #sequencia = 0;

  constructor(private readonly config: ConfigMemoria<T>) {}

  #visivel(entidade: T, escopo?: Escopo): boolean {
    return !escopo || !this.config.dono || this.config.dono(entidade) === escopo.usuarioId;
  }

  async buscarPorId(id: string, escopo?: Escopo): Promise<T | null> {
    const entidade = this.itens.get(id);
    return entidade && this.#visivel(entidade, escopo) ? entidade : null;
  }

  async listar({ page, limit }: ParametrosPaginacao, escopo?: Escopo): Promise<Pagina<T>> {
    const visiveis = [...this.itens.values()].filter((e) => this.#visivel(e, escopo));
    return { itens: visiveis.slice((page - 1) * limit, page * limit), total: visiveis.length };
  }

  async criar(entidade: T): Promise<T> {
    this.#sequencia += 1;
    const id = `id_${this.#sequencia}`;
    const agora = new Date("2026-11-20T12:00:00Z");
    const salva = this.config.persistir(entidade, id, { criadoEm: agora, atualizadoEm: agora });
    this.itens.set(id, salva);
    return salva;
  }

  async atualizar(entidade: T): Promise<T> {
    if (!entidade.id || !this.itens.has(entidade.id)) throw new Error("Registro inexistente.");
    this.itens.set(entidade.id, entidade);
    return entidade;
  }

  async remover(id: string): Promise<void> {
    this.itens.delete(id);
  }

  /** Atalho para preparar dados de teste. */
  async semear(...entidades: T[]): Promise<T[]> {
    return Promise.all(entidades.map((e) => this.criar(e)));
  }
}
