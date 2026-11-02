export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR", fields);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 409, "CONFLICT", fields);
  }
}
