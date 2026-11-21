import axios from "axios";
import { authStorage } from "./authStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" }
});

/** Injeta o JWT salvo em toda requisição. */
api.interceptors.request.use((config) => {
  const token = authStorage.obterToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

/**
 * Registra o tratamento de 401: limpa a sessão e chama `aoExpirar` (o AuthProvider redireciona
 * para /login). O 401 do próprio login é ignorado aqui para a tela mostrar "E-mail ou senha incorretos.".
 */
export const registrarTratamento401 = (aoExpirar: () => void): (() => void) => {
  const id = api.interceptors.response.use(
    (resposta) => resposta,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
        authStorage.limpar();
        aoExpirar();
      }
      return Promise.reject(error);
    }
  );
  return () => api.interceptors.response.eject(id);
};
