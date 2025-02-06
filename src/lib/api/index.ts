import { supabase } from "../supabase";
import { handleApiRequest } from "../utils/api";
import { APIError } from "../utils/error";
import type { User } from "@/types";

export async function getUsers(): Promise<User[]> {
  return handleApiRequest(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new APIError("Failed to fetch users", error.code);
    return data || [];
  }, "Failed to fetch users");
}

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<void> {
  return handleApiRequest(async () => {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);

    if (error) throw new APIError("Failed to update user role", error.code);
  }, "Failed to update user role");
}

export * from "./apiClient";
export * from "../api";
