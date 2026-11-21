import { Router } from "express";
import { autenticar, usuarioController } from "../container.js";

export const usuarioRoutes = Router();
usuarioRoutes.post("/usuarios/cadastro", usuarioController.cadastro);
usuarioRoutes.get("/usuarios/me", autenticar, usuarioController.me);
usuarioRoutes.put("/usuarios/me", autenticar, usuarioController.atualizarMe);
