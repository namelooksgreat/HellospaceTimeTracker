import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { TimeEntry } from "@/types";
import { formatDuration } from "@/lib/utils/time";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date_desc");
  const [userFilter, setUserFilter] = useState("all");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();
  const { user } = useAuth();

  const loadData = async () => {
    await handleAsync(
      async () => {
        const { data: entriesData, error } = await supabase
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

        // Fetch tags for time entries
        const timeEntryIds = entriesData?.map((entry) => entry.id) || [];
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
          console.warn("Error fetching time entry tags:", tagError);
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

        const transformedEntries = (entriesData || []).map((entry) => ({
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

        setEntries(transformedEntries);
        filterAndSortEntries(
          transformedEntries,
          searchQuery,
          sortBy,
          userFilter,
        );
      },
      {
        loadingMessage: "Loading time entries...",
        errorMessage: "Failed to load time entries",
      },
    );
  };

  useEffect(() => {
    // Initial load
    loadData();

    // Set up polling for real-time updates
    let intervalId: number | undefined;

    intervalId = window.setInterval(() => {
      loadData();
    }, 5000); // Poll every 5 seconds for more responsive updates

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [user?.id]);

  const filterAndSortEntries = (
    data: TimeEntry[],
    query: string,
    sort: string,
    userFilter: string,
  ) => {
    let filtered = data.filter(
      (entry) =>
        entry.task_name.toLowerCase().includes(query.toLowerCase()) &&
        (userFilter === "all" || entry.user_id === userFilter),
    );

    filtered.sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "date_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "duration_asc":
          return a.duration - b.duration;
        case "duration_desc":
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    setFilteredEntries(filtered);
  };

  useEffect(() => {
    filterAndSortEntries(entries, searchQuery, sortBy, userFilter);
  }, [entries, searchQuery, sortBy, userFilter]);

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      // Admin users can delete any entry
      const isAdmin = user?.email?.includes("admin") || false;

      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", entryToDelete);

      if (error) throw error;

      toast.success("Time entry deleted successfully");
      loadData();
      setEntryToDelete(null);
    } catch (error) {
      handleError(error, "TimeEntriesPage");
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load time entries"
        description={error.message}
        onRetry={() => {
          clearError();
          loadData();
        }}
      />
    );
  }

  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <AdminHeader
        title="Time Entries"
        description="View and manage time tracking records"
      />

      <AdminFilters
        searchProps={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search time entries...",
        }}
        selectedCount={selectedEntries.length}
        bulkActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        }
      >
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="duration_desc">Longest First</SelectItem>
            <SelectItem value="duration_asc">Shortest First</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>

      <AdminTable
        data={paginatedEntries}
        columns={[
          {
            header: "Select",
            cell: (entry) => (
              <Checkbox
                checked={selectedEntries.includes(entry.id)}
                onCheckedChange={(checked) => {
                  setSelectedEntries((prev) =>
                    checked
                      ? [...prev, entry.id]
                      : prev.filter((id) => id !== entry.id),
                  );
                }}
              />
            ),
          },
          {
            header: "Task",
            cell: (entry) => (
              <div>
                <div className="font-medium">{entry.task_name}</div>
                {entry.project && (
                  <div className="text-sm text-muted-foreground">
                    {entry.project.name}
                  </div>
                )}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="px-2 py-0 h-5 text-xs flex items-center gap-1 bg-primary/5"
                        style={{ borderColor: tag.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            header: "Duration",
            cell: (entry) => formatDuration(entry.duration),
          },
          {
            header: "Start Time",
            cell: (entry) => new Date(entry.start_time).toLocaleString(),
          },
          {
            header: "Created At",
            cell: (entry) => new Date(entry.created_at).toLocaleString(),
          },
          {
            header: "Actions",
            cell: (entry) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEntryToDelete(entry.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        loading={isLoading}
      />

      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredEntries.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              type="button"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
