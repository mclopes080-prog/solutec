/** Parâmetros de listagem vindos de `?page=export interface ParametrosPaginacao {limit=`. */
export interface ParametrosPaginacao {
  page: number;
  limit: number;
}

export interface MetaPaginacao extends ParametrosPaginacao {
  total: number;
  totalPages: number;
}

/** Resposta padrão das listagens: `{ data, meta }`. */
export interface Paginado<T> {
  data: T[];
  meta: MetaPaginacao;
}

export const montarMeta = ({ page, limit }: ParametrosPaginacao, total: number): MetaPaginacao => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit))
});
