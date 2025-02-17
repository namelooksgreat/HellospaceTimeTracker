import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useAdminUI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAsync = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      {
        loadingMessage = "Processing...",
        successMessage = "Operation completed successfully",
        errorMessage = "An error occurred",
      }: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {},
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      const toastId = toast.loading(loadingMessage);

      try {
        const result = await asyncFn();
        toast.success(successMessage, { id: toastId });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        toast.error(errorMessage, {
          id: toastId,
          description: error.message,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    handleAsync,
    clearError,
  };
}
