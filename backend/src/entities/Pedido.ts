import { BusinessRuleError } from "../errors/AppError.js";
import { REGRAS_STATUS, podeTransicionar } from "../services/pedido/transicoesStatus.js";
import { Entidade, type DadosEntidade } from "./Entidade.js";
import { ItemPedido, type ItemPedidoResposta } from "./ItemPedido.js";
import type { StatusPedido } from "./StatusPedido.js";
import { erroDeCampo, textoObrigatorio } from "./validacoes.js";

export interface PedidoProps extends DadosEntidade {
  usuarioId: string;
  enderecoId: string;
  status: StatusPedido;
  itens: ItemPedido[];
  enderecoApelido?: string | undefined;
}

/** O que o cliente envia por item: o preço NÃO vem do cliente, é congelado pelo servidor. */
export type ItemPedidoEntrada = Pick<ItemPedidoResposta, "produtoId" | "quantidade">;

export type CriarPedidoDTO = Pick<PedidoProps, "enderecoId"> & { itens: ItemPedidoEntrada[] };

export type AtualizarPedidoDTO = Partial<Pick<PedidoProps, "status" | "enderecoId"> & { itens: ItemPedidoEntrada[] }>;

export interface PedidoResposta {
  id: string;
  usuarioId: string;
  enderecoId: string;
  endereco: { id: string; apelido: string } | null;
  status: StatusPedido;
  itens: ItemPedidoResposta[];
  quantidadeItens: number;
  total: number;
  podeEditar: boolean;
  proximosStatus: readonly StatusPedido[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export class Pedido extends Entidade<PedidoResposta> {
  readonly #usuarioId: string;
  #enderecoId: string;
  #status: StatusPedido;
  #itens: ItemPedido[] = [];
  readonly #enderecoApelido: string | undefined;

  constructor(props: PedidoProps) {
    super(props);
    this.#usuarioId = textoObrigatorio(props.usuarioId, "usuarioId", "Usuário", 1, 191);
    this.#enderecoId = textoObrigatorio(props.enderecoId, "enderecoId", "Endereço", 1, 191);
    this.#status = props.status;
    this.#enderecoApelido = props.enderecoApelido;
    this.#definirItens(props.itens);
  }

  get usuarioId(): string { return this.#usuarioId; }
  get enderecoId(): string { return this.#enderecoId; }
  get status(): StatusPedido { return this.#status; }

  /** Cópia: quem lê não consegue mexer na lista interna. */
  get itens(): readonly ItemPedido[] {
    return [...this.#itens];
  }

  /** Getter calculado, sem setter: o total é sempre a soma dos itens. */
  get total(): number {
    return this.#itens.reduce((soma, item) => soma + item.subtotalEmCentavos, 0) / 100;
  }

  get editavel(): boolean {
    return REGRAS_STATUS[this.#status].editavel;
  }

  get removivel(): boolean {
    return REGRAS_STATUS[this.#status].removivel;
  }

  alterarStatus(novo: StatusPedido): void {
    if (novo === this.#status) return;
    if (!podeTransicionar(this.#status, novo)) {
      const mensagem = `Não é possível mudar o pedido de ${this.#status} para ${novo}.`;
      throw new BusinessRuleError(mensagem, { status: [mensagem] });
    }
    this.#status = novo;
  }

  alterarEndereco(enderecoId: string): void {
    this.#exigirEditavel();
    this.#enderecoId = textoObrigatorio(enderecoId, "enderecoId", "Endereço", 1, 191);
  }

  substituirItens(itens: ItemPedido[]): void {
    this.#exigirEditavel();
    this.#definirItens(itens);
  }

  #definirItens(itens: ItemPedido[]): void {
    if (itens.length === 0) throw erroDeCampo("itens", "O pedido precisa de ao menos um item.");
    const produtos = new Set(itens.map((item) => item.produtoId));
    if (produtos.size !== itens.length) throw erroDeCampo("itens", "Não repita o mesmo produto; ajuste a quantidade.");
    this.#itens = [...itens];
  }

  #exigirEditavel(): void {
    if (!this.editavel) {
      throw new BusinessRuleError(`Pedido ${this.#status} não pode ter endereço ou itens alterados.`);
    }
  }

  paraPersistencia(): { usuarioId: string; enderecoId: string; status: StatusPedido; itens: ReturnType<ItemPedido["paraPersistencia"]>[] } {
    return {
      usuarioId: this.#usuarioId,
      enderecoId: this.#enderecoId,
      status: this.#status,
      itens: this.#itens.map((item) => item.paraPersistencia())
    };
  }

  paraResposta(): PedidoResposta {
    return {
      ...this.metadados(),
      usuarioId: this.#usuarioId,
      enderecoId: this.#enderecoId,
      endereco: this.#enderecoApelido ? { id: this.#enderecoId, apelido: this.#enderecoApelido } : null,
      status: this.#status,
      itens: this.#itens.map((item) => item.paraResposta()),
      quantidadeItens: this.#itens.reduce((soma, item) => soma + item.quantidade, 0),
      total: this.total,
      podeEditar: this.editavel,
      proximosStatus: REGRAS_STATUS[this.#status].proximos
    };
  }
}
