import type { UsuarioPublico } from "../types/api";

const CHAVE_TOKEN = "solutec.token";
const CHAVE_USUARIO = "solutec.usuario";

/** O localStorage pode lançar exceção (modo privado, bloqueio); a sessão degrada sem quebrar a tela. */
const ler = (chave: string): string | null => {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
};

const isUsuarioPublico = (valor: unknown): valor is UsuarioPublico =>
  typeof valor === "object" &&
  valor !== null &&
  "id" in valor &&
  "nome" in valor &&
  "email" in valor &&
  typeof valor.id === "string" &&
  typeof valor.nome === "string" &&
  typeof valor.email === "string";

/** Persistência da sessão (token JWT + dados públicos do usuário) no localStorage. */
export const authStorage = {
  obterToken(): string | null {
    return ler(CHAVE_TOKEN);
  },

  obterUsuario(): UsuarioPublico | null {
    const bruto = ler(CHAVE_USUARIO);
    if (!bruto) return null;
    try {
      const valor: unknown = JSON.parse(bruto);
      return isUsuarioPublico(valor) ? valor : null;
    } catch {
      return null;
    }
  },

  salvar(token: string, usuario: UsuarioPublico): void {
    try {
      window.localStorage.setItem(CHAVE_TOKEN, token);
      window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      /* sem armazenamento disponível: a sessão vale só enquanto a aba estiver aberta */
    }
  },

  atualizarUsuario(usuario: UsuarioPublico): void {
    try {
      window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      /* ignora */
    }
  },

  limpar(): void {
    try {
      window.localStorage.removeItem(CHAVE_TOKEN);
      window.localStorage.removeItem(CHAVE_USUARIO);
    } catch {
      /* ignora */
    }
  }
};
