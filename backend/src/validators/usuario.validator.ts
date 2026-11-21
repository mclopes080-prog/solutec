import { z } from "zod";
import { ValidationError } from "../errors/AppError.js";
import { isValidCpf, normalizeCpf } from "./cpf.js";
import { EMAIL_REGEX, MENSAGEM_EMAIL_INVALIDO } from "./email.js";
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
      .max(254, "E-mail deve ter no máximo 254 caracteres.")
      .email(MENSAGEM_EMAIL_INVALIDO)
      .regex(EMAIL_REGEX, MENSAGEM_EMAIL_INVALIDO)
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

const MENSAGEM_SENHA_FRACA =
  "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.";

export const MENSAGEM_EMAIL_IMUTAVEL = "O e-mail não pode ser alterado.";

/** PUT /usuarios/me: todos os campos são obrigatórios e o e-mail não faz parte do contrato. */
export const editarUsuarioSchema = z
  .object({
    nome: z
      .string("Informe o nome completo.")
      .trim()
      .min(2, "Informe o nome completo.")
      .max(120, "Nome deve ter no máximo 120 caracteres."),
    cpf: z.string("Informe o CPF.").refine(isValidCpf, "Informe um CPF válido.").transform(normalizeCpf),
    senha: z.string("Informe a nova senha.").refine(isStrongPassword, MENSAGEM_SENHA_FRACA),
    confirmacaoSenha: z.string("Confirme a senha.").min(1, "Confirme a senha.")
  })
  .strict()
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    path: ["confirmacaoSenha"],
    message: "As senhas não coincidem."
  });

export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;

/** Checagem explícita antes do Zod para devolver a mensagem de negócio pedida no campo `email`. */
export const parseEditarUsuario = (body: unknown): EditarUsuarioInput => {
  if (typeof body === "object" && body !== null && Object.hasOwn(body, "email")) {
    throw new ValidationError(MENSAGEM_EMAIL_IMUTAVEL, { email: [MENSAGEM_EMAIL_IMUTAVEL] });
  }
  return editarUsuarioSchema.parse(body);
};
