import type { DadosProduto, ProdutoResposta } from "../entities/Produto.js";
import type { ProdutoService } from "../services/ProdutoService.js";
import { produtoSchema } from "../validators/produto.validator.js";
import { CrudController } from "./CrudController.js";

/** Produtos: preço > 0, estoque ≥ 0, N:1 categoria. Herda o fluxo HTTP de CrudController; aqui só entram schemas e mensagens do recurso. */
export class ProdutoController extends CrudController<DadosProduto, DadosProduto, ProdutoResposta> {
  constructor(servico: ProdutoService) {
    super(
      servico,
      { criar: produtoSchema, atualizar: produtoSchema },
      { criado: "Produto cadastrado.", atualizado: "Produto atualizado." }
    );
  }
}
