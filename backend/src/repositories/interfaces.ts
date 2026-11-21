import type { Categoria } from "../entities/Categoria.js";
import type { Endereco } from "../entities/Endereco.js";
import type { Pedido } from "../entities/Pedido.js";
import type { Produto } from "../entities/Produto.js";
import type { ParametrosPaginacao } from "../types/paginacao.js";
import type { IRepositorio, Pagina } from "./IRepositorio.js";

export interface ICategoriaRepository extends IRepositorio<Categoria> {
  buscarPorNome(nome: string): Promise<Categoria | null>;
  contarProdutos(categoriaId: string): Promise<number>;
}

export interface IProdutoRepository extends IRepositorio<Produto> {
  listarAtivos(paginacao: ParametrosPaginacao): Promise<Pagina<Produto>>;
  buscarPorIds(ids: readonly string[]): Promise<Produto[]>;
  possuiPedidos(produtoId: string): Promise<boolean>;
}

export interface IEnderecoRepository extends IRepositorio<Endereco> {
  possuiPedidos(enderecoId: string): Promise<boolean>;
}

export type IPedidoRepository = IRepositorio<Pedido>;
