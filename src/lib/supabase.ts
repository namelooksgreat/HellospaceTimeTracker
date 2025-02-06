import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
  throw new Error("Supabase configuration is missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const testConnection = async () => {
  try {
    const { data, error: tableError } = await supabase
      .from("time_entries")
      .select("*")
      .limit(1);

    if (tableError) throw tableError;
    console.debug("Supabase connection successful");
    return true;
  } catch (error) {
    console.debug("Supabase connection pending auth");
    return false;
  }
};
