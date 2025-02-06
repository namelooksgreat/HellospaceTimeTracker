import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingPage } from "./components/ui/loading-spinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/auth";
import { AuthPage } from "./components/auth/AuthPage";

// Optimize code splitting with prefetch
const Home = lazy(() =>
  import("./components/home").then((mod) => ({ default: mod.default })),
);
const TimeTracker = lazy(() => import("./components/TimeTracker"));
const ReportsPage = lazy(() =>
  import("./components/reports/ReportsPage").then((mod) => ({
    default: mod.ReportsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./components/profile/ProfilePage").then((mod) => ({
    default: mod.ProfilePage,
  })),
);

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage />}>
        <div className="min-h-screen bg-background">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
