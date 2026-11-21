import { describe, expect, it } from "vitest";
import { Categoria } from "../src/entities/Categoria.js";
import { Endereco } from "../src/entities/Endereco.js";
import { Entidade } from "../src/entities/Entidade.js";
import { ItemPedido } from "../src/entities/ItemPedido.js";
import { Pedido } from "../src/entities/Pedido.js";
import { Produto } from "../src/entities/Produto.js";
import { STATUS_PEDIDO } from "../src/entities/StatusPedido.js";
import { BusinessRuleError, ValidationError } from "../src/errors/AppError.js";
import { REGRAS_STATUS, podeTransicionar } from "../src/services/pedido/transicoesStatus.js";
import { dadosCategoria, dadosEndereco, dadosProduto } from "./helpers/fabricas.js";

const datas = { id: "x_1", criadoEm: new Date("2026-11-01"), atualizadoEm: new Date("2026-11-02") };

describe("Entidade (classe abstrata)", () => {
  it("todas as entidades herdam id/datas e expõem paraResposta()", () => {
    const entidades: Entidade<unknown>[] = [
      new Categoria({ ...dadosCategoria(), ...datas }),
      new Produto({ ...dadosProduto(), ...datas }),
      new Endereco({ ...dadosEndereco(), usuarioId: "usr_1", ...datas })
    ];
    for (const entidade of entidades) {
      expect(entidade.persistida).toBe(true);
      expect(entidade.paraResposta()).toMatchObject({ id: "x_1" });
    }
  });

  it("não monta resposta de entidade que ainda não foi salva", () => {
    expect(() => new Categoria(dadosCategoria()).paraResposta()).toThrow(/persistid/);
  });
});

describe("Categoria", () => {
  it("normaliza espaços e trata descrição vazia como null", () => {
    const categoria = new Categoria({ nome: "  Alarmes  ", descricao: "   " });
    expect(categoria.nome).toBe("Alarmes");
    expect(categoria.descricao).toBeNull();
  });

  it("rejeita nome curto/longo, associando o erro ao campo", () => {
    expect(() => new Categoria({ nome: "A", descricao: null })).toThrow(ValidationError);
    try {
      new Categoria({ nome: "x".repeat(81), descricao: null });
    } catch (erro) {
      expect(erro).toMatchObject({ fields: { nome: expect.any(Array) } });
    }
  });

  it("atualizar() valida antes de trocar o estado", () => {
    const categoria = new Categoria(dadosCategoria());
    expect(() => categoria.atualizar({ nome: "", descricao: "nova" })).toThrow(ValidationError);
    expect(categoria.descricao).toBe("Câmeras de segurança");
  });
});

describe("Produto (setters com regra)", () => {
  it("set preco aceita valor positivo com até 2 casas", () => {
    const produto = new Produto(dadosProduto());
    produto.preco = 189.9;
    expect(produto.preco).toBe(189.9);
  });

  it.each([0, -1, Number.NaN, 10.999])("set preco rejeita %s", (valor) => {
    const produto = new Produto(dadosProduto());
    expect(() => {
      produto.preco = valor;
    }).toThrow(ValidationError);
    expect(produto.preco).toBe(299.9);
  });

  it.each([-1, 1.5])("set estoque rejeita %s", (valor) => {
    const produto = new Produto(dadosProduto());
    expect(() => {
      produto.estoque = valor;
    }).toThrow(ValidationError);
  });

  it("construtor usa os mesmos setters (não dá para criar produto inválido)", () => {
    expect(() => new Produto(dadosProduto({ preco: 0 }))).toThrow(/preço/);
    expect(() => new Produto(dadosProduto({ estoque: -3 }))).toThrow(/estoque/);
  });

  it("disponivel é getter derivado de ativo + estoque", () => {
    const produto = new Produto(dadosProduto({ estoque: 0 }));
    expect(produto.disponivel).toBe(false);
    produto.estoque = 2;
    expect(produto.disponivel).toBe(true);
    produto.desativar();
    expect(produto.disponivel).toBe(false);
  });

  it("valida a URL da imagem", () => {
    expect(() => new Produto(dadosProduto({ imagemUrl: "javascript:alert(1)" }))).toThrow(ValidationError);
    expect(new Produto(dadosProduto({ imagemUrl: "" })).imagemUrl).toBeNull();
  });
});

