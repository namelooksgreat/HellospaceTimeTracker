import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuthStore } from "@/store/authStore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setSession(session);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.user_type || "user",
            avatar_url: session.user.user_metadata?.avatar_url,
            full_name: session.user.user_metadata?.full_name,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setSession(session);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.user_type || "user",
          avatar_url: session.user.user_metadata?.avatar_url,
          full_name: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

  if (!isInitialized) {
    return null;
  }

  return children;
};

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
