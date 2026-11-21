import type { CategoriaResposta, DadosCategoria } from "../entities/Categoria.js";
import type { CategoriaService } from "../services/CategoriaService.js";
import { categoriaSchema } from "../validators/categoria.validator.js";
import { CrudController } from "./CrudController.js";

/** Categorias: nome único, 1:N produtos. Herda o fluxo HTTP de CrudController; aqui só entram schemas e mensagens do recurso. */
export class CategoriaController extends CrudController<DadosCategoria, DadosCategoria, CategoriaResposta> {
  constructor(servico: CategoriaService) {
    super(
      servico,
      { criar: categoriaSchema, atualizar: categoriaSchema },
      { criado: "Categoria cadastrada.", atualizado: "Categoria atualizada." }
    );
  }
}
