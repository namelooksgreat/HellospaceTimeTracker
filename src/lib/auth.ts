import { supabase } from "./supabase";
import { AuthError } from "./utils/error";
import { handleApiRequest } from "./utils/api";
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "./utils/validation";
import { API_CONFIG } from "./constants";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

export async function register({
  email,
  password,
  full_name,
}: RegisterData): Promise<
  AuthResponse<{ id: string; email: string; full_name: string; role: string }>
> {
  try {
    // Validate inputs
    validateRequired(email, "Email");
    validateRequired(password, "Password");
    validateRequired(full_name, "Full name");

    if (!validateEmail(email)) {
      throw new AuthError("Invalid email format");
    }
    if (!validatePassword(password)) {
      throw new AuthError("Password must be at least 8 characters long");
    }

    // Create auth user
    const { data: authData, error: authError } = await handleApiRequest(
      () =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name } },
        }),
      "Registration failed",
    );

    if (authError) throw new AuthError(authError.message);
    if (!authData?.user) throw new AuthError("No user returned after signup");

    // Create user record
    const { error: insertError } = await handleApiRequest(
      () =>
        supabase
          .from("users")
          .upsert(
            { id: authData.user.id, email, full_name, role: "user" },
            { onConflict: "id" },
          ),
      "Failed to create user record",
    );

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new AuthError("Failed to create user record");
    }

    return {
      data: {
        id: authData.user.id,
        email,
        full_name,
        role: "user",
      },
      error: null,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Registration failed"),
    };
  }
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResponse<{ session: any }>> {
  try {
    // Validate inputs
    validateRequired(email, "Email");
    validateRequired(password, "Password");

    if (!validateEmail(email)) {
      throw new AuthError("Invalid email format");
    }

    const { data, error } = await handleApiRequest(
      () =>
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
      API_CONFIG.ERROR_MESSAGES.AUTH,
    );

    if (error) {
      throw new AuthError(
        error.message || "Login failed. Please check your credentials.",
      );
    }

    if (!data?.session) {
      throw new AuthError("Failed to create session. Please try again.");
    }

    return { data: { session: data.session }, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Login failed"),
    };
  }
}

export async function logout(): Promise<void> {
  try {
    // Clear all storage data
    localStorage.clear();
    sessionStorage.clear();

    // End session
    const { error } = await handleApiRequest(
      () => supabase.auth.signOut(),
      "Logout failed",
    );

    if (error) throw error;

    // Force reload to auth page
    window.location.replace("/auth");
  } catch (error) {
    console.error("Logout error:", error);
    // Force redirect even on error
    window.location.replace("/auth");
  }
}
