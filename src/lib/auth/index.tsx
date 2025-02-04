import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type AuthUser = {
  id: string;
  email: string;
  role?: string;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    session: null,
    loading: true,
    user: null,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        setState({
          session,
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: "user",
          },
          loading: false,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setState({
          session,
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: "user",
          },
          loading: false,
        });
      } else {
        setState({
          session: null,
          user: null,
          loading: false,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function register(data: {
  email: string;
  password: string;
  full_name: string;
}) {
  return await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name },
    },
  });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function logoutAllSessions() {
  return await supabase.auth.signOut({ scope: "global" });
}
