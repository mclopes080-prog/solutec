import { arredondarMoeda, erroDeCampo, textoObrigatorio } from "./validacoes.js";

export interface ItemPedidoProps {
  produtoId: string;
  produtoNome?: string | undefined;
  quantidade: number;
  /** Preço do produto no momento do pedido ("congelado"). */
  precoUnitario: number;
}

export interface ItemPedidoResposta {
  produtoId: string;
  produtoNome: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

const QUANTIDADE_MAXIMA = 999;

/**
 * Objeto de valor do agregado Pedido: não tem identidade própria no domínio (é salvo e
 * substituído sempre junto com o pedido) e é imutável depois de criado.
 */
export class ItemPedido {
  readonly #produtoId: string;
  readonly #produtoNome: string | undefined;
  readonly #quantidade: number;
  readonly #precoUnitario: number;

  constructor(props: ItemPedidoProps) {
    if (!Number.isInteger(props.quantidade) || props.quantidade < 1 || props.quantidade > QUANTIDADE_MAXIMA) {
      throw erroDeCampo("itens", `A quantidade deve ser um inteiro entre 1 e ${QUANTIDADE_MAXIMA}.`);
    }
    if (!Number.isFinite(props.precoUnitario) || props.precoUnitario <= 0) {
      throw erroDeCampo("itens", "O preço unitário deve ser maior que zero.");
    }
    this.#produtoId = textoObrigatorio(props.produtoId, "itens", "Produto", 1, 191);
    this.#produtoNome = props.produtoNome;
    this.#quantidade = props.quantidade;
    this.#precoUnitario = arredondarMoeda(props.precoUnitario);
  }

  get produtoId(): string { return this.#produtoId; }
  get quantidade(): number { return this.#quantidade; }
  get precoUnitario(): number { return this.#precoUnitario; }

  /** Calculado em centavos para evitar 0,1 + 0,2 = 0,30000000000000004. */
  get subtotalEmCentavos(): number {
    return Math.round(this.#precoUnitario * 100) * this.#quantidade;
  }

  get subtotal(): number {
    return this.subtotalEmCentavos / 100;
  }

  paraPersistencia(): Omit<ItemPedidoProps, "produtoNome"> {
    return { produtoId: this.#produtoId, quantidade: this.#quantidade, precoUnitario: this.#precoUnitario };
  }

  paraResposta(): ItemPedidoResposta {
    return { ...this.paraPersistencia(), produtoNome: this.#produtoNome ?? null, subtotal: this.subtotal };
  }
}
