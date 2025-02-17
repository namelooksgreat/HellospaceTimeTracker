import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { LoadingPage } from "./components/ui/loading-spinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { useAuth } from "./lib/auth";
import { AuthPage } from "./components/auth/AuthPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { DashboardPage } from "./components/admin/pages/DashboardPage";
import { UsersPage } from "./components/admin/pages/UsersPage";
import { CustomersPage } from "./components/admin/pages/CustomersPage";
import { ProjectsPage } from "./components/admin/pages/ProjectsPage";
import { TimeEntriesPage } from "./components/admin/pages/TimeEntriesPage";
import { SettingsPage } from "./components/admin/pages/SettingsPage";
import { UserReportPage } from "./components/admin/pages/UserReportPage";
import { CustomerReportPage } from "./components/admin/pages/CustomerReportPage";
import { CustomerPaymentsPage } from "./components/admin/pages/CustomerPaymentsPage";

// Optimize code splitting with prefetch
const Home = lazy(() => import("./components/home"));
const TimeTracker = lazy(() => import("./components/TimeTracker"));
const ReportsPage = lazy(() => import("./components/reports/ReportsPage"));
const ProfilePage = lazy(() => import("./components/profile/ProfilePage"));

export default function App() {
  // Ensure routes are properly handled
  const basename = import.meta.env.BASE_URL;
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Suspense fallback={<LoadingPage />}>
          <div className="min-h-screen bg-background">
            <div className="min-h-screen bg-background">
              {/* For the tempo routes */}
              {import.meta.env.VITE_TEMPO === "true" && (
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
                {import.meta.env.VITE_TEMPO === "true" && (
                  <Route path="/tempobook/*" />
                )}
                {/* Admin routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route
                    path="users/:userId/report"
                    element={<UserReportPage />}
                  />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route
                    path="customers/:customerId/report"
                    element={<CustomerReportPage />}
                  />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="time-entries" element={<TimeEntriesPage />} />
                  <Route path="payments" element={<CustomerPaymentsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
          <Toaster />
        </Suspense>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
