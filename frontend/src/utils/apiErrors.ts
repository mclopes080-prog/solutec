import axios from "axios";
import type { ApiErrorResponse } from "../types/api";

export interface ErroApi {
  status: number | null;
  mensagem: string;
  campos: Record<string, string>;
}

export const MENSAGEM_SEM_CONEXAO = "Não foi possível conectar ao servidor.";

/** Converte qualquer erro do Axios numa estrutura simples, com mensagens amigáveis. */
export function extrairErroApi(error: unknown, mensagensPorStatus: Partial<Record<number, string>> = {}): ErroApi {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return { status: null, mensagem: "Ocorreu um erro inesperado.", campos: {} };
  }
  if (!error.response) {
    return { status: null, mensagem: MENSAGEM_SEM_CONEXAO, campos: {} };
  }

  const { status, data } = error.response;
  const campos: Record<string, string> = {};
  for (const [campo, mensagens] of Object.entries(data?.error?.fields ?? {})) {
    const primeira = mensagens?.[0];
    if (primeira) campos[campo] = primeira;
  }

  return {
    status,
    mensagem: mensagensPorStatus[status] ?? data?.error?.message ?? "Não foi possível concluir a operação.",
    campos
  };
}

export type ErrosFormulario<T> = Partial<Record<keyof T | "form", string>>;

/** Erros por campo vão para o campo; o resto vira mensagem geral do formulário. */
export function errosDoFormulario<T>(erro: ErroApi, camposConhecidos: readonly (keyof T)[]): ErrosFormulario<T> {
  const resultado: ErrosFormulario<T> = {};
  const desconhecidos: string[] = [];
  for (const [campo, mensagem] of Object.entries(erro.campos)) {
    const conhecido = camposConhecidos.find((c) => c === campo);
    if (conhecido !== undefined) {
      resultado[conhecido] = mensagem;
    } else desconhecidos.push(mensagem);
  }
  const algumCampo = Object.keys(resultado).length > 0;
  if (!algumCampo || desconhecidos.length) resultado.form = desconhecidos[0] ?? erro.mensagem;
  return resultado;
}
