export interface ApiFieldErrors { [field: string]: string[] | undefined }

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; fields?: ApiFieldErrors };
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  criadoEm: string;
}

export interface CadastroResponse {
  success: true;
  message: string;
  data: { usuario: UsuarioPublico };
}
