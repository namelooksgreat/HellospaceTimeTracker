import React, { useState, useEffect, Suspense, lazy } from "react";
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
const TimeTracker = lazy(() =>
  import("./TimeTracker").then((module) => {
    return { default: module.default };
  }),
);

const ReportsPage = lazy(() =>
  import("./reports/ReportsPage").then((module) => {
    return { default: module.ReportsPage };
  }),
);

const ProfilePage = lazy(() =>
  import("./profile/ProfilePage").then((module) => {
    return { default: module.ProfilePage };
  }),
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
      setTimeEntries(timeEntriesData);
    } catch (error) {
      handleError(error, "Home");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const [projectsData, customersData, timeEntriesData] =
          await Promise.all([getProjects(), getCustomers(), getTimeEntries()]);

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

  const formatTimeEntry = (entry: TimeEntry) => {
    const startTime = new Date(entry.start_time);
    const timeStr = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const duration =
      typeof entry.duration === "number" ? Math.max(0, entry.duration) : 0;

    return {
      id: entry.id,
      taskName: entry.task_name,
      projectName: entry.project?.name || "No Project",
      duration: duration,
      startTime: timeStr,
      projectColor: entry.project?.color || "#94A3B8",
      createdAt: entry.created_at,
    };
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
                entries={timeEntries.map(formatTimeEntry)}
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
