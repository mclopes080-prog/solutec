import { useMemo } from "react";
import { api } from "../services/api";
import type { ApiResponse } from "../types/api";

export interface OperacoesCrud<T, TCriar, TAtualizar = TCriar> {
  buscar(id: string): Promise<T>;
  criar(payload: TCriar): Promise<T>;
  atualizar(id: string, payload: TAtualizar): Promise<T>;
  remover(id: string): Promise<void>;
}

/** Operações REST genéricas de um recurso (`/recurso`, `/recurso/:id`). */
export function useCrud<T, TCriar, TAtualizar = TCriar>(endpoint: string): OperacoesCrud<T, TCriar, TAtualizar> {
  return useMemo(
    () => ({
      async buscar(id) {
        const { data } = await api.get<ApiResponse<T>>(`${endpoint}/${encodeURIComponent(id)}`);
        return data.data;
      },
      async criar(payload) {
        const { data } = await api.post<ApiResponse<T>>(endpoint, payload);
        return data.data;
      },
      async atualizar(id, payload) {
        const { data } = await api.put<ApiResponse<T>>(`${endpoint}/${encodeURIComponent(id)}`, payload);
        return data.data;
      },
      async remover(id) {
        await api.delete(`${endpoint}/${encodeURIComponent(id)}`);
      }
    }),
    [endpoint]
  );
}
