// Declaration merging: o middleware `autenticar` injeta o id do usuário logado na requisição.
declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
    }
  }
}

export {};
