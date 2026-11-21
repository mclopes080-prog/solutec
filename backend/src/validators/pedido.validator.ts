import { z } from "zod";
import type { AtualizarPedidoDTO, CriarPedidoDTO } from "../entities/Pedido.js";
import { STATUS_PEDIDO } from "../entities/StatusPedido.js";
import { texto } from "./comum.validator.js";

const itensSchema = z
  .array(
    z
      .object({
        produtoId: texto("o produto", 191),
        quantidade: z.number("Informe a quantidade.").int("Quantidade deve ser inteira.").min(1, "Quantidade mínima é 1.").max(999)
      })
      .strict(),
    "Informe os itens."
  )
  .min(1, "O pedido precisa de ao menos um item.")
  .max(50, "Máximo de 50 itens por pedido.");

export const criarPedidoSchema = z
  .object({ enderecoId: texto("o endereço", 191), itens: itensSchema })
  .strict() satisfies z.ZodType<CriarPedidoDTO>;

export const atualizarPedidoSchema = z
  .object({
    status: z.enum(STATUS_PEDIDO, "Status inválido.").optional(),
    enderecoId: texto("o endereço", 191).optional(),
    itens: itensSchema.optional()
  })
  .strict()
  .refine((dados) => Object.values(dados).some((valor) => valor !== undefined), {
    message: "Informe status, enderecoId ou itens.",
    path: ["body"]
  })
  .transform((dados): AtualizarPedidoDTO => ({
    ...(dados.status !== undefined ? { status: dados.status } : {}),
    ...(dados.enderecoId !== undefined ? { enderecoId: dados.enderecoId } : {}),
    ...(dados.itens !== undefined ? { itens: dados.itens } : {})
  }));
