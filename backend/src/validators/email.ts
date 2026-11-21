/**
 * Regex de e-mail usada no backend e espelhada no frontend (frontend/src/utils/email.ts).
 * Exige parte local, "@", domínio e TLD com ao menos 2 letras.
 */
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export const MENSAGEM_EMAIL_INVALIDO = "Informe um e-mail válido.";
