const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const formatarMoeda = (valor: number): string => moeda.format(valor);
export const formatarData = (iso: string): string => data.format(new Date(iso));

export const maskCep = (valor: string): string =>
  valor.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

export const PLACEHOLDER_PRODUTO = "/img/produtos/placeholder.svg";

/** Código curto e legível para exibir pedidos. */
export const codigoCurto = (id: string): string => `#${id.slice(-6).toUpperCase()}`;
