import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, inviteUrl, role } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Email template
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Tempo'ya Hoş Geldiniz!</h1>
        <p>Tempo'ya ${role} rolüyle davet edildiniz.</p>
        <p>Kaydınızı tamamlamak için aşağıdaki butona tıklayın:</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #007AFF; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Kaydı Tamamla</a>
        <p style="color: #666;">Bu davet linki 48 saat içinde sona erecektir.</p>
      </div>
    `;

    // Send email using Supabase's built-in email service
    const { error } = await supabaseClient.functions.invoke("send-email", {
      body: {
        to: email,
        subject: "Tempo'ya Davet Edildiniz",
        html: emailHtml,
      },
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Invitation email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
