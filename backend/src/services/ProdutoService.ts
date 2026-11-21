import { Produto, type DadosProduto, type ProdutoResposta } from "../entities/Produto.js";
import { BusinessRuleError, ConflictError } from "../errors/AppError.js";
import type { ICategoriaRepository, IProdutoRepository } from "../repositories/interfaces.js";
import { montarMeta, type ParametrosPaginacao, type Paginado } from "../types/paginacao.js";
import { CrudService } from "./CrudService.js";

export class ProdutoService extends CrudService<Produto, DadosProduto, DadosProduto, ProdutoResposta> {
  constructor(
    private readonly produtos: IProdutoRepository,
    private readonly categorias: ICategoriaRepository
  ) {
    super(produtos, "Produto não encontrado.");
  }

  /** Catálogo público: só produtos ativos. */
  async listarCatalogo(paginacao: ParametrosPaginacao): Promise<Paginado<ProdutoResposta>> {
    const { itens, total } = await this.produtos.listarAtivos(paginacao);
    return { data: itens.map((produto) => produto.paraResposta()), meta: montarMeta(paginacao, total) };
  }

  protected override async validarCriacao(dados: DadosProduto): Promise<void> {
    await this.#garantirCategoria(dados.categoriaId);
  }

  protected override async validarAtualizacao(_entidade: Produto, dados: DadosProduto): Promise<void> {
    await this.#garantirCategoria(dados.categoriaId);
  }

  protected override async validarRemocao(entidade: Produto): Promise<void> {
    if (entidade.id && (await this.produtos.possuiPedidos(entidade.id))) {
      throw new ConflictError("Produto presente em pedidos não pode ser excluído. Desative-o (ativo = false).");
    }
  }

  protected override construir(dados: DadosProduto): Produto {
    return new Produto(dados);
  }

  protected override aplicarAtualizacao(entidade: Produto, dados: DadosProduto): void {
    entidade.atualizar(dados);
  }

  async #garantirCategoria(categoriaId: string): Promise<void> {
    if (!(await this.categorias.buscarPorId(categoriaId))) {
      throw new BusinessRuleError("Categoria informada não existe.", { categoriaId: ["Categoria informada não existe."] });
    }
  }
}
