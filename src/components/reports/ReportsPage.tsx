import { useState, useCallback, useEffect } from "react";
import { getProjects, getCustomers } from "@/lib/api";
import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { updateTimeEntry } from "@/lib/api";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { BarChart2, Calendar, PieChart, Clock } from "lucide-react";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, customersData] = await Promise.all([
          getProjects(),
          getCustomers(),
        ]);
        setLocalProjects(projectsData);
        setLocalCustomers(customersData);
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
    }) => {
      if (!selectedEntry) return;

      try {
        const updated = await updateTimeEntry(selectedEntry.id, {
          task_name: data.taskName,
          project_id: data.projectId || null,
          description: data.description,
          duration: data.duration,
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
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden sm:rounded-lg rounded-none border-x-0 sm:border-x">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <BarChart2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Time Reports
            </CardTitle>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Total Time
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary">
                  {formatTotalDuration(totalDuration)}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Entries
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary">
                  {filteredEntries.length}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="daily"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Daily</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Weekly</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
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
      </CardContent>
    </Card>
  );
}
