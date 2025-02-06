import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type AuthUser = {
  id: string;
  email: string;
  role?: string;
  avatar_url?: string;
  full_name?: string;
};

type AuthState = {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));
