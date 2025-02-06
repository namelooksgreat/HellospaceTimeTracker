import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "./ui/skeleton";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { handleError } from "@/lib/utils/error-handler";
import {
  getProjects,
  getTimeEntries,
  deleteTimeEntry,
  getCustomers,
  Project,
  Customer,
  TimeEntry,
} from "@/lib/api";

// Lazy load components for better performance
const TimeTracker = lazy(() => import("./TimeTracker"));

const ReportsPage = lazy(() =>
  import("./reports/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);

const ProfilePage = lazy(() =>
  import("./profile/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

function Home() {
  usePerformanceTracking("Home");
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "profile">(
    "timer",
  );

  const fetchTimeEntriesData = async () => {
    if (!session) return;
    try {
      const timeEntriesData = await getTimeEntries();
      console.debug("Fetched time entries:", timeEntriesData);
      if (Array.isArray(timeEntriesData)) {
        setTimeEntries(timeEntriesData);
      } else {
        console.error("Invalid time entries data:", timeEntriesData);
        setTimeEntries([]);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      handleError(error, "Home");
      setTimeEntries([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) {
        console.debug("No session user, skipping data fetch");
        return;
      }
      console.debug("Fetching data for user:", session.user.id);

      try {
        setLoading(true);
        console.debug("Starting data fetch...");
        const [projectsData, customersData, timeEntriesData] =
          await Promise.all([getProjects(), getCustomers(), getTimeEntries()]);

        console.debug("Data fetch results:", {
          projectsCount: projectsData?.length || 0,
          customersCount: customersData?.length || 0,
          timeEntriesCount: timeEntriesData?.length || 0,
        });

        setProjects(projectsData || []);
        setCustomers(customersData || []);
        setTimeEntries(timeEntriesData || []);
      } catch (error) {
        handleError(error, "Home");
        setProjects([]);
        setCustomers([]);
        setTimeEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      await fetchTimeEntriesData();
    } catch (error) {
      handleError(error, "Home");
    }
  };

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  const LoadingFallback = () => (
    <div className="space-y-6">
      <Skeleton className="h-[300px] w-full rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {loading ? (
          <LoadingFallback />
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            {activeTab === "timer" && (
              <TimeTracker
                projects={projects}
                customers={customers}
                availableTags={[
                  { value: "bug", label: "Bug" },
                  { value: "feature", label: "Feature" },
                  { value: "documentation", label: "Documentation" },
                  { value: "design", label: "Design" },
                  { value: "testing", label: "Testing" },
                ]}
                onTimeEntrySaved={fetchTimeEntriesData}
              />
            )}
            {activeTab === "reports" && (
              <ReportsPage
                entries={timeEntries}
                projects={projects}
                customers={customers}
                onDeleteEntry={handleDeleteTimeEntry}
              />
            )}
            {activeTab === "profile" && <ProfilePage />}
          </Suspense>
        )}
      </div>
    </MainLayout>
  );
}

export default Home;
