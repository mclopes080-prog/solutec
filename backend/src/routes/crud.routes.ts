import { Router, type RequestHandler } from "express";
import type { CrudController } from "../controllers/CrudController.js";

/** Monta as 5 rotas REST de um recurso, todas atrás do middleware de autenticação. */
export const criarRotasCrud = <TCriar, TAtualizar, TResposta>(
  controller: CrudController<TCriar, TAtualizar, TResposta>,
  autenticar: RequestHandler
): Router => {
  const router = Router();
  router.use(autenticar);
  router.get("/", controller.listar);
  router.get("/:id", controller.buscar);
  router.post("/", controller.criar);
  router.put("/:id", controller.atualizar);
  router.delete("/:id", controller.remover);
  return router;
};
