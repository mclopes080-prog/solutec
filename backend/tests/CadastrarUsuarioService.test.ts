import { describe, expect, it, vi } from "vitest";
import type { Usuario } from "../src/entities/Usuario.js";
import { ConflictError } from "../src/errors/AppError.js";
import { CadastrarUsuarioService } from "../src/services/CadastrarUsuarioService.js";
import { HASH_TESTE as hash, repositorioUsuariosMock, usuarioPersistido } from "./helpers/usuarios.js";

const input = { nome: "Pessoa de Teste", email: "teste@exemplo.com", cpf: "52998224725", senha: "Camera@2026" };

describe("CadastrarUsuarioService", () => {
  it("cria usuário usando apenas o hash", async () => {
    const repository = repositorioUsuariosMock({
      criar: vi.fn().mockImplementation(async (usuario: Usuario) => {
        expect(usuario.paraPersistencia().senhaHash).toBe(hash);
        expect(usuario.paraPersistencia()).not.toHaveProperty("senha");
        return usuarioPersistido();
      })
    });
    const service = new CadastrarUsuarioService(repository, { hash: vi.fn().mockResolvedValue(hash) });
    const result = await service.executar(input);
    expect(result).not.toHaveProperty("senhaHash");
    expect(result.email).toBe(input.email);
  });

  it("rejeita e-mail duplicado antes de gerar o hash", async () => {
    const hasher = { hash: vi.fn().mockResolvedValue(hash) };
    const repository = repositorioUsuariosMock({ buscarPorEmail: vi.fn().mockResolvedValue(usuarioPersistido()) });
    const service = new CadastrarUsuarioService(repository, hasher);
    await expect(service.executar(input)).rejects.toBeInstanceOf(ConflictError);
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it("rejeita CPF duplicado", async () => {
    const repository = repositorioUsuariosMock({ buscarPorCpf: vi.fn().mockResolvedValue(usuarioPersistido()) });
    const service = new CadastrarUsuarioService(repository, { hash: vi.fn() });
    await expect(service.executar(input)).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });
});
