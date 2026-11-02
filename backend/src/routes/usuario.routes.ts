import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController.js";
import { PrismaUsuarioRepository } from "../repositories/PrismaUsuarioRepository.js";
import { CadastrarUsuarioService } from "../services/CadastrarUsuarioService.js";
import { BcryptPasswordHasher } from "../services/passwordHasher.js";

const repository = new PrismaUsuarioRepository();
const service = new CadastrarUsuarioService(repository, new BcryptPasswordHasher());
const controller = new UsuarioController(service);

export const usuarioRoutes = Router();
usuarioRoutes.post("/usuarios/cadastro", controller.cadastro);
