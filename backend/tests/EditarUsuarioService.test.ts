import { describe, expect, it, vi } from "vitest";
import type { Usuario } from "../src/entities/Usuario.js";
import { ConflictError, NotFoundError, ValidationError } from "../src/errors/AppError.js";
import { EditarUsuarioService } from "../src/services/EditarUsuarioService.js";
import { ObterUsuarioService } from "../src/services/ObterUsuarioService.js";
import { MENSAGEM_EMAIL_IMUTAVEL, parseEditarUsuario } from "../src/validators/usuario.validator.js";
import { repositorioUsuariosMock, usuarioPersistido } from "./helpers/usuarios.js";

const NOVO_HASH = "$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234";
const corpoValido = { nome: "Nome Editado", cpf: "111.444.777-35", senha: "Nova@Senha1", confirmacaoSenha: "Nova@Senha1" };

describe("edição do próprio usuário — validação do corpo", () => {
  it("bloqueia e-mail no body com 400 e mensagem de negócio", () => {
    const erro = (() => {
      try {
        parseEditarUsuario({ ...corpoValido, email: "novo@exemplo.com" });
      } catch (e) {
        return e;
      }
      return undefined;
    })();
    expect(erro).toBeInstanceOf(ValidationError);
    expect(erro).toMatchObject({ statusCode: 400, message: MENSAGEM_EMAIL_IMUTAVEL, fields: { email: [MENSAGEM_EMAIL_IMUTAVEL] } });
  });

  it.each(["nome", "cpf", "senha", "confirmacaoSenha"] as const)("exige o campo %s", (campo) => {
    const { [campo]: _removido, ...semCampo } = corpoValido;
    expect(() => parseEditarUsuario(semCampo)).toThrow();
  });

  it("rejeita confirmação diferente, CPF inválido e senha fraca", () => {
    expect(() => parseEditarUsuario({ ...corpoValido, confirmacaoSenha: "Outra@Senha1" })).toThrow();
    expect(() => parseEditarUsuario({ ...corpoValido, cpf: "111.111.111-11" })).toThrow();
    expect(() => parseEditarUsuario({ ...corpoValido, senha: "fraca", confirmacaoSenha: "fraca" })).toThrow();
  });

  it("normaliza o CPF", () => {
    expect(parseEditarUsuario(corpoValido).cpf).toBe("11144477735");
  });
});

describe("EditarUsuarioService", () => {
  const input = parseEditarUsuario(corpoValido);

  it("atualiza nome, CPF e senha (hash) do próprio usuário, sem mexer no e-mail", async () => {
    const atualizar = vi.fn(async (usuario: Usuario) => usuario);
    const repo = repositorioUsuariosMock({ buscarPorId: vi.fn().mockResolvedValue(usuarioPersistido()), atualizar });
    const service = new EditarUsuarioService(repo, { hash: vi.fn().mockResolvedValue(NOVO_HASH) });

    const resultado = await service.executar("usr_1", input);

    expect(resultado).toMatchObject({ id: "usr_1", nome: "Nome Editado", cpf: "11144477735", email: "teste@exemplo.com" });
    expect(atualizar.mock.calls[0]?.[0].paraPersistencia().senhaHash).toBe(NOVO_HASH);
  });

  it("permite manter o próprio CPF", async () => {
    const proprio = usuarioPersistido({ cpf: "11144477735" });
    const repo = repositorioUsuariosMock({
      buscarPorId: vi.fn().mockResolvedValue(proprio),
      buscarPorCpf: vi.fn().mockResolvedValue(proprio)
    });
    const service = new EditarUsuarioService(repo, { hash: vi.fn().mockResolvedValue(NOVO_HASH) });
    await expect(service.executar("usr_1", input)).resolves.toMatchObject({ cpf: "11144477735" });
  });

  it("rejeita CPF de outro usuário com 409", async () => {
    const repo = repositorioUsuariosMock({
      buscarPorId: vi.fn().mockResolvedValue(usuarioPersistido()),
      buscarPorCpf: vi.fn().mockResolvedValue(usuarioPersistido({ id: "usr_2", cpf: "11144477735" }))
    });
    const service = new EditarUsuarioService(repo, { hash: vi.fn() });
    await expect(service.executar("usr_1", input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("devolve 404 se o usuário do token não existe mais", async () => {
    const service = new EditarUsuarioService(repositorioUsuariosMock(), { hash: vi.fn() });
    await expect(service.executar("sumiu", input)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("ObterUsuarioService", () => {
  it("devolve os dados públicos do usuário do token, sem o hash da senha", async () => {
    const service = new ObterUsuarioService(repositorioUsuariosMock({ buscarPorId: vi.fn().mockResolvedValue(usuarioPersistido()) }));
    const resultado = await service.executar("usr_1");
    expect(resultado).toMatchObject({ id: "usr_1", email: "teste@exemplo.com" });
    expect(resultado).not.toHaveProperty("senhaHash");
  });

  it("devolve 404 se o usuário do token não existe mais", async () => {
    const service = new ObterUsuarioService(repositorioUsuariosMock());
    await expect(service.executar("sumiu")).rejects.toBeInstanceOf(NotFoundError);
  });
});
