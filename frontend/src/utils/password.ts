export type CriterioSenha = "8 caracteres" | "Letra maiúscula" | "Letra minúscula" | "Número" | "Caractere especial";

export const getPasswordCriteria = (password: string): Record<CriterioSenha, boolean> => ({
  "8 caracteres": password.length >= 8,
  "Letra maiúscula": /[A-Z]/.test(password),
  "Letra minúscula": /[a-z]/.test(password),
  "Número": /\d/.test(password),
  "Caractere especial": /[^A-Za-z0-9]/.test(password)
});

export const isStrongPassword = (password: string): boolean =>
  Object.values(getPasswordCriteria(password)).every(Boolean);
