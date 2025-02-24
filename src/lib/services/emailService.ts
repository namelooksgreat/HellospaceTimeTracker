import { supabase } from "../supabase";

export async function sendInvitationEmail(
  email: string,
  inviteUrl: string,
  role: string,
): Promise<void> {
  try {
    // Development ortamında email gönderimi simüle edildi
    if (import.meta.env.DEV) {
      console.log("Development: Simulating email send");
      console.log("To:", email);
      console.log("Invite URL:", inviteUrl);
      console.log("Role:", role);
      return;
    }

    // Production ortamında Supabase Edge Function'ı çağır
    const { error } = await supabase.functions.invoke("send-invitation-email", {
      body: { email, inviteUrl, role },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
}
