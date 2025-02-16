import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, session } = useAuth();

  console.log("Admin Check:", {
    userType: session?.user?.user_metadata?.user_type,
    requireAdmin,
    hasAccess: session?.user?.user_metadata?.user_type === "admin",
  });

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  const userType = session?.user?.user_metadata?.user_type;
  if (requireAdmin && userType !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
