import { supabase } from "../supabase";
import { handleError } from "../utils/error-handler";

export interface UserType {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string;
  created_at: string | null;
  is_active: boolean | null;
  avatar_url: string | null;
  last_active: string | null;
}

export async function getUserTypes() {
  try {
    const { data, error } = await supabase
      .from("user_types")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "getUserTypes");
    return [];
  }
}

export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, "getUsers");
    return [];
  }
}

export async function updateUser(id: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: updates.full_name,
        user_type: updates.user_type,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "updateUser");
    throw error;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  full_name: string;
  user_type?: string;
  default_rate?: number;
  currency?: string;
}) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          user_type: userData.user_type || "user",
        },
      },
    });

    if (authError) {
      if (authError.message.includes("security purposes")) {
        throw new Error(
          "Please wait a moment before trying to create another user",
        );
      }
      throw authError;
    }
    if (!authData.user) throw new Error("User creation failed");

    // Wait a moment for the auth user to be fully created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Create user record in users table
      const { error: userError } = await supabase.from("users").upsert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        user_type: userData.user_type || "user",
        created_at: new Date().toISOString(),
      });

      if (userError) throw userError;

      // Create or update user settings
      if (typeof userData.default_rate === "number" && userData.currency) {
        const { error: settingsError } = await supabase
          .from("user_settings")
          .upsert({
            user_id: authData.user.id,
            default_rate: userData.default_rate,
            currency: userData.currency,
            updated_at: new Date().toISOString(),
          });

        if (settingsError) throw settingsError;
      }
    } catch (error) {
      console.error("Error in user creation/settings:", error);
      throw error;
    }

    // Return the created user data
    return {
      id: authData.user.id,
      email: userData.email,
      full_name: userData.full_name,
      user_type: userData.user_type || "user",
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    handleError(error, "createUser");
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    // Mevcut kullanıcının bilgilerini al
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("Oturum açmış kullanıcı bulunamadı");

    // Mevcut kullanıcının rolünü kontrol et
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (currentUserError) throw currentUserError;
    if (!currentUser) throw new Error("Kullanıcı bilgileri bulunamadı");

    // Admin kontrolü
    if (currentUser.user_type !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    // Silinecek kullanıcının kendisi olup olmadığını kontrol et
    if (user.id === id) {
      throw new Error("Kendi hesabınızı silemezsiniz");
    }

    // İlişkili verileri temizle
    const deletePromises = [
      supabase.from("timer_states").delete().eq("user_id", id),
      supabase.from("developer_rates").delete().eq("user_id", id),
      supabase.from("time_entries").delete().eq("user_id", id),
      supabase.from("projects").delete().eq("user_id", id),
      supabase.from("customers").delete().eq("user_id", id),
    ];

    // İlişkili verileri sil ve hataları yakala
    const results = await Promise.allSettled(deletePromises);
    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )
      .map((result) => result.reason);

    if (errors.length > 0) {
      console.error("Bazı ilişkili veriler silinemedi:", errors);
    }

    // Kullanıcıyı deaktive et
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", id);

    if (updateError) throw updateError;

    // En son users tablosundan sil
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
  } catch (error) {
    handleError(error, "deleteUser");
    throw error;
  }
}
