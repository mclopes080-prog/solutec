import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { catalogoRoutes } from "./routes/catalogo.routes.js";
import { categoriaRoutes } from "./routes/categoria.routes.js";
import { enderecoRoutes } from "./routes/endereco.routes.js";
import { pedidoRoutes } from "./routes/pedido.routes.js";
import { produtoRoutes } from "./routes/produto.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { healthRoutes } from "./routes/health.routes.js";
import { usuarioRoutes } from "./routes/usuario.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: "32kb" }));
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/enderecos", enderecoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api", catalogoRoutes);
app.use(notFound);
app.use(errorHandler);
