import { Endereco, type DadosEndereco, type EnderecoResposta } from "../entities/Endereco.js";
import { ConflictError } from "../errors/AppError.js";
import type { Escopo } from "../repositories/IRepositorio.js";
import type { IEnderecoRepository } from "../repositories/interfaces.js";
import { CrudService, type ContextoRequisicao } from "./CrudService.js";

export class EnderecoService extends CrudService<Endereco, DadosEndereco, DadosEndereco, EnderecoResposta> {
  constructor(private readonly enderecos: IEnderecoRepository) {
    super(enderecos, "Endereço não encontrado.");
  }

  /** Ownership: toda leitura/edição/remoção fica restrita ao dono do token. */
  protected override escopo(contexto: ContextoRequisicao): Escopo {
    return { usuarioId: contexto.usuarioId };
  }

  protected override construir(dados: DadosEndereco, contexto: ContextoRequisicao): Endereco {
    return new Endereco({ ...dados, usuarioId: contexto.usuarioId });
  }

  protected override aplicarAtualizacao(entidade: Endereco, dados: DadosEndereco): void {
    entidade.atualizar(dados);
  }

  protected override async validarRemocao(entidade: Endereco): Promise<void> {
    if (entidade.id && (await this.enderecos.possuiPedidos(entidade.id))) {
      throw new ConflictError("Endereço usado em pedidos não pode ser excluído.");
    }
  }
}
