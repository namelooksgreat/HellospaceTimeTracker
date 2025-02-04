import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LoadingPage } from "./ui/loading-spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}
