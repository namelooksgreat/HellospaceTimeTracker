import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { LoadingPage } from "./components/ui/loading-spinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { useAuth } from "./lib/auth";

// Lazy load components
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const ResetPasswordForm = React.lazy(() =>
  import("./components/auth/ResetPasswordForm").then((mod) => ({
    default: mod.ResetPasswordForm,
  })),
);

// Main pages
const Home = lazy(() => import("@/components/home"));
const TimeTracker = lazy(() =>
  import("./components/TimeTracker").then((module) => ({
    default: module.default,
  })),
);
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
const InvitationsPage = lazy(() =>
  import("./components/admin/pages/InvitationsPage").then((module) => ({
    default: module.InvitationsPage,
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
const ProjectTagsPage = lazy(() =>
  import("./components/admin/pages/ProjectTagsPage").then((module) => ({
    default: module.ProjectTagsPage,
  })),
);
const TimeEntriesPage = lazy(() =>
  import("./components/admin/pages/TimeEntriesPage").then((module) => ({
    default: module.TimeEntriesPage,
  })),
);
const UserBankInfoPage = lazy(() =>
  import("./components/admin/pages/UserBankInfoPage").then((module) => ({
    default: module.UserBankInfoPage,
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

export default function App() {
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
                  path="/auth"
                  element={session ? <Navigate to="/" replace /> : <AuthPage />}
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingPage />}>
                        <Home />
                      </Suspense>
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

                {/* Admin routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="invitations" element={<InvitationsPage />} />
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
                  <Route path="project-tags" element={<ProjectTagsPage />} />
                  <Route path="time-entries" element={<TimeEntriesPage />} />
                  <Route path="bank-info" element={<UserBankInfoPage />} />
                  <Route path="payments" element={<CustomerPaymentsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Tempo routes */}
                {import.meta.env.VITE_TEMPO === "true" && (
                  <Route path="/tempobook/*" />
                )}

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
