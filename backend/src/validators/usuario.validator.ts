import { z } from "zod";
import { isValidCpf, normalizeCpf } from "./cpf.js";
import { isStrongPassword } from "./password.js";

export const cadastroUsuarioSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome completo.")
      .max(120, "Nome deve ter no máximo 120 caracteres."),
    email: z
      .string()
      .trim()
      .email("Informe um e-mail válido.")
      .max(254, "E-mail deve ter no máximo 254 caracteres.")
      .transform((email) => email.toLowerCase()),
    senha: z
      .string()
      .refine(isStrongPassword, "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial."),
    cpf: z
      .string()
      .refine(isValidCpf, "Informe um CPF válido.")
      .transform(normalizeCpf)
  })
  .strict();

export type CadastroUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;
