import type { ParametrosPaginacao } from "../types/paginacao.js";

/** Restringe a consulta aos registros de um dono (endereços e pedidos). */
export interface Escopo {
  usuarioId: string;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
}

/** Contrato genérico de persistência. Os serviços dependem disto, nunca do Prisma. */
export interface IRepositorio<T, TId = string> {
  buscarPorId(id: TId, escopo?: Escopo): Promise<T | null>;
  listar(paginacao: ParametrosPaginacao, escopo?: Escopo): Promise<Pagina<T>>;
  criar(entidade: T): Promise<T>;
  atualizar(entidade: T): Promise<T>;
  remover(id: TId): Promise<void>;
}

export const skipTake = ({ page, limit }: ParametrosPaginacao): { skip: number; take: number } => ({
  skip: (page - 1) * limit,
  take: limit
});

export const exigirId = (id: string | undefined, recurso: string): string => {
  if (!id) throw new Error(`${recurso} sem id não pode ser atualizado(a).`);
  return id;
};
