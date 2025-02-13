import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingPage } from "./components/ui/loading-spinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/auth";
import { AuthPage } from "./components/auth/AuthPage";

// Optimize code splitting with prefetch
const Home = lazy(() => import("./components/home"));
const TimeTracker = lazy(() => import("./components/TimeTracker"));
const ReportsPage = lazy(() => import("./components/reports/ReportsPage"));
const ProfilePage = lazy(() => import("./components/profile/ProfilePage"));

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingPage />}>
        <div className="min-h-screen bg-background">
          {/* For the tempo routes */}
          {import.meta.env.VITE_TEMPO && (
            <Routes>
              <Route path="/tempobook/*" element={<div />} />
            </Routes>
          )}

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
            <Route
              path="/timer"
              element={
                <ProtectedRoute>
                  <TimeTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage entries={[]} onDeleteEntry={() => {}} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Tempo routes */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
