import { ValidationError } from "./error";
import { VALIDATION_RULES, AUTH_CONFIG } from "../constants";

export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= AUTH_CONFIG.MIN_PASSWORD_LENGTH;
}

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string,
): void {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
    );
  }
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string,
): void {
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`,
    );
  }
}

export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  message?: string,
): void {
  if (!pattern.test(value)) {
    throw new ValidationError(message || `${fieldName} format is invalid`);
  }
}

export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
): void {
  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
  }
}
