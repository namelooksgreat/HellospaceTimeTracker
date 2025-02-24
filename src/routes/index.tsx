import { lazy } from "react";

// Ana rotalar
export const Home = lazy(() => import("@/components/home"));
export const TimeTracker = lazy(() => import("@/components/TimeTracker"));
export const ReportsPage = lazy(
  () => import("@/components/reports/ReportsPage"),
);
export const ProfilePage = lazy(
  () => import("@/components/profile/ProfilePage"),
);

// Auth rotalar
export const AuthPage = lazy(() => import("@/components/auth/AuthPage"));
export const ResetPasswordForm = lazy(() =>
  import("@/components/auth/ResetPasswordForm").then((mod) => ({
    default: mod.ResetPasswordForm,
  })),
);

// Admin rotalar
export const AdminLayout = lazy(() =>
  import("@/components/admin/AdminLayout").then((mod) => ({
    default: mod.AdminLayout,
  })),
);
export const DashboardPage = lazy(() =>
  import("@/components/admin/pages/DashboardPage").then((mod) => ({
    default: mod.DashboardPage,
  })),
);
export const UsersPage = lazy(() =>
  import("@/components/admin/pages/UsersPage").then((mod) => ({
    default: mod.UsersPage,
  })),
);
export const CustomersPage = lazy(() =>
  import("@/components/admin/pages/CustomersPage").then((mod) => ({
    default: mod.CustomersPage,
  })),
);
export const ProjectsPage = lazy(() =>
  import("@/components/admin/pages/ProjectsPage").then((mod) => ({
    default: mod.ProjectsPage,
  })),
);
export const TimeEntriesPage = lazy(() =>
  import("@/components/admin/pages/TimeEntriesPage").then((mod) => ({
    default: mod.TimeEntriesPage,
  })),
);
export const CustomerPaymentsPage = lazy(() =>
  import("@/components/admin/pages/CustomerPaymentsPage").then((mod) => ({
    default: mod.CustomerPaymentsPage,
  })),
);
export const SettingsPage = lazy(() =>
  import("@/components/admin/pages/SettingsPage").then((mod) => ({
    default: mod.SettingsPage,
  })),
);
export const UserReportPage = lazy(() =>
  import("@/components/admin/pages/UserReportPage").then((mod) => ({
    default: mod.UserReportPage,
  })),
);
export const CustomerReportPage = lazy(() =>
  import("@/components/admin/pages/CustomerReportPage").then((mod) => ({
    default: mod.CustomerReportPage,
  })),
);
