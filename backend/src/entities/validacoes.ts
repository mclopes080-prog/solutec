import { ValidationError } from "../errors/AppError.js";

/** Normaliza e valida um texto obrigatório; o erro já sai associado ao campo. */
export const textoObrigatorio = (valor: string, campo: string, rotulo: string, min: number, max: number): string => {
  const texto = valor.trim();
  if (texto.length < min || texto.length > max) {
    const mensagem = `${rotulo} deve ter entre ${min} e ${max} caracteres.`;
    throw new ValidationError(mensagem, { [campo]: [mensagem] });
  }
  return texto;
};

/** Texto opcional: vazio vira `null`. */
export const textoOpcional = (valor: string | null, campo: string, rotulo: string, max: number): string | null => {
  const texto = valor?.trim() ?? "";
  if (texto.length === 0) return null;
  if (texto.length > max) {
    const mensagem = `${rotulo} deve ter no máximo ${max} caracteres.`;
    throw new ValidationError(mensagem, { [campo]: [mensagem] });
  }
  return texto;
};

export const erroDeCampo = (campo: string, mensagem: string): ValidationError =>
  new ValidationError(mensagem, { [campo]: [mensagem] });

/** Soma valores monetários em centavos para não acumular erro de ponto flutuante. */
export const arredondarMoeda = (valor: number): number => Math.round(valor * 100) / 100;
