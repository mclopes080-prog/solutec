import type { Request, Response } from "express";
import type { ProdutoService } from "../services/ProdutoService.js";
import { paginacaoSchema } from "../validators/comum.validator.js";

/** Vitrine pública (sem token): apenas leitura de produtos ativos. */
export class CatalogoController {
  constructor(private readonly produtos: ProdutoService) {}

  listar = async (request: Request, response: Response): Promise<void> => {
    const paginacao = paginacaoSchema.parse(request.query);
    response.status(200).json({ success: true, ...(await this.produtos.listarCatalogo(paginacao)) });
  };
}
