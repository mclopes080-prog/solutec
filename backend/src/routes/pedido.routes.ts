import { autenticar, pedidoController } from "../container.js";
import { criarRotasCrud } from "./crud.routes.js";

/** /api/pedidos — GET (paginado), GET /:id, POST, PUT /:id, DELETE /:id; todas exigem token. */
export const pedidoRoutes = criarRotasCrud(pedidoController, autenticar);
