export type PasswordCriterion = "length" | "uppercase" | "lowercase" | "number" | "special";

export const getPasswordCriteria = (password: string): Record<PasswordCriterion, boolean> => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password)
});

export const isStrongPassword = (password: string): boolean =>
  Object.values(getPasswordCriteria(password)).every(Boolean);
