import { ItemPedido } from "../entities/ItemPedido.js";
import {
  Pedido,
  type AtualizarPedidoDTO,
  type CriarPedidoDTO,
  type ItemPedidoEntrada,
  type PedidoResposta
} from "../entities/Pedido.js";
import { BusinessRuleError } from "../errors/AppError.js";
import type { Escopo } from "../repositories/IRepositorio.js";
import type { IEnderecoRepository, IPedidoRepository, IProdutoRepository } from "../repositories/interfaces.js";
import { CrudService, type ContextoRequisicao } from "./CrudService.js";

export class PedidoService extends CrudService<Pedido, CriarPedidoDTO, AtualizarPedidoDTO, PedidoResposta> {
  constructor(
    pedidos: IPedidoRepository,
    private readonly produtos: IProdutoRepository,
    private readonly enderecos: IEnderecoRepository
  ) {
    super(pedidos, "Pedido não encontrado.");
  }

  protected override escopo(contexto: ContextoRequisicao): Escopo {
    return { usuarioId: contexto.usuarioId };
  }

  protected override async validarCriacao(dados: CriarPedidoDTO, contexto: ContextoRequisicao): Promise<void> {
    await this.#garantirEnderecoDoUsuario(dados.enderecoId, contexto);
  }

  protected override async construir(dados: CriarPedidoDTO, contexto: ContextoRequisicao): Promise<Pedido> {
    return new Pedido({
      usuarioId: contexto.usuarioId,
      enderecoId: dados.enderecoId,
      status: "PENDENTE",
      itens: await this.#montarItens(dados.itens)
    });
  }

  protected override async validarAtualizacao(_pedido: Pedido, dados: AtualizarPedidoDTO, contexto: ContextoRequisicao): Promise<void> {
    if (dados.enderecoId !== undefined) await this.#garantirEnderecoDoUsuario(dados.enderecoId, contexto);
  }

  /** Endereço e itens primeiro (só valem em pedido editável), depois a transição de status. */
  protected override async aplicarAtualizacao(pedido: Pedido, dados: AtualizarPedidoDTO): Promise<void> {
    if (dados.enderecoId !== undefined) pedido.alterarEndereco(dados.enderecoId);
    if (dados.itens !== undefined) pedido.substituirItens(await this.#montarItens(dados.itens));
    if (dados.status !== undefined) pedido.alterarStatus(dados.status);
  }

  protected override async validarRemocao(pedido: Pedido): Promise<void> {
    if (!pedido.removivel) {
      throw new BusinessRuleError(`Pedido ${pedido.status} não pode ser excluído; cancele-o antes.`);
    }
  }

  /** Congela o preço atual de cada produto; o cliente nunca envia preço. */
  async #montarItens(entrada: readonly ItemPedidoEntrada[]): Promise<ItemPedido[]> {
    const produtos = await this.produtos.buscarPorIds(entrada.map((item) => item.produtoId));
    const porId = new Map(produtos.map((produto) => [produto.id, produto]));

    return entrada.map((item) => {
      const produto = porId.get(item.produtoId);
      if (!produto) {
        throw new BusinessRuleError("Produto do pedido não existe.", { itens: [`Produto ${item.produtoId} não existe.`] });
      }
      if (!produto.ativo) {
        throw new BusinessRuleError("Produto inativo não pode ser pedido.", { itens: [`${produto.nome} está inativo.`] });
      }
      return new ItemPedido({
        produtoId: item.produtoId,
        produtoNome: produto.nome,
        quantidade: item.quantidade,
        precoUnitario: produto.preco
      });
    });
  }

  async #garantirEnderecoDoUsuario(enderecoId: string, contexto: ContextoRequisicao): Promise<void> {
    if (!(await this.enderecos.buscarPorId(enderecoId, this.escopo(contexto)))) {
      throw new BusinessRuleError("Endereço não encontrado.", { enderecoId: ["Selecione um dos seus endereços."] });
    }
  }
}
