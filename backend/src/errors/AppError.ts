export type CamposComErro = Record<string, string[]>;

/** Erro de domínio/aplicação que o errorHandler sabe traduzir em resposta HTTP segura. */
export abstract class AppError extends Error {
  protected constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly fields?: CamposComErro
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: CamposComErro) {
    super(message, 400, "VALIDATION_ERROR", fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fields?: CamposComErro) {
    super(message, 409, "CONFLICT", fields);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado.") {
    super(message, 403, "FORBIDDEN");
  }
}

/** Dados bem formados, mas que violam uma regra de negócio (ex.: transição de status proibida). */
export class BusinessRuleError extends AppError {
  constructor(message: string, fields?: CamposComErro) {
    super(message, 422, "BUSINESS_RULE", fields);
  }
}
