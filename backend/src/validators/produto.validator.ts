import { z } from "zod";
import type { DadosProduto } from "../entities/Produto.js";
import { texto, textoOpcional } from "./comum.validator.js";

export const produtoSchema = z
  .object({
    nome: texto("o nome", 120).min(2, "Nome deve ter ao menos 2 caracteres."),
    descricao: texto("a descrição", 2000),
    preco: z.number("Informe o preço.").positive("O preço deve ser maior que zero."),
    estoque: z.number("Informe o estoque.").int("O estoque deve ser inteiro.").min(0, "O estoque não pode ser negativo."),
    imagemUrl: textoOpcional(255),
    ativo: z.boolean("Informe se o produto está ativo.").default(true),
    categoriaId: texto("a categoria", 191)
  })
  .strict() satisfies z.ZodType<DadosProduto>;
