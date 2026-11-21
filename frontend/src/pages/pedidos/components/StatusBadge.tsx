import crud from "../../../styles/crud.module.css";
import { ROTULO_STATUS, type StatusPedido } from "../../../types/recursos";

const COR: Record<StatusPedido, string | undefined> = {
  PENDENTE: crud.alerta,
  PAGO: crud.info,
  ENVIADO: crud.ok,
  CANCELADO: crud.neutro
};

/** Selo colorido do status do pedido (exclusivo das telas de pedidos). */
export function StatusBadge({ status }: { status: StatusPedido }) {
  return <span className={`${crud.badge} ${COR[status] ?? ""}`}>{ROTULO_STATUS[status]}</span>;
}
