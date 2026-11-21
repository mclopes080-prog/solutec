import { z } from "zod";
import type { DadosCategoria } from "../entities/Categoria.js";
import { texto, textoOpcional } from "./comum.validator.js";

export const categoriaSchema = z
  .object({
    nome: texto("o nome", 80).min(2, "Nome deve ter ao menos 2 caracteres."),
    descricao: textoOpcional(255)
  })
  .strict() satisfies z.ZodType<DadosCategoria>;