describe("Endereco", () => {
  it("normaliza CEP e UF", () => {
    const endereco = new Endereco({ ...dadosEndereco({ cep: "87.250-000", uf: "pr" }), usuarioId: "usr_1" });
    expect(endereco.cep).toBe("87250000");
    expect(endereco.uf).toBe("PR");
    expect(endereco.pertenceA("usr_1")).toBe(true);
    expect(endereco.pertenceA("usr_2")).toBe(false);
  });

  it("rejeita CEP incompleto e UF inexistente", () => {
    expect(() => new Endereco({ ...dadosEndereco({ cep: "123" }), usuarioId: "usr_1" })).toThrow(/CEP/);
    expect(() => new Endereco({ ...dadosEndereco({ uf: "XX" }), usuarioId: "usr_1" })).toThrow(/UF/);
  });

  it("exige dono", () => {
    expect(() => new Endereco({ ...dadosEndereco(), usuarioId: "" })).toThrow(ValidationError);
  });
});

describe("ItemPedido", () => {
  it("calcula subtotal em centavos", () => {
    expect(new ItemPedido({ produtoId: "p", quantidade: 3, precoUnitario: 0.1 }).subtotal).toBe(0.3);
  });

  it.each([0, 1000, 1.5])("rejeita quantidade %s", (quantidade) => {
    expect(() => new ItemPedido({ produtoId: "p", quantidade, precoUnitario: 10 })).toThrow(ValidationError);
  });
});

describe("Pedido", () => {
  const item = (produtoId: string, quantidade: number, precoUnitario: number) => new ItemPedido({ produtoId, quantidade, precoUnitario });
  const novoPedido = (status: Pedido["status"] = "PENDENTE") =>
    new Pedido({ usuarioId: "usr_1", enderecoId: "end_1", status, itens: [item("a", 2, 299.9), item("b", 4, 89.9)] });

  it("total é getter calculado (2 × 299,90 + 4 × 89,90 = 959,40)", () => {
    const pedido = novoPedido();
    expect(pedido.total).toBe(959.4);
    expect(Object.getOwnPropertyDescriptor(Pedido.prototype, "total")?.set).toBeUndefined();
  });

  it("evita erro de ponto flutuante na soma", () => {
    const pedido = new Pedido({ usuarioId: "u", enderecoId: "e", status: "PENDENTE", itens: [item("a", 1, 0.1), item("b", 1, 0.2)] });
    expect(pedido.total).toBe(0.3);
  });

  it("recalcula o total ao substituir os itens", () => {
    const pedido = novoPedido();
    pedido.substituirItens([item("a", 1, 100)]);
    expect(pedido.total).toBe(100);
  });

  it("rejeita pedido sem itens ou com produto repetido", () => {
    expect(() => new Pedido({ usuarioId: "u", enderecoId: "e", status: "PENDENTE", itens: [] })).toThrow(ValidationError);
    expect(() => new Pedido({ usuarioId: "u", enderecoId: "e", status: "PENDENTE", itens: [item("a", 1, 1), item("a", 2, 1)] })).toThrow(/repita/);
  });

  it("segue a tabela de transições: PENDENTE → PAGO → ENVIADO", () => {
    const pedido = novoPedido();
    pedido.alterarStatus("PAGO");
    pedido.alterarStatus("ENVIADO");
    expect(pedido.status).toBe("ENVIADO");
  });

  it("bloqueia transição fora da tabela com 422", () => {
    const pedido = novoPedido();
    expect(() => pedido.alterarStatus("ENVIADO")).toThrow(BusinessRuleError);
    expect(() => novoPedido("CANCELADO").alterarStatus("PAGO")).toThrow(BusinessRuleError);
  });

  it("só permite editar itens/endereço e excluir conforme o status", () => {
    const pago = novoPedido("PAGO");
    expect(pago.editavel).toBe(false);
    expect(pago.removivel).toBe(false);
    expect(() => pago.substituirItens([item("a", 1, 1)])).toThrow(BusinessRuleError);
    expect(() => pago.alterarEndereco("end_2")).toThrow(BusinessRuleError);
    expect(novoPedido("CANCELADO").removivel).toBe(true);
  });

  it("a tabela de regras cobre todos os status (aberta para extensão)", () => {
    for (const status of STATUS_PEDIDO) expect(REGRAS_STATUS[status]).toBeDefined();
    expect(podeTransicionar("PENDENTE", "CANCELADO")).toBe(true);
    expect(podeTransicionar("ENVIADO", "CANCELADO")).toBe(false);
  });

  it("não expõe a lista interna de itens", () => {
    const pedido = novoPedido();
    const copia = pedido.itens as ItemPedido[];
    copia.pop();
    expect(pedido.itens).toHaveLength(2);
  });
});
