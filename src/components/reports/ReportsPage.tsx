import { useState, useCallback, useEffect } from "react";
import { getProjects, getCustomers } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { updateTimeEntry } from "@/lib/api";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { BarChart2, Calendar, PieChart, Clock, DollarSign } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import type { TimeEntry } from "@/types";

interface ReportsPageProps {
  entries: TimeEntry[];
  onDeleteEntry?: (id: string) => void;
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
}

export function ReportsPage({
  entries: initialEntries,
  onDeleteEntry,
  projects = [],
  customers = [],
}: ReportsPageProps) {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [localProjects, setLocalProjects] = useState(projects);
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, customersData, { data: rateData }] =
          await Promise.all([
            getProjects(),
            getCustomers(),
            supabase.from("developer_rates").select("hourly_rate").single(),
          ]);
        setLocalProjects(projectsData);
        setLocalCustomers(customersData);
        setHourlyRate(rateData?.hourly_rate || 0);
      } catch (error) {
        handleError(error, "ReportsPage");
      }
    };
    fetchData();
  }, []);

  const handleEditEntry = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        setSelectedEntry(entry);
        setEditDialogOpen(true);
      }
    },
    [entries],
  );

  const handleDeleteEntry = useCallback((id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (entryToDelete && onDeleteEntry) {
      onDeleteEntry(entryToDelete);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryToDelete));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  }, [entryToDelete, onDeleteEntry]);

  const handleUpdateEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
    }) => {
      if (!selectedEntry) return;

      try {
        const updated = await updateTimeEntry(selectedEntry.id, {
          task_name: data.taskName,
          project_id: data.projectId || null,
          description: data.description,
        });

        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === updated.id ? { ...entry, ...updated } : entry,
          ),
        );
        setEditDialogOpen(false);
      } catch (error) {
        handleError(error, "ReportsPage");
      }
    },
    [selectedEntry],
  );

  const calculateTotalDuration = (entries: TimeEntry[]) => {
    return entries.reduce((acc, entry) => {
      if (typeof entry.duration !== "number") {
        console.warn("Invalid duration type for entry:", {
          id: entry.id,
          duration: entry.duration,
          type: typeof entry.duration,
        });
        return acc;
      }
      return acc + Math.max(0, entry.duration);
    }, 0);
  };

  const getDailyEntries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entries.filter((entry) => {
      if (!entry.start_time) return false;
      try {
        const entryDate = new Date(entry.start_time);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      } catch (error) {
        console.error("Invalid date:", entry.start_time);
        return false;
      }
    });
  };

  const getWeeklyEntries = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return entries.filter((entry) => {
      if (!entry.start_time) return false;
      const entryDate = new Date(entry.start_time);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    });
  };

  const filteredEntries =
    activeTab === "daily" ? getDailyEntries() : getWeeklyEntries();
  const totalDuration = calculateTotalDuration(filteredEntries);

  const formatTotalDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0h 0m 0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${remainingSeconds}s`);

    return parts.join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <BarChart2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Time Reports
          </CardTitle>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 group active:scale-[0.98] touch-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative z-10">
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Total Time
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary relative">
                  {formatTotalDuration(totalDuration)}
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 group active:scale-[0.98] touch-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative z-10">
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Entries
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary relative">
                  {filteredEntries.length}
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-border/80 group active:scale-[0.98] touch-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="relative z-10">
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Total Earnings
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary relative">
                  ${((totalDuration / 3600) * hourlyRate).toFixed(2)}
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-14 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border transition-all duration-300 ease-in-out">
          <TabsTrigger
            value="daily"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Daily</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Weekly</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Projects</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="daily" className="m-0">
            <DailyReport
              entries={filteredEntries.map((entry) => ({
                id: entry.id,
                taskName: entry.task_name,
                projectName: entry.project?.name || "",
                duration: entry.duration,
                startTime: entry.start_time,
                createdAt: entry.created_at,
                projectColor: entry.project?.color || "#94A3B8",
              }))}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={handleEditEntry}
            />
            {selectedEntry && (
              <EditTimeEntryDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                entry={selectedEntry}
                projects={projects}
                customers={customers}
                onSave={handleUpdateEntry}
              />
            )}
          </TabsContent>
          <TabsContent value="weekly" className="m-0">
            <WeeklyReport entries={filteredEntries} />
          </TabsContent>
          <TabsContent value="projects" className="m-0">
            <ProjectsReport entries={filteredEntries} />
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zaman kaydını sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Zaman kaydını silmek istediğinize emin
              misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
