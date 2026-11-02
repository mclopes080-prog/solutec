import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL não configurada."),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12)
});

export const env = envSchema.parse(process.env);
