/** Espelho dos contratos do backend (respostas e payloads de cada CRUD). */

interface Registro {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Categoria extends Registro {
  nome: string;
  descricao: string | null;
}
export type CategoriaPayload = Pick<Categoria, "nome" | "descricao">;

export interface Produto extends Registro {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  disponivel: boolean;
  categoriaId: string;
  categoria: { id: string; nome: string } | null;
}
export type ProdutoPayload = Pick<Produto, "nome" | "descricao" | "preco" | "estoque" | "imagemUrl" | "ativo" | "categoriaId">;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PR", "PB", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;
export type UF = (typeof UFS)[number];

export interface Endereco extends Registro {
  usuarioId: string;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: UF;
}
/** O dono vem do token: nunca é enviado. */
export type EnderecoPayload = Omit<Endereco, keyof Registro | "usuarioId">;

export const STATUS_PEDIDO = ["PENDENTE", "PAGO", "ENVIADO", "CANCELADO"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  CANCELADO: "Cancelado"
};

export interface ItemPedido {
  produtoId: string;
  produtoNome: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido extends Registro {
  usuarioId: string;
  enderecoId: string;
  endereco: { id: string; apelido: string } | null;
  status: StatusPedido;
  itens: ItemPedido[];
  quantidadeItens: number;
  total: number;
  podeEditar: boolean;
  proximosStatus: StatusPedido[];
}

export type ItemPedidoPayload = Pick<ItemPedido, "produtoId" | "quantidade">;
export interface CriarPedidoPayload {
  enderecoId: string;
  itens: ItemPedidoPayload[];
}
export type AtualizarPedidoPayload = Partial<CriarPedidoPayload & { status: StatusPedido }>;
