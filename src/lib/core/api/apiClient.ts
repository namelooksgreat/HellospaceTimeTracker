import { supabase } from "@/lib/supabase";
import { handleError } from "../error/ErrorHandler";

export class ApiClient {
  static async get<T>(table: string, query: any = {}): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(query.select || "*")
        .order(query.orderBy || "created_at", { ascending: false });

      if (error) throw error;
      return data as T[];
    } catch (error) {
      handleError(error, "ApiClient");
      throw error;
    }
  }

  static async getOne<T>(
    table: string,
    id: string,
    query: any = {},
  ): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(query.select || "*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      handleError(error, "ApiClient");
      throw error;
    }
  }

  static async create<T>(table: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      handleError(error, "ApiClient");
      throw error;
    }
  }

  static async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      handleError(error, "ApiClient");
      throw error;
    }
  }

  static async delete(table: string, id: string): Promise<void> {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      handleError(error, "ApiClient");
      throw error;
    }
  }
}
