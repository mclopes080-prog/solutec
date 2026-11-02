export const getPasswordCriteria = (password: string) => ({
  "8 caracteres": password.length >= 8,
  "Letra maiúscula": /[A-Z]/.test(password),
  "Letra minúscula": /[a-z]/.test(password),
  "Número": /\d/.test(password),
  "Caractere especial": /[^A-Za-z0-9]/.test(password)
});
