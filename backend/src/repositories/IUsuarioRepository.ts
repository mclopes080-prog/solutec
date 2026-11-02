import { Usuario } from "../entities/Usuario.js";

export interface IUsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: string): Promise<Usuario | null>;
  criar(usuario: Usuario): Promise<Usuario>;
}
