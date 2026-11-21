/** Valores possíveis do status do pedido. As regras de transição ficam em services/pedido/transicoesStatus.ts. */
export const STATUS_PEDIDO = ["PENDENTE", "PAGO", "ENVIADO", "CANCELADO"] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];
