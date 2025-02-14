import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type PersistOptions,
} from "zustand/middleware";
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

const initialState: Omit<
  AuthState,
  "setUser" | "setSession" | "setLoading" | "signOut"
> = {
  user: null,
  session: null,
  loading: true,
};

type AuthStorePersist = Omit<AuthState, "loading" | "setLoading">;

const persistOptions: PersistOptions<AuthState, AuthStorePersist> = {
  name: "auth-storage",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    user: state.user,
    session: state.session,
    setUser: state.setUser,
    setSession: state.setSession,
    signOut: state.signOut,
  }),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
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
    }),
    persistOptions,
  ),
);
