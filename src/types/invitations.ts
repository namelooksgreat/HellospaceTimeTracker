export interface Invitation {
  id: string;
  email: string;
  token: string;
  role: "admin" | "developer" | "designer" | "user";
  created_by: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
  used_by?: string;
  metadata?: Record<string, any>;
}

export interface InvitationValidation {
  is_valid: boolean;
  email: string | null;
  role: string | null;
  metadata: Record<string, any> | null;
}
