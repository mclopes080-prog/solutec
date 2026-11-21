import { autenticar, enderecoController } from "../container.js";
import { criarRotasCrud } from "./crud.routes.js";

/** /api/enderecos — GET (paginado), GET /:id, POST, PUT /:id, DELETE /:id; todas exigem token. */
export const enderecoRoutes = criarRotasCrud(enderecoController, autenticar);
