/** Lê a mensagem de sucesso que o formulário deixa no `state` ao voltar para a listagem. */
export const mensagemDaNavegacao = (estado: unknown): string | null =>
  typeof estado === "object" && estado !== null && "mensagem" in estado && typeof estado.mensagem === "string"
    ? estado.mensagem
    : null;
