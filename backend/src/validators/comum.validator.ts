import { z } from "zod";
import type { ParametrosPaginacao } from "../types/paginacao.js";

export const LIMITE_MAXIMO = 100;

export const paginacaoSchema = z.object({
  page: z.coerce.number().int().min(1, "page deve ser >= 1.").default(1),
  limit: z.coerce.number().int().min(1, "limit deve ser >= 1.").max(LIMITE_MAXIMO, `limit deve ser <= ${LIMITE_MAXIMO}.`).default(10)
}) satisfies z.ZodType<ParametrosPaginacao>;

export const idParamSchema = z.object({ id: z.string().trim().min(1).max(191) });

export const texto = (rotulo: string, max: number) =>
  z.string(`Informe ${rotulo}.`).trim().min(1, `Informe ${rotulo}.`).max(max, `Máximo de ${max} caracteres.`);

/** Opcional: ausente, null ou vazio viram `null`. */
export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null));
