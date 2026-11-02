import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }
}
