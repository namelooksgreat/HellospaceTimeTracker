import { supabase } from "./supabase";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export async function register({ email, password, full_name }: RegisterData) {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No user returned after signup");

    // Then create the user record
    const { error: insertError } = await supabase.from("users").upsert(
      {
        id: authData.user.id,
        email,
        full_name,
        role: "user",
      },
      { onConflict: "id" },
    );

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return {
      user: {
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
      user: null,
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
}) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return {
        session: null,
        error: new Error(
          error.message ||
            "Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.",
        ),
      };
    }

    if (!data?.session) {
      return {
        session: null,
        error: new Error("Oturum oluşturulamadı. Lütfen tekrar deneyin."),
      };
    }

    return { session: data.session, error: null };
  } catch (error) {
    console.error("Unexpected login error:", error);
    return {
      session: null,
      error: new Error("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."),
    };
  }
}

export async function logout() {
  try {
    // First clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Then kill the supabase session
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Finally force a clean reload
    window.location.replace("/auth");
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, try to force a reload
    window.location.replace("/auth");
  }
}
