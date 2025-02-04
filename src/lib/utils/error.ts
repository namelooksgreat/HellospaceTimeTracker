export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleError(error: unknown): never {
  console.error("Error:", error);

  if (
    error instanceof APIError ||
    error instanceof AuthError ||
    error instanceof ValidationError
  ) {
    throw error;
  }

  if (error instanceof Error) {
    throw new APIError(error.message);
  }

  throw new APIError("An unexpected error occurred");
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
