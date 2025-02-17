import { useState, useCallback } from "react";
import { handleError } from "../error/ErrorHandler";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setState({ data: null, loading: true, error: null });
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const appError =
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred");
      setState({ data: null, loading: false, error: appError });
      handleError(error, "useAsync");
      throw error;
    }
  }, []);

  return { ...state, execute };
}
