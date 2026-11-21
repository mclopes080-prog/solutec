import bcrypt from "bcrypt";
import { env } from "../config/env.js";

/** Gera hash de senha (usado no cadastro e na edição). */
export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

/** Compara senha em texto com um hash (usado no login). Separado do hasher (ISP). */
export interface PasswordVerifier {
  comparar(password: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher, PasswordVerifier {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  comparar(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
