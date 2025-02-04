import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/AuthContext";

function Home() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      try {
        const [projectsData, customersData, timeEntriesData] =
          await Promise.all([getProjects(), getCustomers(), getTimeEntries()]);

        setProjects(projectsData);
        setCustomers(customersData);
        setTimeEntries(timeEntriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        />
        <Timeline
          entries={timeEntries.map(formatTimeEntry)}
          onDeleteEntry={handleDeleteTimeEntry}
        />
      </div>
    </div>
  );
}

export default Home;
