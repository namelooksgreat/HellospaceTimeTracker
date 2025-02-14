import { supabase } from "../supabase";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();
  return { user, session, loading };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const register = async (data: {
  email: string;
  password: string;
  full_name: string;
}) => {
  return await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name },
    },
  });
};

export const logout = async () => {
  return await useAuthStore.getState().signOut();
};

export const logoutAllSessions = async () => {
  return await supabase.auth.signOut({ scope: "global" });
};
