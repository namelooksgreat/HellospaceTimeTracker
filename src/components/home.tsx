import React, { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import BottomNav from "./BottomNav";
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
import Timeline from "./Timeline";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

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

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto p-4">
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
          <Timeline
            entries={timeEntries.map(formatTimeEntry)}
            onDeleteEntry={handleDeleteTimeEntry}
          />
        )}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <p className="text-muted-foreground">
              Profile settings coming soon...
            </p>
          </div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default Home;
