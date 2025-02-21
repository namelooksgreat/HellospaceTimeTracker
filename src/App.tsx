import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { LoadingPage } from "./components/ui/loading-spinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { useAuth } from "./lib/auth";
const AuthPage = React.lazy(() => import("./components/auth/AuthPage"));
import { ResetPasswordForm } from "./components/auth/ResetPasswordForm";
// Admin page imports
const UserReportPage = lazy(() =>
  import("./components/admin/pages/UserReportPage").then((module) => ({
    default: module.UserReportPage,
  })),
);
const CustomerReportPage = lazy(() =>
  import("./components/admin/pages/CustomerReportPage").then((module) => ({
    default: module.CustomerReportPage,
  })),
);

// Optimize code splitting with prefetch
const Home = lazy(() => import("./components/home"));
const TimeTracker = lazy(() => import("./components/TimeTracker"));
const ReportsPage = lazy(() => import("./components/reports/ReportsPage"));
const ProfilePage = lazy(() => import("./components/profile/ProfilePage"));

// Admin pages
const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout").then((module) => ({
    default: module.AdminLayout,
  })),
);
const DashboardPage = lazy(() =>
  import("./components/admin/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const UsersPage = lazy(() =>
  import("./components/admin/pages/UsersPage").then((module) => ({
    default: module.UsersPage,
  })),
);
const CustomersPage = lazy(() =>
  import("./components/admin/pages/CustomersPage").then((module) => ({
    default: module.CustomersPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("./components/admin/pages/ProjectsPage").then((module) => ({
    default: module.ProjectsPage,
  })),
);
const TimeEntriesPage = lazy(() =>
  import("./components/admin/pages/TimeEntriesPage").then((module) => ({
    default: module.TimeEntriesPage,
  })),
);
const CustomerPaymentsPage = lazy(() =>
  import("./components/admin/pages/CustomerPaymentsPage").then((module) => ({
    default: module.CustomerPaymentsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./components/admin/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

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
                <Route path="/auth">
                  <Route
                    index
                    element={
                      session ? <Navigate to="/" replace /> : <AuthPage />
                    }
                  />
                  <Route
                    path="reset-password"
                    element={<ResetPasswordForm />}
                  />
                </Route>
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
                      <ReportsPage
                        entries={[]}
                        projects={[]}
                        customers={[]}
                        onDeleteEntry={() => {}}
                      />
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
