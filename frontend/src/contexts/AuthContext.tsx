import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api, registrarTratamento401 } from "../services/api";
import { authStorage } from "../services/authStorage";
import type { LoginResponse, UsuarioPublico, UsuarioResponse } from "../types/api";

export interface AuthContextValue {
  usuario: UsuarioPublico | null;
  autenticado: boolean;
  /** true enquanto a sessão salva está sendo validada no servidor. */
  verificando: boolean;
  login(email: string, senha: string): Promise<UsuarioPublico>;
  logout(): void;
  atualizarUsuario(usuario: UsuarioPublico): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(() => (authStorage.obterToken() ? authStorage.obterUsuario() : null));
  const [verificando, setVerificando] = useState<boolean>(() => authStorage.obterToken() !== null);

  const logout = useCallback(() => {
    authStorage.limpar();
    setUsuario(null);
  }, []);

  // 401 em qualquer requisição autenticada: sessão expirada → limpa e volta para o login.
  useEffect(
    () =>
      registrarTratamento401(() => {
        setUsuario(null);
        navigate("/login", { replace: true, state: { sessaoExpirada: true } });
      }),
    [navigate]
  );

  // Ao abrir o app com token salvo, confirma no servidor e atualiza os dados do usuário.
  useEffect(() => {
    if (!authStorage.obterToken()) return;
    let ativo = true;
    api
      .get<UsuarioResponse>("/usuarios/me")
      .then(({ data }) => {
        if (!ativo) return;
        authStorage.atualizarUsuario(data.data.usuario);
        setUsuario(data.data.usuario);
      })
      .catch(() => {
        /* 401 já tratado pelo interceptor; erro de rede mantém a sessão local */
      })
      .finally(() => ativo && setVerificando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email: email.trim(), senha });
    authStorage.salvar(data.data.token, data.data.usuario);
    setUsuario(data.data.usuario);
    return data.data.usuario;
  }, []);

  const atualizarUsuario = useCallback((novo: UsuarioPublico) => {
    authStorage.atualizarUsuario(novo);
    setUsuario(novo);
  }, []);

  const valor = useMemo<AuthContextValue>(
    () => ({ usuario, autenticado: usuario !== null, verificando, login, logout, atualizarUsuario }),
    [usuario, verificando, login, logout, atualizarUsuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return contexto;
}
