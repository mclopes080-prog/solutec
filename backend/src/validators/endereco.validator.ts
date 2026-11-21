import { z } from "zod";
import { UFS, type DadosEndereco } from "../entities/Endereco.js";
import { texto, textoOpcional } from "./comum.validator.js";

export const enderecoSchema = z
  .object({
    apelido: texto("um apelido", 60),
    cep: z
      .string("Informe o CEP.")
      .transform((cep) => cep.replace(/\D/g, ""))
      .refine((cep) => /^\d{8}$/.test(cep), "O CEP deve ter 8 dígitos."),
    logradouro: texto("o logradouro", 150),
    numero: texto("o número", 10),
    complemento: textoOpcional(80),
    bairro: texto("o bairro", 80),
    cidade: texto("a cidade", 80),
    uf: z
      .string("Informe a UF.")
      .trim()
      .toUpperCase()
      .pipe(z.enum(UFS, "Informe uma UF válida."))
  })
  .strict() satisfies z.ZodType<DadosEndereco>;
