import { Categoria, type CategoriaResposta, type DadosCategoria } from "../entities/Categoria.js";
import { ConflictError } from "../errors/AppError.js";
import type { ICategoriaRepository } from "../repositories/interfaces.js";
import { CrudService } from "./CrudService.js";

export class CategoriaService extends CrudService<Categoria, DadosCategoria, DadosCategoria, CategoriaResposta> {
  constructor(private readonly categorias: ICategoriaRepository) {
    super(categorias, "Categoria não encontrada.");
  }

  protected override async validarCriacao(dados: DadosCategoria): Promise<void> {
    await this.#garantirNomeLivre(dados.nome);
  }

  protected override async validarAtualizacao(entidade: Categoria, dados: DadosCategoria): Promise<void> {
    await this.#garantirNomeLivre(dados.nome, entidade.id);
  }

  protected override async validarRemocao(entidade: Categoria): Promise<void> {
    if (!entidade.id) return;
    const produtos = await this.categorias.contarProdutos(entidade.id);
    if (produtos > 0) {
      throw new ConflictError(`Categoria possui ${produtos} produto(s) vinculado(s). Mova ou exclua os produtos antes.`);
    }
  }

  protected override construir(dados: DadosCategoria): Categoria {
    return new Categoria(dados);
  }

  protected override aplicarAtualizacao(entidade: Categoria, dados: DadosCategoria): void {
    entidade.atualizar(dados);
  }

  async #garantirNomeLivre(nome: string, idAtual?: string): Promise<void> {
    const existente = await this.categorias.buscarPorNome(nome.trim());
    if (existente && existente.id !== idAtual) {
      throw new ConflictError("Já existe uma categoria com esse nome.", { nome: ["Já existe uma categoria com esse nome."] });
    }
  }
}
