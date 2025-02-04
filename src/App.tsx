import { Suspense } from "react";
import { LoadingPage } from "./components/ui/loading-spinner";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { AdminPage } from "./components/admin/AdminPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/AuthContext";
import Home from "./components/home";
import routes from "tempo-routes";

function App() {
  const { session, loading } = useAuth();
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          {tempoRoutes}
          <Routes>
            <Route
              path="/auth"
              element={session ? <Navigate to="/" replace /> : <AuthPage />}
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </div>
  );
}

export default App;
