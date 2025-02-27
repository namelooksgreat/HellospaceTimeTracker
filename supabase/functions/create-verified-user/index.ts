import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // CORS için OPTIONS isteğini işle
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, user_type } = await req.json();

    // Admin istemcisini oluştur
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase ortam değişkenleri eksik:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      throw new Error("Supabase yapılandırması eksik");
    }

    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Admin API ile kullanıcı oluştur ve e-posta doğrulamasını otomatik yap
    const { data: userData, error: createError } =
      await adminAuthClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // E-posta doğrulamasını otomatik yap
        user_metadata: {
          full_name,
          user_type,
        },
      });

    if (createError) throw createError;

    // Kullanıcılar tablosuna ekle
    if (userData.user) {
      const { error: insertError } = await adminAuthClient
        .from("users")
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: full_name,
          user_type: user_type,
          is_active: true,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ user: userData.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Doğrulanmış kullanıcı oluşturma hatası:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
