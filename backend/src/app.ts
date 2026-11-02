import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { healthRoutes } from "./routes/health.routes.js";
import { usuarioRoutes } from "./routes/usuario.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: "32kb" }));
app.use("/api", healthRoutes);
app.use("/api", usuarioRoutes);
app.use(notFound);
app.use(errorHandler);
