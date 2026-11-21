import { z } from "zod";
import { EMAIL_REGEX, MENSAGEM_EMAIL_INVALIDO } from "./email.js";

export const loginSchema = z
  .object({
    email: z
      .string(MENSAGEM_EMAIL_INVALIDO)
      .trim()
      .toLowerCase()
      .max(254, MENSAGEM_EMAIL_INVALIDO)
      .email(MENSAGEM_EMAIL_INVALIDO)
      .regex(EMAIL_REGEX, MENSAGEM_EMAIL_INVALIDO),
    senha: z.string("Informe a senha.").min(1, "Informe a senha.").max(128, "Senha inválida.")
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
