import { Router } from "express";
import { authController } from "../container.js";

export const authRoutes = Router();
authRoutes.post("/auth/login", authController.login);
