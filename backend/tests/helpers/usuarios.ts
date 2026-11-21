import { vi } from "vitest";
import { Usuario } from "../../src/entities/Usuario.js";
import type { IUsuarioRepository } from "../../src/repositories/IUsuarioRepository.js";

export const HASH_TESTE = "$2b$12$123456789012345678901u12345678901234567890123456789012";

export const usuarioPersistido = (sobrescrever: Partial<{ id: string; email: string; cpf: string }> = {}): Usuario =>
  new Usuario({
    id: sobrescrever.id ?? "usr_1",
    nome: "Pessoa de Teste",
    email: sobrescrever.email ?? "teste@exemplo.com",
    cpf: sobrescrever.cpf ?? "52998224725",
    senhaHash: HASH_TESTE,
    criadoEm: new Date("2026-01-01"),
    atualizadoEm: new Date("2026-01-01")
  });

/** Repositório de usuários com todos os métodos mockados (sem banco). */
export const repositorioUsuariosMock = (sobrescrever: Partial<IUsuarioRepository> = {}): IUsuarioRepository => ({
  buscarPorId: vi.fn().mockResolvedValue(null),
  buscarPorEmail: vi.fn().mockResolvedValue(null),
  buscarPorCpf: vi.fn().mockResolvedValue(null),
  criar: vi.fn(),
  atualizar: vi.fn(async (usuario: Usuario) => usuario),
  ...sobrescrever
});
