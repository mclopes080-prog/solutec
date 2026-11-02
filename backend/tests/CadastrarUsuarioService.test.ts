import { describe, expect, it, vi } from "vitest";
import { Usuario } from "../src/entities/Usuario.js";
import { ConflictError } from "../src/errors/AppError.js";
import type { IUsuarioRepository } from "../src/repositories/IUsuarioRepository.js";
import { CadastrarUsuarioService } from "../src/services/CadastrarUsuarioService.js";

const input = { nome: "Pessoa de Teste", email: "teste@exemplo.com", cpf: "52998224725", senha: "Camera@2026" };
const hash = "$2b$12$123456789012345678901u12345678901234567890123456789012";

const persisted = (): Usuario => new Usuario({
  id: "usr_1", nome: input.nome, email: input.email, cpf: input.cpf, senhaHash: hash, criadoEm: new Date("2026-01-01")
});

describe("CadastrarUsuarioService", () => {
  it("cria usuário usando apenas o hash", async () => {
    const repository: IUsuarioRepository = {
      buscarPorEmail: vi.fn().mockResolvedValue(null),
      buscarPorCpf: vi.fn().mockResolvedValue(null),
      criar: vi.fn().mockImplementation(async (usuario: Usuario) => {
        expect(usuario.paraPersistencia().senhaHash).toBe(hash);
        expect(usuario.paraPersistencia()).not.toHaveProperty("senha");
        return persisted();
      })
    };
    const service = new CadastrarUsuarioService(repository, { hash: vi.fn().mockResolvedValue(hash) });
    const result = await service.executar(input);
    expect(result).not.toHaveProperty("senhaHash");
    expect(result.email).toBe(input.email);
  });

  it("rejeita e-mail duplicado antes de gerar o hash", async () => {
    const hasher = { hash: vi.fn().mockResolvedValue(hash) };
    const repository: IUsuarioRepository = {
      buscarPorEmail: vi.fn().mockResolvedValue(persisted()),
      buscarPorCpf: vi.fn().mockResolvedValue(null),
      criar: vi.fn()
    };
    const service = new CadastrarUsuarioService(repository, hasher);
    await expect(service.executar(input)).rejects.toBeInstanceOf(ConflictError);
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it("rejeita CPF duplicado", async () => {
    const repository: IUsuarioRepository = {
      buscarPorEmail: vi.fn().mockResolvedValue(null),
      buscarPorCpf: vi.fn().mockResolvedValue(persisted()),
      criar: vi.fn()
    };
    const service = new CadastrarUsuarioService(repository, { hash: vi.fn() });
    await expect(service.executar(input)).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });
});
