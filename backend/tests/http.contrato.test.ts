/**
 * Teste de contrato HTTP (fumaça sem banco): sobe um Express de verdade com os mesmos
 * controllers, rotas, middleware de autenticação e errorHandler da aplicação, trocando só
 * os repositórios Prisma por repositórios em memória. Confere os status codes que o guia
 * de estudo assume: 200/201/204/400/401/404/409/422.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import bcrypt from "bcrypt";
import express, { Router } from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AuthController } from "../src/controllers/AuthController.js";
import { CategoriaController } from "../src/controllers/CategoriaController.js";
import { EnderecoController } from "../src/controllers/EnderecoController.js";
import { PedidoController } from "../src/controllers/PedidoController.js";
import { ProdutoController } from "../src/controllers/ProdutoController.js";
import { UsuarioController } from "../src/controllers/UsuarioController.js";
import { Usuario } from "../src/entities/Usuario.js";
import { criarMiddlewareAutenticar } from "../src/middlewares/autenticar.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";
import { criarRotasCrud } from "../src/routes/crud.routes.js";
import { healthRoutes } from "../src/routes/health.routes.js";
import { AutenticarUsuarioService } from "../src/services/AutenticarUsuarioService.js";
import { CadastrarUsuarioService } from "../src/services/CadastrarUsuarioService.js";
import { CategoriaService } from "../src/services/CategoriaService.js";
import { EditarUsuarioService } from "../src/services/EditarUsuarioService.js";
import { EnderecoService } from "../src/services/EnderecoService.js";
import { JwtTokenService } from "../src/services/JwtTokenService.js";
import { ObterUsuarioService } from "../src/services/ObterUsuarioService.js";
import { PedidoService } from "../src/services/PedidoService.js";
import { ProdutoService } from "../src/services/ProdutoService.js";
import { BcryptPasswordHasher } from "../src/services/passwordHasher.js";
import { criarRepoCategorias, criarRepoEnderecos, criarRepoPedidos, criarRepoProdutos } from "./helpers/fabricas.js";
import { repositorioUsuariosMock } from "./helpers/usuarios.js";

const DEMO = { email: "demo@solutec.test", senha: "Solutec@2026" };

interface Resposta {
  status: number;
  corpo: unknown;
}

let servidor: Server;
let base = "";
let token = "";

const chamar = async (metodo: string, caminho: string, corpo?: unknown, comToken = true): Promise<Resposta> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (comToken && token) headers.Authorization = `Bearer ${token}`;
  const init: RequestInit = { method: metodo, headers };
  if (corpo !== undefined) init.body = JSON.stringify(corpo);
  const resposta = await fetch(`${base}${caminho}`, init);
  const texto = await resposta.text();
  return { status: resposta.status, corpo: texto ? (JSON.parse(texto) as unknown) : null };
};

/** Lê `corpo.data.id` com narrowing (sem `any`). */
const idDe = (corpo: unknown): string => {
  if (typeof corpo === "object" && corpo !== null && "data" in corpo) {
    const data = corpo.data;
    if (typeof data === "object" && data !== null && "id" in data && typeof data.id === "string") return data.id;
  }
  throw new Error(`Resposta sem data.id: ${JSON.stringify(corpo)}`);
};

