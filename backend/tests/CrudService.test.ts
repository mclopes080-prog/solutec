import { describe, expect, it } from "vitest";
import { Categoria, type CategoriaResposta, type DadosCategoria } from "../src/entities/Categoria.js";
import type { Entidade } from "../src/entities/Entidade.js";
import { Produto } from "../src/entities/Produto.js";
import { BusinessRuleError, ConflictError, NotFoundError } from "../src/errors/AppError.js";
import { CategoriaService } from "../src/services/CategoriaService.js";
import { CrudService, type ContextoRequisicao } from "../src/services/CrudService.js";
import { EnderecoService } from "../src/services/EnderecoService.js";
import { PedidoService } from "../src/services/PedidoService.js";
import { ProdutoService } from "../src/services/ProdutoService.js";
import {
  criarRepoCategorias,
  criarRepoEnderecos,
  criarRepoPedidos,
  criarRepoProdutos,
  dadosCategoria,
  dadosEndereco,
  dadosProduto
} from "./helpers/fabricas.js";

const ana: ContextoRequisicao = { usuarioId: "usr_ana" };
const intruso: ContextoRequisicao = { usuarioId: "usr_intruso" };
const pagina = { page: 1, limit: 10 };

/**
 * Liskov: esta função só conhece o tipo ABSTRATO CrudService. Qualquer serviço concreto
 * passado aqui precisa se comportar igual (404 para id inexistente em buscar/editar/excluir).
 */
async function deveResponder404<TE extends Entidade<TR>, TC, TA, TR>(
  servico: CrudService<TE, TC, TA, TR>,
  dadosAtualizacao: TA
): Promise<void> {
  await expect(servico.buscar("nao-existe", ana)).rejects.toBeInstanceOf(NotFoundError);
  await expect(servico.atualizar("nao-existe", dadosAtualizacao, ana)).rejects.toBeInstanceOf(NotFoundError);
  await expect(servico.remover("nao-existe", ana)).rejects.toBeInstanceOf(NotFoundError);
}

const montar = () => {
  const cat = criarRepoCategorias();
  const prod = criarRepoProdutos();
  const end = criarRepoEnderecos();
  const ped = criarRepoPedidos();
  return {
    cat,
    prod,
    end,
    ped,
    categorias: new CategoriaService(cat.categorias),
    produtos: new ProdutoService(prod.produtos, cat.categorias),
    enderecos: new EnderecoService(end.enderecos),
    pedidos: new PedidoService(ped.pedidos, prod.produtos, end.enderecos)
  };
};

