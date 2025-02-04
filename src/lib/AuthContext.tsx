import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const updateUserData = async (session: Session) => {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role, full_name")
      .eq("id", session.user.id)
      .single();

    if (!error && userData) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: userData.role || "user",
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        if (session?.user) {
          await updateUserData(session);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session);

      try {
        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          setSession(null);
          setUser(null);
          window.location.replace("/auth");
        } else if (session) {
          setSession(session);
          await updateUserData(session);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthProvider;
