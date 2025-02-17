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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

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
    loadData();
  }, []);

  const filterAndSortEntries = (
    data: TimeEntry[],
    query: string,
    sort: string,
    user: string,
  ) => {
    let filtered = data.filter(
      (entry) =>
        entry.task_name.toLowerCase().includes(query.toLowerCase()) &&
        (user === "all" || entry.user_id === user),
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
    </div>
  );
}
