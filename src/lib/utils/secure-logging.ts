/**
 * Secure logging utility to prevent sensitive information exposure
 */

// Define sensitive data patterns to be masked
const SENSITIVE_PATTERNS = [
  // Email addresses
  /([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g,
  // API keys and tokens (generic pattern)
  /(api[_-]?key|token|secret|password|credential)(["']?\s*[=:]\s*["']?)([^"'\s]+)/gi,
  // Credit card numbers
  /\b(?:\d[ -]*?){13,16}\b/g,
  // JWT tokens
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
  // Supabase specific keys
  /SUPABASE[_-]?(URL|KEY|ANON[_-]?KEY|SERVICE[_-]?KEY)(["']?\s*[=:]\s*["']?)([^"'\s]+)/gi,
];

/**
 * Masks sensitive information in a string
 * @param data The data to mask
 * @returns Masked data
 */
export function maskSensitiveData(data: string): string {
  let maskedData = data;

  SENSITIVE_PATTERNS.forEach((pattern) => {
    if (pattern.test(maskedData)) {
      if (
        pattern
          .toString()
          .includes("api[_-]?key|token|secret|password|credential")
      ) {
        // For API keys, tokens, etc. - mask the value part
        maskedData = maskedData.replace(pattern, "$1$2*****REDACTED*****");
      } else if (pattern.toString().includes("SUPABASE")) {
        // For Supabase keys - mask the value part
        maskedData = maskedData.replace(pattern, "$1$2*****REDACTED*****");
      } else if (pattern.toString().includes("eyJ")) {
        // For JWT tokens
        maskedData = maskedData.replace(pattern, "*****JWT-REDACTED*****");
      } else if (pattern.toString().includes("\\b(?:\\d[ -]*?){13,16}\\b")) {
        // For credit card numbers
        maskedData = maskedData.replace(pattern, "*****CARD-REDACTED*****");
      } else {
        // For emails and other patterns
        maskedData = maskedData.replace(pattern, "*****REDACTED*****");
      }
    }
  });

  return maskedData;
}

/**
 * Secure console logging that masks sensitive information
 */
export const secureLogger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "production") {
      // In production, only log if explicitly enabled
      if (import.meta.env.VITE_ENABLE_LOGS === "true") {
        console.log(
          maskSensitiveData(message),
          ...args.map((arg) =>
            typeof arg === "string" ? maskSensitiveData(arg) : arg,
          ),
        );
      }
    } else {
      // In development, always log but still mask sensitive data
      console.log(
        maskSensitiveData(message),
        ...args.map((arg) =>
          typeof arg === "string" ? maskSensitiveData(arg) : arg,
        ),
      );
    }
  },

  error: (message: string, ...args: any[]) => {
    // Always log errors, but mask sensitive data
    console.error(
      maskSensitiveData(message),
      ...args.map((arg) =>
        typeof arg === "string" ? maskSensitiveData(arg) : arg,
      ),
    );
  },

  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "production") {
      if (import.meta.env.VITE_ENABLE_LOGS === "true") {
        console.warn(
          maskSensitiveData(message),
          ...args.map((arg) =>
            typeof arg === "string" ? maskSensitiveData(arg) : arg,
          ),
        );
      }
    } else {
      console.warn(
        maskSensitiveData(message),
        ...args.map((arg) =>
          typeof arg === "string" ? maskSensitiveData(arg) : arg,
        ),
      );
    }
  },

  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "production") {
      if (import.meta.env.VITE_ENABLE_LOGS === "true") {
        console.info(
          maskSensitiveData(message),
          ...args.map((arg) =>
            typeof arg === "string" ? maskSensitiveData(arg) : arg,
          ),
        );
      }
    } else {
      console.info(
        maskSensitiveData(message),
        ...args.map((arg) =>
          typeof arg === "string" ? maskSensitiveData(arg) : arg,
        ),
      );
    }
  },

  debug: (message: string, ...args: any[]) => {
    // Only log debug in development
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        maskSensitiveData(message),
        ...args.map((arg) =>
          typeof arg === "string" ? maskSensitiveData(arg) : arg,
        ),
      );
    }
  },
};

/**
 * Sanitizes error messages to prevent information disclosure
 * @param error The error to sanitize
 * @returns A sanitized error message
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  let errorMessage = "";

  if (error instanceof Error) {
    // Extract only the message without stack trace
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (typeof error === "object") {
    try {
      errorMessage = JSON.stringify(error);
    } catch {
      errorMessage = "An error occurred with the provided object";
    }
  } else {
    errorMessage = "An unknown error occurred";
  }

  // Mask any sensitive information in the error message
  return maskSensitiveData(errorMessage);
}

/**
 * Creates a sanitized error response for API errors
 * @param error The original error
 * @param userMessage A user-friendly message
 * @returns A sanitized error object
 */
export function createSafeErrorResponse(
  error: unknown,
  userMessage?: string,
): {
  message: string;
  code?: string;
} {
  // Log the full error internally (but still masked)
  secureLogger.error("Error occurred:", error);

  // For client response, return minimal information
  return {
    message: userMessage || "An error occurred while processing your request",
    code:
      error instanceof Error && "code" in error
        ? (error as any).code
        : undefined,
  };
}
