import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/AppError.js";

export interface ITokenService {
  gerar(usuarioId: string): string;
  /** Devolve o id do usuário (claim `sub`) ou lança UnauthorizedError. */
  verificar(token: string): string;
}

const UNIDADES_EM_SEGUNDOS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

/** Converte "2h", "30m", "7d" ou "3600" em segundos. */
export const expiracaoEmSegundos = (valor: string): number => {
  const match = /^(\d+)([smhd]?)$/.exec(valor);
  if (!match) throw new Error(`Expiração de token inválida: ${valor}`);
  const quantidade = Number(match[1]);
  const unidade = UNIDADES_EM_SEGUNDOS[match[2] || "s"] ?? 1;
  return quantidade * unidade;
};

export class JwtTokenService implements ITokenService {
  readonly #segredo: string;
  readonly #expiraEmSegundos: number;

  constructor(segredo: string, expiraEm: string) {
    this.#segredo = segredo;
    this.#expiraEmSegundos = expiracaoEmSegundos(expiraEm);
  }

  gerar(usuarioId: string): string {
    return jwt.sign({}, this.#segredo, {
      algorithm: "HS256",
      subject: usuarioId,
      expiresIn: this.#expiraEmSegundos
    });
  }

  verificar(token: string): string {
    try {
      const payload = jwt.verify(token, this.#segredo, { algorithms: ["HS256"] });
      if (typeof payload === "string" || typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new UnauthorizedError("Token inválido.");
      }
      return payload.sub;
    } catch {
      throw new UnauthorizedError("Sessão inválida ou expirada.");
    }
  }
}
