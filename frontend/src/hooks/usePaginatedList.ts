import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { MetaPaginacao, Paginado } from "../types/api";
import { extrairErroApi } from "../utils/apiErrors";

export interface ListaPaginada<T> {
  itens: T[];
  meta: MetaPaginacao;
  page: number;
  setPage: (page: number) => void;
  carregando: boolean;
  erro: string;
  recarregar: () => void;
}

/** Busca genérica de qualquer listagem `{ data, meta }` da API, com paginação por `?page&limit`. */
export function usePaginatedList<T>(endpoint: string, limit = 10): ListaPaginada<T> {
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState<T[]>([]);
  const [meta, setMeta] = useState<MetaPaginacao>({ page: 1, limit, total: 0, totalPages: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    api
      .get<Paginado<T>>(endpoint, { params: { page, limit } })
      .then(({ data }) => {
        if (!ativo) return;
        // Se a página ficou vazia (ex.: excluiu o último item), volta uma.
        if (data.data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setItens(data.data);
        setMeta(data.meta);
      })
      .catch((error: unknown) => ativo && setErro(extrairErroApi(error).mensagem))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [endpoint, page, limit, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { itens, meta, page, setPage, carregando, erro, recarregar };
}
