import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL não configurada."),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres."),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]?$/, "JWT_EXPIRES_IN deve ser um número de segundos ou terminar em s, m, h ou d (ex.: 2h).")
    .default("2h")
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
