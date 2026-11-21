import type { Entidade } from "../entities/Entidade.js";
import { NotFoundError } from "../errors/AppError.js";
import type { Escopo, IRepositorio } from "../repositories/IRepositorio.js";
import { montarMeta, type ParametrosPaginacao, type Paginado } from "../types/paginacao.js";

/** Quem está fazendo a requisição (vem do token). */
export interface ContextoRequisicao {
  usuarioId: string;
}

/** Contrato público consumido pelo controller genérico. */
export interface IServicoCrud<TCriar, TAtualizar, TResposta> {
  listar(paginacao: ParametrosPaginacao, contexto: ContextoRequisicao): Promise<Paginado<TResposta>>;
  buscar(id: string, contexto: ContextoRequisicao): Promise<TResposta>;
  criar(dados: TCriar, contexto: ContextoRequisicao): Promise<TResposta>;
  atualizar(id: string, dados: TAtualizar, contexto: ContextoRequisicao): Promise<TResposta>;
  remover(id: string, contexto: ContextoRequisicao): Promise<void>;
}

/**
 * Template Method: o fluxo (checar existência → validar → aplicar → persistir) é fixo aqui;
 * os serviços concretos só sobrescrevem os ganchos (`construir`, `aplicarAtualizacao`,
 * `validar*`, `escopo`). Qualquer subclasse pode ser usada onde se espera `CrudService` (LSP).
 */
export abstract class CrudService<TEntidade extends Entidade<TResposta>, TCriar, TAtualizar, TResposta>
  implements IServicoCrud<TCriar, TAtualizar, TResposta>
{
  protected constructor(
    protected readonly repositorio: IRepositorio<TEntidade>,
    private readonly mensagemNaoEncontrado: string
  ) {}

  async listar(paginacao: ParametrosPaginacao, contexto: ContextoRequisicao): Promise<Paginado<TResposta>> {
    const { itens, total } = await this.repositorio.listar(paginacao, this.escopo(contexto));
    return { data: itens.map((entidade) => entidade.paraResposta()), meta: montarMeta(paginacao, total) };
  }

  async buscar(id: string, contexto: ContextoRequisicao): Promise<TResposta> {
    return (await this.obterOuFalhar(id, contexto)).paraResposta();
  }

  async criar(dados: TCriar, contexto: ContextoRequisicao): Promise<TResposta> {
    await this.validarCriacao(dados, contexto);
    const entidade = await this.construir(dados, contexto);
    const criada = await this.repositorio.criar(entidade);
    return criada.paraResposta();
  }

  async atualizar(id: string, dados: TAtualizar, contexto: ContextoRequisicao): Promise<TResposta> {
    const entidade = await this.obterOuFalhar(id, contexto);
    await this.validarAtualizacao(entidade, dados, contexto);
    await this.aplicarAtualizacao(entidade, dados, contexto);
    const salva = await this.repositorio.atualizar(entidade);
    return salva.paraResposta();
  }

  async remover(id: string, contexto: ContextoRequisicao): Promise<void> {
    const entidade = await this.obterOuFalhar(id, contexto);
    await this.validarRemocao(entidade, contexto);
    await this.repositorio.remover(id);
  }

  /** Busca respeitando o escopo; se não existir (ou for de outro dono) → 404. */
  protected async obterOuFalhar(id: string, contexto: ContextoRequisicao): Promise<TEntidade> {
    const entidade = await this.repositorio.buscarPorId(id, this.escopo(contexto));
    if (!entidade) throw new NotFoundError(this.mensagemNaoEncontrado);
    return entidade;
  }

  // ---- Ganchos -------------------------------------------------------------------------

  /** Recursos com dono sobrescrevem para filtrar pelo usuário do token. */
  protected escopo(_contexto: ContextoRequisicao): Escopo | undefined {
    return undefined;
  }

  protected async validarCriacao(_dados: TCriar, _contexto: ContextoRequisicao): Promise<void> {}

  protected async validarAtualizacao(_entidade: TEntidade, _dados: TAtualizar, _contexto: ContextoRequisicao): Promise<void> {}

  protected async validarRemocao(_entidade: TEntidade, _contexto: ContextoRequisicao): Promise<void> {}

  protected abstract construir(dados: TCriar, contexto: ContextoRequisicao): Promise<TEntidade> | TEntidade;

  protected abstract aplicarAtualizacao(entidade: TEntidade, dados: TAtualizar, contexto: ContextoRequisicao): Promise<void> | void;
}
