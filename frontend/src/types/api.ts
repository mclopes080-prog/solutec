export interface ApiFieldErrors {
  [field: string]: string[] | undefined;
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; fields?: ApiFieldErrors };
}

export interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface MetaPaginacao {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Espelha `Paginado<T>` do backend. */
export interface Paginado<T> {
  success: true;
  data: T[];
  meta: MetaPaginacao;
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  criadoEm: string;
}

export type CadastroResponse = ApiResponse<{ usuario: UsuarioPublico }>;
export type UsuarioResponse = ApiResponse<{ usuario: UsuarioPublico }>;
export type LoginResponse = ApiResponse<{ token: string; usuario: UsuarioPublico }>;
