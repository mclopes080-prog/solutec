import { autenticar, produtoController } from "../container.js";
import { criarRotasCrud } from "./crud.routes.js";

/** /api/produtos — GET (paginado), GET /:id, POST, PUT /:id, DELETE /:id; todas exigem token. */
export const produtoRoutes = criarRotasCrud(produtoController, autenticar);
