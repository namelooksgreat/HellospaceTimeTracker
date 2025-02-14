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
  created_at: string;
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

export async function deleteUser(id: string) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    handleError(error, "deleteUser");
    throw error;
  }
}
