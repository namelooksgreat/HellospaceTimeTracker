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
} from "@/lib/api";
import type { Project, Customer, TimeEntry as TimeEntryType } from "@/types";
import TimeEntryComponent from "./TimeEntry";

// Lazy load components for better performance
const TimeTracker = lazy(() => import("./TimeTracker"));
const ReportsPage = lazy(() => import("./reports/ReportsPage"));
const ProfilePage = lazy(() => import("./profile/ProfilePage"));

function Home() {
  usePerformanceTracking("Home");
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "profile">(
    "timer",
  );

  const fetchTimeEntriesData = async () => {
    if (!session) return;
    try {
      const timeEntriesData = await getTimeEntries();
      if (Array.isArray(timeEntriesData)) {
        setTimeEntries(timeEntriesData);
      } else {
        console.error("Invalid time entries data:", timeEntriesData);
        setTimeEntries([]);
      }
    } catch (error) {
      handleError(error, "Home");
      setTimeEntries([]);
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

  const handleEditEntry = (id: string) => {
    // Implement edit functionality
    console.log("Edit entry:", id);
  };

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  const LoadingFallback = () => (
    <div className="space-y-4 p-4">
      <Skeleton className="h-[300px] w-full rounded-xl bg-card/50" />
      <Skeleton className="h-[400px] w-full rounded-xl bg-card/50" />
    </div>
  );

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
        <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6 pb-20 animate-in fade-in-50 duration-500">
          {loading ? (
            <LoadingFallback />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <div className="space-y-6">
                {activeTab === "timer" && (
                  <div className="space-y-6">
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

                    {/* Recent Time Entries */}
                    {timeEntries.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          Recent Entries
                        </div>
                        {timeEntries.slice(0, 2).map((entry) => (
                          <TimeEntryComponent
                            key={entry.id}
                            taskName={entry.task_name}
                            projectName={entry.project?.name || ""}
                            duration={entry.duration}
                            startTime={entry.start_time}
                            createdAt={entry.created_at}
                            projectColor={entry.project?.color || "#94A3B8"}
                            onDelete={() => handleDeleteTimeEntry(entry.id)}
                            onEdit={() => handleEditEntry(entry.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
              </div>
            </Suspense>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default Home;
