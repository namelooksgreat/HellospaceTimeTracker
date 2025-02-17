import { useState, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils/time";
import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { BarChart2, Calendar, PieChart, Clock, DollarSign } from "lucide-react";
import { useDialogStore } from "@/store/dialogStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

export default function ReportsPage({
  entries: initialEntries,
  onDeleteEntry,
  projects = [],
  customers = [],
}: ReportsPageProps) {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState("daily");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entries, setEntries] = useState(initialEntries);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [timeFilter, setTimeFilter] = useState<
    "all" | "daily" | "weekly" | "monthly" | "yearly"
  >("all");

  const { setEditTimeEntryDialog } = useDialogStore();

  const filteredEntries = useMemo(() => {
    // Filter entries based on timeFilter
    if (timeFilter === "all") return entries;

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeFilter) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() + 6));
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return entries;
    }

    return entries.filter((entry) => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [entries, timeFilter]);

  const handleEditEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
      hourlyRate?: number;
      currency?: string;
      startTime?: string;
    }) => {
      try {
        if (!selectedEntry) return;

        // Update time entry
        const { error: entryError } = await supabase
          .from("time_entries")
          .update({
            task_name: data.taskName,
            project_id: data.projectId || null,
            description: data.description,
            duration: data.duration,
            start_time: data.startTime,
          })
          .eq("id", selectedEntry.id);

        if (entryError) throw entryError;

        // Refresh entries
        const { data: updatedEntries, error: fetchError } = await supabase
          .from("time_entries")
          .select(
            `
            *,
            project:projects!left(id, name, color, customer:customers!left(
              id, name, customer_rates(hourly_rate, currency)
            ))
          `,
          )
          .order("start_time", { ascending: false });

        if (fetchError) throw fetchError;
        setEntries(updatedEntries || []);
        showSuccess("Time entry updated successfully");
      } catch (error) {
        handleError(error, "ReportsPage");
      }
    },
    [selectedEntry],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedEntry) return;
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", selectedEntry.id);

      if (error) throw error;

      // Update local state by removing the deleted entry
      setEntries(entries.filter((entry) => entry.id !== selectedEntry.id));
      setShowDeleteDialog(false);
      toast.success("Zaman girişi silindi", {
        description: `${selectedEntry.task_name} - ${formatDuration(selectedEntry.duration)}`,
      });
    } catch (error) {
      handleError(error, "ReportsPage");
    }
  }, [selectedEntry, entries]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <BarChart2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t("reports.title")}
          </h1>
        </div>

        <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-x-visible sm:pb-0 sm:grid sm:grid-cols-2">
          <Card className="flex-shrink-0 w-[180px] sm:w-auto bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="truncate">{t("reports.totalHours")}</span>
              </div>
              <div className="text-lg sm:text-2xl font-mono font-bold tracking-tight">
                {formatDuration(
                  filteredEntries.reduce(
                    (acc, entry) => acc + entry.duration,
                    0,
                  ),
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {timeFilter === "daily"
                  ? "Today"
                  : timeFilter === "weekly"
                    ? "This Week"
                    : timeFilter === "monthly"
                      ? "This Month"
                      : "This Year"}
              </div>
            </div>
          </Card>

          <Card className="flex-shrink-0 w-[180px] sm:w-auto bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="truncate">{t("reports.totalEarnings")}</span>
              </div>
              <div className="text-lg sm:text-2xl font-mono font-bold tracking-tight">
                {/* Add earnings calculation here */}
                $0.00
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {timeFilter === "daily"
                  ? "Today"
                  : timeFilter === "weekly"
                    ? "This Week"
                    : timeFilter === "monthly"
                      ? "This Month"
                      : "This Year"}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-14 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border transition-all duration-300 ease-in-out grid grid-cols-3 gap-1">
            <TabsTrigger
              value="daily"
              className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{t("reports.daily")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t("reports.weekly")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
            >
              <div className="flex items-center justify-center gap-1.5">
                <PieChart className="h-4 w-4" />
                <span>Projects</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent
              value="daily"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="sticky top-0 z-10 -mt-1 pt-1 pb-3 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl">
                <Select
                  value={timeFilter}
                  onValueChange={(
                    value: "all" | "daily" | "weekly" | "monthly" | "yearly",
                  ) => setTimeFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background/50 hover:bg-accent/50 transition-all duration-150 rounded-xl border-border/50">
                    <SelectValue placeholder="Zaman aralığı seçin" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg">
                    <SelectItem
                      value="all"
                      className="py-2.5 cursor-pointer focus:bg-accent/50"
                    >
                      Tümü
                    </SelectItem>
                    <SelectItem
                      value="daily"
                      className="py-2.5 cursor-pointer focus:bg-accent/50"
                    >
                      Bugün
                    </SelectItem>
                    <SelectItem
                      value="weekly"
                      className="py-2.5 cursor-pointer focus:bg-accent/50"
                    >
                      Bu Hafta
                    </SelectItem>
                    <SelectItem
                      value="monthly"
                      className="py-2.5 cursor-pointer focus:bg-accent/50"
                    >
                      Bu Ay
                    </SelectItem>
                    <SelectItem
                      value="yearly"
                      className="py-2.5 cursor-pointer focus:bg-accent/50"
                    >
                      Bu Yıl
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                onDeleteEntry={(id) => {
                  const entry = entries.find((e) => e.id === id);
                  if (entry) {
                    setSelectedEntry(entry);
                    setShowDeleteDialog(true);
                  }
                }}
                onEditEntry={(id) => {
                  setEditTimeEntryDialog(true, id);
                }}
              />
            </TabsContent>

            <TabsContent
              value="weekly"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <WeeklyReport entries={entries} />
            </TabsContent>

            <TabsContent
              value="projects"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <ProjectsReport entries={entries} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <EditTimeEntryDialog
        entry={selectedEntry}
        projects={projects}
        customers={customers}
        onSave={handleEditEntry}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
