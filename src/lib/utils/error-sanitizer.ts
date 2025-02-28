/**
 * Error sanitization utility to prevent information disclosure in error responses
 */
import { secureLogger, sanitizeErrorMessage } from "./secure-logging";

// Define error types that are safe to show to users
type SafeErrorCode =
  | "auth/invalid-credentials"
  | "auth/user-not-found"
  | "auth/email-already-in-use"
  | "validation/invalid-input"
  | "resource/not-found"
  | "permission/denied"
  | "server/unavailable"
  | "unknown";

interface SafeError {
  code: SafeErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// Map of internal error messages to user-friendly messages
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Authentication errors
  "auth/invalid-email": "Geçersiz e-posta formatı.",
  "auth/user-disabled": "Bu hesap devre dışı bırakılmıştır.",
  "auth/user-not-found": "E-posta veya şifre hatalı.",
  "auth/wrong-password": "E-posta veya şifre hatalı.",
  "auth/email-already-in-use": "Bu e-posta adresi zaten kullanımda.",
  "auth/weak-password": "Şifre çok zayıf. Daha güçlü bir şifre seçin.",
  "auth/invalid-credential": "Geçersiz kimlik bilgileri.",

  // Database errors - generic messages only
  "db/connection-error": "Veritabanına bağlanırken bir hata oluştu.",
  "db/query-error": "Veri işlenirken bir hata oluştu.",

  // Validation errors
  "validation/invalid-input": "Geçersiz giriş değerleri.",
  "validation/required-field": "Tüm gerekli alanları doldurun.",

  // Permission errors
  "permission/denied": "Bu işlemi gerçekleştirmek için yetkiniz yok.",

  // Resource errors
  "resource/not-found": "İstenen kaynak bulunamadı.",

  // Server errors
  "server/unavailable":
    "Sunucu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",

  // Default error
  unknown: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
};

/**
 * Sanitizes an error to create a safe error response
 * @param error The original error
 * @param defaultCode Default error code to use if none can be determined
 * @returns A sanitized error object safe for client response
 */
export function sanitizeError(
  error: unknown,
  defaultCode: SafeErrorCode = "unknown",
): SafeError {
  // Log the original error (securely)
  secureLogger.error("Original error:", error);

  let errorCode = defaultCode;
  let errorMessage =
    ERROR_MESSAGE_MAP[defaultCode] || ERROR_MESSAGE_MAP["unknown"];
  let errorDetails: Record<string, unknown> | undefined = undefined;

  // Extract error information based on error type
  if (error instanceof Error) {
    // Try to extract error code if available
    if ("code" in error && typeof (error as any).code === "string") {
      const code = (error as any).code as string;
      if (code in ERROR_MESSAGE_MAP) {
        errorCode = code as SafeErrorCode;
        errorMessage = ERROR_MESSAGE_MAP[code];
      }
    }

    // For validation errors, we might want to include sanitized details
    if (errorCode === "validation/invalid-input" && "details" in error) {
      // Only include field names, not the invalid values
      const rawDetails = (error as any).details;
      if (rawDetails && typeof rawDetails === "object") {
        errorDetails = {};
        Object.keys(rawDetails).forEach((key) => {
          errorDetails![key] = "Invalid value";
        });
      }
    }
  } else if (typeof error === "string") {
    // For string errors, check if they match any known error codes
    Object.entries(ERROR_MESSAGE_MAP).forEach(([code, message]) => {
      if (error.includes(code)) {
        errorCode = code as SafeErrorCode;
        errorMessage = message;
      }
    });
  }

  return {
    code: errorCode,
    message: errorMessage,
    ...(errorDetails ? { details: errorDetails } : {}),
  };
}

/**
 * Creates a user-friendly error response
 * @param error The original error
 * @returns A sanitized error response
 */
export function createUserFriendlyError(error: unknown): {
  message: string;
  code: string;
} {
  const safeError = sanitizeError(error);
  return {
    message: safeError.message,
    code: safeError.code,
  };
}
