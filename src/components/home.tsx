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
import BottomNav from "./BottomNav";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HomeProps {
  onTimeEntryStart?: () => void;
  onTimeEntryStop?: () => void;
  onTimeEntryEdit?: (id: string) => void;
  onTimeEntryDelete?: (id: string) => void;
  timeEntries?: Array<{
    id: string;
    taskName: string;
    projectName: string;
    duration: string;
    startTime: string;
    projectColor: string;
  }>;
}

const Home = ({
  onTimeEntryStart = () => {},
  onTimeEntryStop = () => {},
  onTimeEntryEdit = () => {},
  onTimeEntryDelete: externalOnTimeEntryDelete = async (id: string) => {},
  timeEntries: initialTimeEntries = [],
}: HomeProps) => {
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "profile">(
    "timer",
  );
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);

  const fetchCustomers = async () => {
    try {
      const customers = await getCustomers();
      setCustomers(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const projects = await getProjects();
      setProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const entries = await getTimeEntries();
      setTimeEntries(
        entries.map((entry) => ({
          id: entry.id,
          taskName: entry.task_name,
          projectName: entry.project?.name || "No Project",
          duration: formatDuration(entry.duration),
          startTime: new Date(entry.start_time).toLocaleTimeString(),
          projectColor: entry.project?.color || "#4F46E5",
          tags: entry.time_entry_tags?.map((t) => t.tag) || [],
        })),
      );
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchProjects(), fetchTimeEntries()]).catch(
      (error) => {
        console.error("Error fetching initial data:", error);
      },
    );
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleTimeEntryStop = async () => {
    await fetchTimeEntries();
  };

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleTimeEntryEdit = async (id: string) => {
    try {
      const entries = await getTimeEntries();
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;

      setEditingEntry(entry);
      setShowEditDialog(true);
    } catch (error) {
      console.error("Error fetching entry for edit:", error);
    }
  };

  const handleTimeEntryDelete = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      await fetchTimeEntries();
      externalOnTimeEntryDelete(id);
    } catch (error) {
      console.error("Error deleting time entry:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "timer":
        return (
          <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
            <TimeTracker
              onStart={onTimeEntryStart}
              onStop={handleTimeEntryStop}
              projects={projects}
              customers={customers}
              editingEntry={editingEntry}
              showEditDialog={showEditDialog}
              onEditDialogClose={() => {
                setShowEditDialog(false);
                setEditingEntry(null);
              }}
              onEditComplete={async () => {
                await fetchTimeEntries();
                setShowEditDialog(false);
                setEditingEntry(null);
              }}
            />

            <Timeline
              entries={timeEntries}
              onEditEntry={onTimeEntryEdit}
              onDeleteEntry={handleTimeEntryDelete}
            />
          </div>
        );
      case "reports":
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reports feature coming soon...
              </p>
            </CardContent>
          </Card>
        );
      case "profile":
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {session?.user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {session?.user?.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <ScrollArea className="h-[calc(100vh-5rem)] pt-14">
        <div className="max-w-2xl mx-auto">{renderContent()}</div>
      </ScrollArea>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;
