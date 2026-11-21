import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../src/errors/AppError.js";
import { AutenticarUsuarioService, MENSAGEM_CREDENCIAIS_INVALIDAS } from "../src/services/AutenticarUsuarioService.js";
import type { ITokenService } from "../src/services/JwtTokenService.js";
import { HASH_TESTE, repositorioUsuariosMock, usuarioPersistido } from "./helpers/usuarios.js";

const tokens: ITokenService = { gerar: vi.fn().mockReturnValue("token.jwt"), verificar: vi.fn() };
const input = { email: "teste@exemplo.com", senha: "Camera@2026" };

describe("AutenticarUsuarioService (login)", () => {
  it("devolve token e dados públicos quando a senha confere", async () => {
    const verificador = { comparar: vi.fn().mockResolvedValue(true) };
    const service = new AutenticarUsuarioService(
      repositorioUsuariosMock({ buscarPorEmail: vi.fn().mockResolvedValue(usuarioPersistido()) }),
      verificador,
      tokens
    );

    const resultado = await service.executar(input);

    expect(resultado.token).toBe("token.jwt");
    expect(tokens.gerar).toHaveBeenCalledWith("usr_1");
    expect(verificador.comparar).toHaveBeenCalledWith(input.senha, HASH_TESTE);
    expect(resultado.usuario).not.toHaveProperty("senhaHash");
    expect(resultado.usuario.email).toBe(input.email);
  });

  it("rejeita senha errada com 401 genérico", async () => {
    const service = new AutenticarUsuarioService(
      repositorioUsuariosMock({ buscarPorEmail: vi.fn().mockResolvedValue(usuarioPersistido()) }),
      { comparar: vi.fn().mockResolvedValue(false) },
      tokens
    );

    await expect(service.executar(input)).rejects.toMatchObject({
      statusCode: 401,
      message: MENSAGEM_CREDENCIAIS_INVALIDAS
    });
  });

  it("rejeita usuário inexistente com a MESMA resposta e ainda executa o bcrypt", async () => {
    const verificador = { comparar: vi.fn().mockResolvedValue(false) };
    const service = new AutenticarUsuarioService(repositorioUsuariosMock(), verificador, tokens);

    const erro = await service.executar(input).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(UnauthorizedError);
    expect(erro).toMatchObject({ statusCode: 401, message: MENSAGEM_CREDENCIAIS_INVALIDAS });
    expect(verificador.comparar).toHaveBeenCalledTimes(1);
  });
});
