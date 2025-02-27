import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://tykqnnygrqovcbqbkszp.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5a3FubnlncnFvdmNicWJrc3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDMwNzMsImV4cCI6MjA1NDA3OTA3M30.a09sUrHIFTVUM0PeL5apxByWEF1K_-qDDLY-WMX3bvw";
export const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

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
    detectSessionInUrl: true,
    flowType: "pkce",
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
