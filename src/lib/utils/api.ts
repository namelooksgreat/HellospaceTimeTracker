import { API_CONFIG } from "../constants";
import { APIError } from "./error";

export async function handleApiRequest<T>(
  requestFn: () => Promise<T>,
  errorMessage: string = API_CONFIG.ERROR_MESSAGES.SERVER,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await requestFn();
      return response as T;
    } catch (error) {
      console.error(`API Request attempt ${attempt} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a Supabase error with status
      if (error && typeof error === "object" && "status" in error) {
        throw new APIError(errorMessage, String(error));
      }

      // If it's the last attempt, throw the error
      if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
        throw new APIError(
          errorMessage,
          error instanceof Error ? error.message : undefined,
        );
      }

      // Wait before retrying
      const delay = (ms: number) =>
        new Promise((resolve) => window.setTimeout(resolve, ms));
      await delay(500);
    }
  }

  throw lastError || new Error("Unknown error occurred");
}

export function handleApiError(error: unknown): never {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new APIError(error.message);
  }

  throw new APIError(API_CONFIG.ERROR_MESSAGES.SERVER);
}
