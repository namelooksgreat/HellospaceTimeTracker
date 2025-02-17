import { useState, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils/time";
import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { updateTimeEntry } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { BarChart2, Calendar, PieChart, Clock, DollarSign } from "lucide-react";
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
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entries, setEntries] = useState(initialEntries);
  const [timeFilter, setTimeFilter] = useState<
    "all" | "daily" | "weekly" | "monthly" | "yearly"
  >("all");

  const TotalEarnings = ({ entries }: { entries: TimeEntry[] }) => {
    const [earnings, setEarnings] = useState(0);

    useEffect(() => {
      const calculateEarnings = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("User not found");

          const { data: rateData, error: rateError } = await supabase
            .from("developer_rates")
            .select("hourly_rate")
            .eq("user_id", user.id)
            .single();

          if (rateError) throw rateError;

          const hourlyRate = rateData?.hourly_rate || 0;
          const totalHours = entries.reduce(
            (acc, entry) => acc + entry.duration / 3600,
            0,
          );

          setEarnings(totalHours * hourlyRate);
        } catch (error) {
          console.error("Error calculating earnings:", error);
          setEarnings(0);
        }
      };

      calculateEarnings();
    }, [entries]);

    return (
      <div className="text-2xl font-mono font-bold tracking-tight">
        ${earnings.toFixed(2)}
      </div>
    );
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Apply time filter
    if (timeFilter !== "all") {
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
          return filtered;
      }

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    // Sort by start_time in descending order
    return filtered.sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  }, [entries, timeFilter]);

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      handleError(error, "ReportsPage");
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleEditEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
      hourlyRate?: number;
      currency?: string;
    }) => {
      if (!selectedEntry) return;

      try {
        // Update time entry
        const { error: entryError } = await supabase
          .from("time_entries")
          .update({
            task_name: data.taskName,
            project_id: data.projectId || null,
            description: data.description,
            duration: data.duration,
          })
          .eq("id", selectedEntry.id);

        if (entryError) throw entryError;

        // Update customer rate if user is admin and rate data is provided
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (
          user?.user_metadata?.role === "admin" &&
          data.customerId &&
          data.hourlyRate !== undefined &&
          data.currency
        ) {
          const { error: rateError } = await supabase
            .from("customer_rates")
            .upsert({
              customer_id: data.customerId,
              hourly_rate: data.hourlyRate,
              currency: data.currency,
              updated_at: new Date().toISOString(),
            });

          if (rateError) throw rateError;
        }

        // Refresh entries with full data
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
        setShowEditDialog(false);
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t("reports.totalHours")}</span>
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight">
                {formatDuration(
                  filteredEntries.reduce(
                    (acc, entry) => acc + entry.duration,
                    0,
                  ),
                )}
              </div>
              <div className="text-xs text-muted-foreground">
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

          <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{t("reports.totalEarnings")}</span>
              </div>
              <TotalEarnings entries={filteredEntries} />

              <div className="text-xs text-muted-foreground">
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
            <div className="mb-4 flex items-center gap-2">
              <Select
                value={timeFilter}
                onValueChange={(
                  value: "all" | "daily" | "weekly" | "monthly" | "yearly",
                ) => setTimeFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Zaman aralığı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="daily">Bugün</SelectItem>
                  <SelectItem value="weekly">Bu Hafta</SelectItem>
                  <SelectItem value="monthly">Bu Ay</SelectItem>
                  <SelectItem value="yearly">Bu Yıl</SelectItem>
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
                const entry = entries.find((e) => e.id === id);
                if (entry) {
                  setSelectedEntry(entry);
                  setShowEditDialog(true);
                }
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

      {selectedEntry && (
        <EditTimeEntryDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          entry={selectedEntry}
          projects={projects}
          customers={customers}
          onSave={handleEditEntry}
        />
      )}

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
