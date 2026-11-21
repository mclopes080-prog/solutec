import type { StatusPedido } from "../../entities/StatusPedido.js";

export interface RegraStatus {
  /** Para quais status o pedido pode ir a partir deste. */
  readonly proximos: readonly StatusPedido[];
  /** Endereço e itens ainda podem ser alterados? */
  readonly editavel: boolean;
  /** O pedido pode ser excluído? */
  readonly removivel: boolean;
}

/**
 * Tabela de regras (Open/Closed): criar um status novo, ou mudar uma transição, é editar
 * esta tabela. Nenhum `if/else` encadeado no serviço ou na entidade precisa mudar.
 * PENDENTE → PAGO | CANCELADO; PAGO → ENVIADO | CANCELADO; ENVIADO e CANCELADO são finais.
 */
export const REGRAS_STATUS: Readonly<Record<StatusPedido, RegraStatus>> = {
  PENDENTE: { proximos: ["PAGO", "CANCELADO"], editavel: true, removivel: true },
  PAGO: { proximos: ["ENVIADO", "CANCELADO"], editavel: false, removivel: false },
  ENVIADO: { proximos: [], editavel: false, removivel: false },
  CANCELADO: { proximos: [], editavel: false, removivel: true }
};

export const podeTransicionar = (de: StatusPedido, para: StatusPedido): boolean =>
  REGRAS_STATUS[de].proximos.includes(para);
