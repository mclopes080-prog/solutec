import type { AtualizarPedidoDTO, CriarPedidoDTO, PedidoResposta } from "../entities/Pedido.js";
import type { PedidoService } from "../services/PedidoService.js";
import { atualizarPedidoSchema, criarPedidoSchema } from "../validators/pedido.validator.js";
import { CrudController } from "./CrudController.js";

/** Pedidos do usuário logado; PUT parcial (status, endereço e/ou itens). Herda o fluxo HTTP de CrudController; aqui só entram schemas e mensagens do recurso. */
export class PedidoController extends CrudController<CriarPedidoDTO, AtualizarPedidoDTO, PedidoResposta> {
  constructor(servico: PedidoService) {
    super(
      servico,
      { criar: criarPedidoSchema, atualizar: atualizarPedidoSchema },
      { criado: "Pedido criado.", atualizado: "Pedido atualizado." }
    );
  }
}
