import { supabase } from "../supabase";
import { Invitation, InvitationValidation } from "@/types/invitations";
import { handleError } from "../utils/error-handler";
import { sendInvitationEmail } from "../services/emailService";

export async function createInvitation(
  email: string,
  role: Invitation["role"] = "user",
  metadata: Record<string, any> = {},
): Promise<Invitation> {
  try {
    // Check if email already exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;
    if (existingUser) {
      throw new Error("Bu email adresi zaten kayıtlı");
    }

    // Check if there's an active invitation
    const { data: existingInvitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("email", email)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (inviteError) throw inviteError;
    if (existingInvitation) {
      throw new Error("Bu email için zaten aktif bir davet bulunuyor");
    }

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Oturum açmanız gerekiyor");

    // Check if user is admin
    if (userData.user.user_metadata?.user_type !== "admin") {
      throw new Error("Bu işlem için yetkiniz yok");
    }

    // Generate secure token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Set expiration to 48 hours from now
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 48);

    // Create invitation
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        email,
        token,
        role,
        created_by: userData.user.id,
        expires_at: expires_at.toISOString(),
        metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Send invitation email
    const inviteUrl = `${window.location.origin}/auth?token=${token}`;
    await sendInvitationEmail(email, inviteUrl, role);

    return data;
  } catch (error) {
    handleError(error, "createInvitation");
    throw error;
  }
}

export async function validateInvitation(
  token: string,
): Promise<InvitationValidation> {
  try {
    const { data, error } = await supabase.rpc("check_invitation_token", {
      p_token: token,
    });

    if (error) throw error;
    return data as InvitationValidation;
  } catch (error) {
    handleError(error, "validateInvitation");
    throw error;
  }
}

export async function markInvitationAsUsed(
  token: string,
  userId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("invitations")
      .update({
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("token", token);

    if (error) throw error;
  } catch (error) {
    handleError(error, "markInvitationAsUsed");
    throw error;
  }
}

export async function listInvitations(): Promise<Invitation[]> {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select()
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, "listInvitations");
    throw error;
  }
}
