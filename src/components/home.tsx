import React, { useState, useEffect } from "react";
import { ProfilePage } from "./profile/ProfilePage";
import { MainLayout } from "./layouts/MainLayout";
import {
  getProjects,
  getTimeEntries,
  deleteTimeEntry,
  getCustomers,
  Project,
  Customer,
  TimeEntry,
} from "@/lib/api";
import TimeTracker from "./TimeTracker";
import { ReportsPage } from "./reports/ReportsPage";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

function Home() {
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
      console.error("Error fetching time entries:", error);
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
        console.error("Error fetching data:", error);
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
      console.error("Error deleting time entry:", error);
    }
  };

  const formatTimeEntry = (entry: TimeEntry) => {
    const duration = entry.duration;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const durationStr = `${hours}h ${minutes}m`;

    const startTime = new Date(entry.start_time);
    const timeStr = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return {
      id: entry.id,
      taskName: entry.task_name,
      projectName: entry.project?.name || "No Project",
      duration: durationStr,
      startTime: timeStr,
      projectColor: entry.project?.color || "#94A3B8",
    };
  };

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default Home;