describe("CrudService — substituição de Liskov e 404", () => {
  it("todo serviço concreto, usado pelo tipo abstrato, responde 404 para inexistente", async () => {
    const s = montar();
    await deveResponder404(s.categorias, dadosCategoria());
    await deveResponder404(s.produtos, dadosProduto());
    await deveResponder404(s.enderecos, dadosEndereco());
    await deveResponder404(s.pedidos, { status: "PAGO" });
  });

  it("o fluxo completo funciona através da referência à classe base", async () => {
    const { categorias } = montar();
    const base: CrudService<Categoria, DadosCategoria, DadosCategoria, CategoriaResposta> = categorias;

    const criada = await base.criar(dadosCategoria(), ana);
    expect(criada.id).toBeDefined();
    expect((await base.atualizar(criada.id, dadosCategoria({ nome: "Câmeras IP" }), ana)).nome).toBe("Câmeras IP");
    expect((await base.listar(pagina, ana)).meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    await base.remover(criada.id, ana);
    await expect(base.buscar(criada.id, ana)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("listagem paginada devolve data + meta", async () => {
    const { categorias } = montar();
    for (const nome of ["A1", "B2", "C3"]) await categorias.criar(dadosCategoria({ nome }), ana);
    const resultado = await categorias.listar({ page: 2, limit: 2 }, ana);
    expect(resultado.data).toHaveLength(1);
    expect(resultado.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });
});

describe("CategoriaService (ganchos sobrescritos)", () => {
  it("nome duplicado → 409", async () => {
    const { categorias } = montar();
    await categorias.criar(dadosCategoria(), ana);
    await expect(categorias.criar(dadosCategoria(), ana)).rejects.toBeInstanceOf(ConflictError);
  });

  it("excluir categoria com produtos → 409", async () => {
    const { categorias, cat } = montar();
    const criada = await categorias.criar(dadosCategoria(), ana);
    cat.contarProdutos.mockResolvedValueOnce(2);
    await expect(categorias.remover(criada.id, ana)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("ProdutoService", () => {
  it("categoria inexistente → 422", async () => {
    const { produtos } = montar();
    await expect(produtos.criar(dadosProduto({ categoriaId: "fantasma" }), ana)).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("excluir produto presente em pedido → 409", async () => {
    const s = montar();
    const [categoria] = await s.cat.repo.semear(new Categoria(dadosCategoria()));
    const produto = await s.produtos.criar(dadosProduto({ categoriaId: categoria?.id ?? "" }), ana);
    s.prod.possuiPedidos.mockResolvedValueOnce(true);
    await expect(s.produtos.remover(produto.id, ana)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("EnderecoService (ownership)", () => {
  it("o dono vem do contexto e outro usuário recebe 404", async () => {
    const { enderecos } = montar();
    const criado = await enderecos.criar(dadosEndereco(), ana);
    expect(criado.usuarioId).toBe("usr_ana");

    await expect(enderecos.buscar(criado.id, intruso)).rejects.toBeInstanceOf(NotFoundError);
    await expect(enderecos.atualizar(criado.id, dadosEndereco({ numero: "9" }), intruso)).rejects.toBeInstanceOf(NotFoundError);
    await expect(enderecos.remover(criado.id, intruso)).rejects.toBeInstanceOf(NotFoundError);
    expect((await enderecos.listar(pagina, intruso)).data).toHaveLength(0);
    expect((await enderecos.listar(pagina, ana)).data).toHaveLength(1);
  });
});

describe("PedidoService", () => {
  const preparar = async () => {
    const s = montar();
    const [camera, sensor, inativo] = await s.prod.repo.semear(
      new Produto(dadosProduto({ nome: "Câmera", preco: 299.9 })),
      new Produto(dadosProduto({ nome: "Sensor", preco: 89.9 })),
      new Produto(dadosProduto({ nome: "Antigo", preco: 10, ativo: false }))
    );
    const endereco = await s.enderecos.criar(dadosEndereco(), ana);
    return { ...s, camera: camera!, sensor: sensor!, inativo: inativo!, endereco };
  };

  it("congela o preço do produto e calcula o total no servidor", async () => {
    const s = await preparar();
    const pedido = await s.pedidos.criar(
      { enderecoId: s.endereco.id, itens: [{ produtoId: s.camera.id ?? "", quantidade: 2 }, { produtoId: s.sensor.id ?? "", quantidade: 4 }] },
      ana
    );
    expect(pedido.status).toBe("PENDENTE");
    expect(pedido.itens.map((i) => i.precoUnitario)).toEqual([299.9, 89.9]);
    expect(pedido.total).toBe(959.4);

    // Mudar o preço do produto depois não altera o pedido.
    s.camera.preco = 999;
    expect((await s.pedidos.buscar(pedido.id, ana)).total).toBe(959.4);
  });

  it("rejeita produto inativo e endereço de outro usuário (422)", async () => {
    const s = await preparar();
    await expect(
      s.pedidos.criar({ enderecoId: s.endereco.id, itens: [{ produtoId: s.inativo.id ?? "", quantidade: 1 }] }, ana)
    ).rejects.toBeInstanceOf(BusinessRuleError);
    await expect(
      s.pedidos.criar({ enderecoId: s.endereco.id, itens: [{ produtoId: s.camera.id ?? "", quantidade: 1 }] }, intruso)
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("aplica transição válida, bloqueia inválida e impede excluir pedido pago", async () => {
    const s = await preparar();
    const pedido = await s.pedidos.criar({ enderecoId: s.endereco.id, itens: [{ produtoId: s.camera.id ?? "", quantidade: 1 }] }, ana);

    await expect(s.pedidos.atualizar(pedido.id, { status: "ENVIADO" }, ana)).rejects.toBeInstanceOf(BusinessRuleError);
    expect((await s.pedidos.atualizar(pedido.id, { status: "PAGO" }, ana)).status).toBe("PAGO");
    await expect(s.pedidos.atualizar(pedido.id, { itens: [{ produtoId: s.sensor.id ?? "", quantidade: 1 }] }, ana)).rejects.toBeInstanceOf(BusinessRuleError);
    await expect(s.pedidos.remover(pedido.id, ana)).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("pedido de outro usuário não aparece (404)", async () => {
    const s = await preparar();
    const pedido = await s.pedidos.criar({ enderecoId: s.endereco.id, itens: [{ produtoId: s.camera.id ?? "", quantidade: 1 }] }, ana);
    await expect(s.pedidos.buscar(pedido.id, intruso)).rejects.toBeInstanceOf(NotFoundError);
  });
});
