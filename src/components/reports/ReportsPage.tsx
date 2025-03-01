import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { AdvancedFilters } from "./AdvancedFilters";
import { DailyReport } from "./DailyReport";

import { TimeEntry } from "@/types";
import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/time";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  lightHapticFeedback,
  mediumHapticFeedback,
  errorHapticFeedback,
} from "@/lib/utils/haptics";

interface ReportsPageProps {
  entries: TimeEntry[];
  projects: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
    customer?: { id: string; name: string } | null;
  }>;
  customers: Array<{ id: string; name: string }>;
  onDeleteEntry?: (id: string) => void;
  onRefreshEntries?: () => Promise<void>;
}

import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { useDialogStore } from "@/store/dialogStore";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ReportsPage({
  entries,
  projects,
  customers,
  onDeleteEntry,
  onRefreshEntries,
}: ReportsPageProps) {
  const { editTimeEntryDialog, setEditTimeEntryDialog } = useDialogStore();
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(entries);
  const { session } = useAuth();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Update local state when entries prop changes
  useEffect(() => {
    setTimeEntries(entries);
  }, [entries]);

  const fetchTimeEntriesData = useCallback(async () => {
    try {
      // Fetch time entries with project and customer data
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch tags for each time entry
      const timeEntryIds = data?.map((entry) => entry.id) || [];
      const { data: tagData, error: tagError } = await supabase
        .from("time_entry_tags")
        .select(
          `
          time_entry_id,
          tag_id,
          project_tags!inner(id, name, color)
        `,
        )
        .in("time_entry_id", timeEntryIds);

      if (tagError) {
        console.error("Error fetching time entry tags:", tagError);
      }

      // Group tags by time entry ID
      const tagsByEntryId: Record<
        string,
        Array<{ id: string; name: string; color: string }>
      > = (tagData || []).reduce(
        (
          acc: Record<
            string,
            Array<{ id: string; name: string; color: string }>
          >,
          tag: any,
        ) => {
          if (!acc[tag.time_entry_id]) {
            acc[tag.time_entry_id] = [];
          }
          acc[tag.time_entry_id].push({
            id: tag.tag_id,
            name: tag.project_tags.name,
            color: tag.project_tags.color,
          });
          return acc;
        },
        {},
      );

      const transformedEntries = (data || []).map((entry) => ({
        ...entry,
        project: entry.project
          ? {
              id: entry.project.id,
              name: entry.project.name,
              color: entry.project.color,
              customer: entry.project.customer
                ? {
                    id: entry.project.customer.id,
                    name: entry.project.customer.name,
                    customer_rates: entry.project.customer.customer_rates,
                  }
                : undefined,
            }
          : undefined,
        tags: tagsByEntryId[entry.id] || [],
      }));

      setTimeEntries(transformedEntries);
      return transformedEntries;
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }
  }, []); // Empty dependency array since we don't use any external variables

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial fetch
    if (session?.user?.id) {
      fetchTimeEntriesData();
    }

    // Set up a polling interval as a fallback for realtime
    let intervalId: number | undefined;

    if (session?.user?.id) {
      intervalId = window.setInterval(() => {
        fetchTimeEntriesData();
      }, 5000); // Poll every 5 seconds for more responsive updates
    }

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [session?.user?.id, fetchTimeEntriesData]);

  const handleRefresh = useCallback(async () => {
    try {
      if (onRefreshEntries) {
        await onRefreshEntries();
        lightHapticFeedback(); // Provide feedback when refresh completes
      } else {
        const refreshedEntries = await fetchTimeEntriesData();
        setTimeEntries(refreshedEntries);
        lightHapticFeedback(); // Provide feedback when refresh completes
      }
    } catch (error) {
      errorHapticFeedback(); // Provide error feedback
      console.error("Failed to refresh entries:", error);
    }
  }, [onRefreshEntries, fetchTimeEntriesData]);

  const handleEditEntry = async (data: any) => {
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

      // Handle tags if provided
      if (data.tags && Array.isArray(data.tags)) {
        try {
          // First delete existing tags
          const { error: deleteTagsError } = await supabase
            .from("time_entry_tags")
            .delete()
            .eq("time_entry_id", selectedEntry.id);

          if (deleteTagsError) {
            console.error("Error deleting tags:", deleteTagsError);
          }

          // Then insert new tags if any
          if (data.tags.length > 0) {
            const tagEntries = data.tags.map((tagId: string) => ({
              time_entry_id: selectedEntry.id,
              tag_id: tagId,
              created_at: new Date().toISOString(),
            }));

            const { error: insertTagsError } = await supabase
              .from("time_entry_tags")
              .insert(tagEntries);

            if (insertTagsError) {
              console.error("Error inserting tags:", insertTagsError);
              toast.error("Etiketler güncellenirken bir hata oluştu");
            }
          }
        } catch (tagError) {
          console.error("Error managing tags:", tagError);
          // Continue with the rest of the update even if tag management fails
        }
      }

      // Close the dialog
      mediumHapticFeedback(); // Add haptic feedback for successful update
      setEditTimeEntryDialog(false, null);

      // Refresh data after update
      await fetchTimeEntriesData();
    } catch (error) {
      errorHapticFeedback(); // Add haptic feedback for error
      console.error("Error updating time entry:", error);
    }
  };

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh data after deletion
      mediumHapticFeedback(); // Add haptic feedback for successful deletion
      await fetchTimeEntriesData();
      toast.success("Time entry deleted successfully");
    } catch (error) {
      errorHapticFeedback(); // Add haptic feedback for error
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    }
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;

    // Direct deletion without async/await
    onDeleteEntry?.(entryToDelete);
    setEntryToDelete(null);
  };

  const [showFilters, setShowFilters] = useState(false);

  const [timeRange, setTimeRange] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >(
    () =>
      (localStorage.getItem("reportsTimeRange") as
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly") || "daily",
  );

  // Save timeRange to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("reportsTimeRange", timeRange);
  }, [timeRange]);

  const [userSettings, setUserSettings] = useState<{
    default_rate: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("default_rate, currency")
          .eq("user_id", session?.user?.id)
          .maybeSingle();

        if (settingsError && settingsError.code !== "PGRST116") {
          console.error("Error fetching user settings:", settingsError);
          return;
        }

        if (settingsData) {
          setUserSettings({
            default_rate: settingsData.default_rate,
            currency: settingsData.currency,
          });
        } else {
          // If no settings exist, create default ones
          const { error: insertError } = await supabase
            .from("user_settings")
            .insert({
              user_id: session?.user?.id,
              default_rate: 0,
              currency: "TRY",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating default settings:", insertError);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserSettings:", error);
      }
    };

    if (session?.user?.id) {
      fetchUserSettings();
    }
  }, [session?.user?.id]);

  const [filters, setFilters] = useState<{
    search: string;
    projectId: string;
    customerId: string;
    dateRange: DateRange | undefined;
  }>({
    search: "",
    projectId: "all",
    customerId: "all",
    dateRange: undefined,
  });

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    // Set time range based on selected filter
    switch (timeRange) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return timeEntries.filter((entry) => {
      const searchMatch =
        entry.task_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        entry.project?.name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const projectMatch =
        filters.projectId === "all" || entry.project_id === filters.projectId;

      const customerMatch =
        filters.customerId === "all" ||
        entry.project?.customer?.id === filters.customerId;

      let dateMatch = true;
      if (filters.dateRange?.from) {
        const entryDate = new Date(entry.start_time);
        const start = filters.dateRange.from;
        const end = filters.dateRange.to || filters.dateRange.from;
        dateMatch = entryDate >= start && entryDate <= end;
      } else {
        // Apply time range filter
        const entryDate = new Date(entry.start_time);
        dateMatch = entryDate >= startDate && entryDate <= now;
      }

      return searchMatch && projectMatch && customerMatch && dateMatch;
    });
  }, [timeEntries, filters, timeRange]);

  // Recalculate totals whenever filteredEntries changes
  const totalDuration = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
  }, [filteredEntries]);

  const totalEarnings = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      const hourlyRate = userSettings?.default_rate || 0;
      return sum + (entry.duration / 3600) * hourlyRate;
    }, 0);
  }, [filteredEntries, userSettings?.default_rate]);

  const handleTimeRangeChange = (
    value: "daily" | "weekly" | "monthly" | "yearly",
  ) => {
    lightHapticFeedback(); // Add haptic feedback when changing time range
    setTimeRange(value);
  };

  const toggleFilters = () => {
    lightHapticFeedback(); // Add haptic feedback when toggling filters
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
          <div className="p-2 rounded-lg bg-background text-foreground ring-1 ring-border/50 transition-colors duration-200">
            <Clock className="h-5 w-5" />
          </div>
          Reports
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={toggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="h-9 w-[130px] sm:w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">Total Time</div>
            </div>
            <div className="text-xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {formatDuration(totalDuration)}
            </div>
            <div className="text-xs text-muted-foreground">
              {timeRange === "daily"
                ? "Today"
                : timeRange === "weekly"
                  ? "This Week"
                  : timeRange === "monthly"
                    ? "This Month"
                    : "This Year"}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-black/80 dark:via-black/60 dark:to-black/40 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium">Total Earnings</div>
            </div>
            <div className="text-lg sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: userSettings?.currency || "TRY",
              }).format(totalEarnings)}
            </div>
            <div className="text-xs text-muted-foreground">
              {timeRange === "daily"
                ? "Today"
                : timeRange === "weekly"
                  ? "This Week"
                  : timeRange === "monthly"
                    ? "This Month"
                    : "This Year"}
            </div>
          </div>
        </Card>
      </div>

      {showFilters && (
        <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80">
          <CardContent className="p-4">
            <AdvancedFilters
              projects={projects}
              customers={customers}
              onFiltersChange={(newFilters) => {
                lightHapticFeedback(); // Add haptic feedback when changing filters
                setFilters((prev) => ({
                  ...prev,
                  ...newFilters,
                }));
              }}
            />
          </CardContent>
        </Card>
      )}

      <>
        <DailyReport
          entries={filteredEntries.map((entry) => ({
            id: entry.id,
            taskName: entry.task_name,
            projectName: entry.project?.name || "",
            duration: entry.duration,
            startTime: entry.start_time,
            createdAt: entry.created_at,
            projectColor: entry.project?.color || "#94A3B8",
            tags: entry.tags || [],
          }))}
          onDeleteEntry={handleDeleteTimeEntry}
          onEditEntry={(id) => {
            lightHapticFeedback(); // Add haptic feedback when editing
            const entry = timeEntries.find((e) => e.id === id);
            if (entry) {
              setSelectedEntry(entry);
              setEditTimeEntryDialog(true, id);
            }
          }}
          onRefresh={handleRefresh}
        />

        <EditTimeEntryDialog
          entry={selectedEntry}
          projects={projects}
          customers={customers}
          onSave={handleEditEntry}
        />

        <AlertDialog
          open={!!entryToDelete}
          onOpenChange={(open) => !open && setEntryToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this time entry? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => lightHapticFeedback()}>
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                type="button"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </div>
  );
}
