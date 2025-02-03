import { supabase } from "./supabase";

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export async function register({ email, password, full_name }: RegisterData) {
  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    if (!authData.user) {
      console.error("No user returned after signup");
      throw new Error("No user returned after signup");
    }

    // Step 2: Insert into users table
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        email,
        full_name,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    // Step 3: Sign in
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }

    return {
      user: {
        id: authData.user.id,
        email,
        full_name,
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

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
