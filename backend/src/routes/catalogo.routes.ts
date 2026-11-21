import { Router } from "express";
import { catalogoController } from "../container.js";

/** Vitrine pública somente leitura (sem token): produtos ativos, paginados. */
export const catalogoRoutes = Router();
catalogoRoutes.get("/catalogo", catalogoController.listar);