beforeAll(async () => {
  const senhas = new BcryptPasswordHasher();
  const tokens = new JwtTokenService("segredo-de-teste-com-mais-de-32-caracteres", "2h");
  const demo = new Usuario({
    id: "usr_demo",
    nome: "Usuário Demo",
    email: DEMO.email,
    cpf: "11144477735",
    senhaHash: await bcrypt.hash(DEMO.senha, 10),
    criadoEm: new Date("2026-11-20"),
    atualizadoEm: new Date("2026-11-20")
  });
  const usuarios = repositorioUsuariosMock({
    buscarPorEmail: vi.fn(async (email: string) => (email === DEMO.email ? demo : null)),
    buscarPorId: vi.fn(async (id: string) => (id === demo.id ? demo : null))
  });

  const cat = criarRepoCategorias();
  const prod = criarRepoProdutos();
  const end = criarRepoEnderecos();
  const ped = criarRepoPedidos();
  // Mesmo comportamento das consultas Prisma, mas sobre os mapas em memória.
  cat.contarProdutos.mockImplementation(
    async (id: string) => [...prod.repo.itens.values()].filter((p) => p.categoriaId === id).length
  );
  prod.possuiPedidos.mockImplementation(async (id: string) =>
    [...ped.repo.itens.values()].some((p) => p.itens.some((item) => item.produtoId === id))
  );

  const autenticar = criarMiddlewareAutenticar(tokens);
  const authController = new AuthController(new AutenticarUsuarioService(usuarios, senhas, tokens));
  const usuarioController = new UsuarioController(
    new CadastrarUsuarioService(usuarios, senhas),
    new ObterUsuarioService(usuarios),
    new EditarUsuarioService(usuarios, senhas)
  );

  const app = express();
  app.use(express.json());
  app.use("/api", healthRoutes);
  const rotasUsuario = Router();
  rotasUsuario.post("/auth/login", authController.login);
  rotasUsuario.get("/usuarios/me", autenticar, usuarioController.me);
  rotasUsuario.put("/usuarios/me", autenticar, usuarioController.atualizarMe);
  app.use("/api", rotasUsuario);
  app.use("/api/categorias", criarRotasCrud(new CategoriaController(new CategoriaService(cat.categorias)), autenticar));
  app.use("/api/produtos", criarRotasCrud(new ProdutoController(new ProdutoService(prod.produtos, cat.categorias)), autenticar));
  app.use("/api/enderecos", criarRotasCrud(new EnderecoController(new EnderecoService(end.enderecos)), autenticar));
  app.use(
    "/api/pedidos",
    criarRotasCrud(new PedidoController(new PedidoService(ped.pedidos, prod.produtos, end.enderecos)), autenticar)
  );
  app.use(errorHandler);

  await new Promise<void>((resolve) => {
    servidor = app.listen(0, "127.0.0.1", () => resolve());
  });
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}/api`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => servidor.close(() => resolve()));
});

describe("contrato HTTP — autenticação e usuário", () => {
  it("health → 200", async () => {
    expect((await chamar("GET", "/health", undefined, false)).status).toBe(200);
  });

  it("senha errada e e-mail inexistente → o MESMO 401", async () => {
    const senhaErrada = await chamar("POST", "/auth/login", { ...DEMO, senha: "Errada@123" }, false);
    const inexistente = await chamar("POST", "/auth/login", { email: "ninguem@solutec.test", senha: DEMO.senha }, false);
    expect(senhaErrada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(senhaErrada.corpo).toEqual(inexistente.corpo);
  });

  it("login do usuário demo → 200 com token", async () => {
    const r = await chamar("POST", "/auth/login", DEMO, false);
    expect(r.status).toBe(200);
    expect(r.corpo).toMatchObject({ data: { token: expect.any(String), usuario: { email: DEMO.email } } });
    if (typeof r.corpo === "object" && r.corpo !== null && "data" in r.corpo) {
      const data = r.corpo.data;
      if (typeof data === "object" && data !== null && "token" in data && typeof data.token === "string") token = data.token;
    }
    expect(token).not.toBe("");
  });

  it("GET /usuarios/me com token → 200; sem token → 401", async () => {
    expect((await chamar("GET", "/usuarios/me")).status).toBe(200);
    expect((await chamar("GET", "/usuarios/me", undefined, false)).status).toBe(401);
  });

  it("PUT /usuarios/me com e-mail no corpo → 400 'O e-mail não pode ser alterado.'", async () => {
    const r = await chamar("PUT", "/usuarios/me", {
      nome: "Usuário Demo",
      cpf: "111.444.777-35",
      senha: DEMO.senha,
      confirmacaoSenha: DEMO.senha,
      email: "outro@solutec.test"
    });
    expect(r.status).toBe(400);
    expect(r.corpo).toMatchObject({ error: { message: "O e-mail não pode ser alterado." } });
  });
});

describe("contrato HTTP — 4 CRUDs", () => {
  const ids: Record<string, string> = {};

  const corpos = (): Record<string, { criar: unknown; editar: unknown }> => ({
    categorias: {
      criar: { nome: "Câmeras", descricao: "Câmeras IP e kits com gravador." },
      editar: { nome: "Câmeras IP", descricao: "Câmeras IP e kits com gravador." }
    },
    produtos: {
      criar: { nome: "Câmera Dome Interna", descricao: "Câmera dome discreta.", preco: 189.9, estoque: 25, imagemUrl: null, ativo: true, categoriaId: ids.categorias },
      editar: { nome: "Câmera Dome Interna", descricao: "Câmera dome discreta.", preco: 179.9, estoque: 20, imagemUrl: null, ativo: true, categoriaId: ids.categorias }
    },
    enderecos: {
      criar: { apelido: "Loja Centro", cep: "87250-000", logradouro: "Rua Fictícia", numero: "100", complemento: null, bairro: "Centro", cidade: "Peabiru", uf: "PR" },
      editar: { apelido: "Loja Matriz", cep: "87250-000", logradouro: "Rua Fictícia", numero: "100", complemento: null, bairro: "Centro", cidade: "Peabiru", uf: "PR" }
    },
    pedidos: {
      criar: { enderecoId: ids.enderecos, itens: [{ produtoId: ids.produtos, quantidade: 2 }] },
      editar: { itens: [{ produtoId: ids.produtos, quantidade: 3 }] }
    }
  });

  it.each(["categorias", "produtos", "enderecos", "pedidos"])("%s: sem token → 401", async (recurso) => {
    expect((await chamar("GET", `/${recurso}`, undefined, false)).status).toBe(401);
  });

  it.each(["categorias", "produtos", "enderecos", "pedidos"])("%s: criar 201, listar paginado, editar 200, editar inexistente 404", async (recurso) => {
    const corpo = corpos()[recurso];
    if (!corpo) throw new Error(recurso);

    const criado = await chamar("POST", `/${recurso}`, corpo.criar);
    expect(criado.status, JSON.stringify(criado.corpo)).toBe(201);
    ids[recurso] = idDe(criado.corpo);

    const lista = await chamar("GET", `/${recurso}?page=1&limit=10`);
    expect(lista.status).toBe(200);
    expect(lista.corpo).toMatchObject({ data: expect.any(Array), meta: { page: 1, limit: 10, total: 1, totalPages: 1 } });

    const editado = await chamar("PUT", `/${recurso}/${ids[recurso]}`, corpo.editar);
    expect(editado.status, JSON.stringify(editado.corpo)).toBe(200);

    expect((await chamar("PUT", `/${recurso}/nao-existe`, corpo.editar)).status).toBe(404);
  });

  it("pedido: total calculado no servidor com o preço congelado", async () => {
    const r = await chamar("GET", `/pedidos/${ids.pedidos}`);
    expect(r.corpo).toMatchObject({ data: { status: "PENDENTE", total: 539.7 } });
  });

  it("deletar categoria com produtos → 409", async () => {
    expect((await chamar("DELETE", `/categorias/${ids.categorias}`)).status).toBe(409);
  });

  it("transição de status inválida → 422; válida → 200", async () => {
    expect((await chamar("PUT", `/pedidos/${ids.pedidos}`, { status: "ENVIADO" })).status).toBe(422);
    expect((await chamar("PUT", `/pedidos/${ids.pedidos}`, { status: "CANCELADO" })).status).toBe(200);
  });

  it.each(["pedidos", "produtos", "enderecos", "categorias"])("%s: deletar → 204 e depois 404", async (recurso) => {
    const r = await chamar("DELETE", `/${recurso}/${ids[recurso]}`);
    expect(r.status, JSON.stringify(r.corpo)).toBe(204);
    expect((await chamar("GET", `/${recurso}/${ids[recurso]}`)).status).toBe(404);
  });
});
