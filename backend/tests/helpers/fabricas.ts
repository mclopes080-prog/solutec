import { vi } from "vitest";
import { Categoria, type DadosCategoria } from "../../src/entities/Categoria.js";
import { Endereco, type DadosEndereco } from "../../src/entities/Endereco.js";
import { Pedido } from "../../src/entities/Pedido.js";
import { Produto, type DadosProduto } from "../../src/entities/Produto.js";
import type {
  ICategoriaRepository,
  IEnderecoRepository,
  IPedidoRepository,
  IProdutoRepository
} from "../../src/repositories/interfaces.js";
import { RepositorioMemoria } from "./RepositorioMemoria.js";

export const dadosCategoria = (sobrescrever: Partial<DadosCategoria> = {}): DadosCategoria => ({
  nome: "Câmeras",
  descricao: "Câmeras de segurança",
  ...sobrescrever
});

export const dadosProduto = (sobrescrever: Partial<DadosProduto> = {}): DadosProduto => ({
  nome: "Câmera IP Externa HD",
  descricao: "Câmera externa com resolução HD e visão noturna.",
  preco: 299.9,
  estoque: 18,
  imagemUrl: "/img/produtos/camera-ip-externa.webp",
  ativo: true,
  categoriaId: "cat_1",
  ...sobrescrever
});

export const dadosEndereco = (sobrescrever: Partial<DadosEndereco> = {}): DadosEndereco => ({
  apelido: "Loja Centro",
  cep: "87250-000",
  logradouro: "Rua Fictícia",
  numero: "100",
  complemento: null,
  bairro: "Centro",
  cidade: "Peabiru",
  uf: "PR",
  ...sobrescrever
});

export const criarRepoCategorias = () => {
  const repo = new RepositorioMemoria<Categoria>({
    persistir: (c, id, datas) => new Categoria({ ...c.paraPersistencia(), id, ...datas })
  });
  const contarProdutos = vi.fn(async (_id: string) => 0);
  const categorias: ICategoriaRepository = Object.assign(repo, {
    buscarPorNome: async (nome: string) => [...repo.itens.values()].find((c) => c.nome === nome) ?? null,
    contarProdutos
  });
  return { repo, categorias, contarProdutos };
};

export const criarRepoProdutos = () => {
  const repo = new RepositorioMemoria<Produto>({
    persistir: (p, id, datas) => new Produto({ ...p.paraPersistencia(), id, ...datas })
  });
  const possuiPedidos = vi.fn(async (_id: string) => false);
  const produtos: IProdutoRepository = Object.assign(repo, {
    listarAtivos: (paginacao: { page: number; limit: number }) => repo.listar(paginacao),
    buscarPorIds: async (ids: readonly string[]) =>
      ids.flatMap((id) => {
        const produto = repo.itens.get(id);
        return produto ? [produto] : [];
      }),
    possuiPedidos
  });
  return { repo, produtos, possuiPedidos };
};

export const criarRepoEnderecos = () => {
  const repo = new RepositorioMemoria<Endereco>({
    persistir: (e, id, datas) => new Endereco({ ...e.paraPersistencia(), id, ...datas }),
    dono: (e) => e.usuarioId
  });
  const possuiPedidos = vi.fn(async (_id: string) => false);
  const enderecos: IEnderecoRepository = Object.assign(repo, { possuiPedidos });
  return { repo, enderecos, possuiPedidos };
};

export const criarRepoPedidos = (): { repo: RepositorioMemoria<Pedido>; pedidos: IPedidoRepository } => {
  const repo = new RepositorioMemoria<Pedido>({
    persistir: (p, id, datas) =>
      new Pedido({ ...p.paraPersistencia(), itens: [...p.itens], id, ...datas }),
    dono: (p) => p.usuarioId
  });
  return { repo, pedidos: repo };
};
