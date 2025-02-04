import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/auth/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/AuthContext";
import Home from "./components/home";
import routes from "tempo-routes";

// Lazy load admin pages
const UsersPage = lazy(() => import("@/pages/admin/users"));
const CustomersPage = lazy(() => import("@/pages/admin/customers"));
const ProjectsPage = lazy(() => import("@/pages/admin/projects"));
const TimeEntriesPage = lazy(() => import("@/pages/admin/time-entries"));

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<p>Loading...</p>}>
        <div>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Routes>
            <Route
              path="/auth"
              element={session ? <Navigate to="/" replace /> : <AuthPage />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="time-entries" element={<TimeEntriesPage />} />
                  </Routes>
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
