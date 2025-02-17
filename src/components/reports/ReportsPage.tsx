import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { AdvancedFilters } from "./AdvancedFilters";
import { DailyReport } from "./DailyReport";
import { ProductivityChart } from "./ProductivityChart";
import { TrendChart } from "./TrendChart";
import { TimeEntry } from "@/types";
import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/time";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ReportsPageProps {
  entries: TimeEntry[];
  projects: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string }>;
  onDeleteEntry?: (id: string) => void;
}

export default function ReportsPage({
  entries,
  projects,
  customers,
  onDeleteEntry,
}: ReportsPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [timeRange, setTimeRange] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");

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

  const filteredEntries = entries.filter((entry) => {
    const searchMatch =
      entry.task_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.project?.name?.toLowerCase().includes(filters.search.toLowerCase());

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
    }

    return searchMatch && projectMatch && customerMatch && dateMatch;
  });

  const totalDuration = filteredEntries.reduce(
    (sum, entry) => sum + entry.duration,
    0,
  );

  const totalEarnings = filteredEntries.reduce((sum, entry) => {
    const hourlyRate =
      entry.project?.customer?.customer_rates?.[0]?.hourly_rate || 0;
    return sum + (entry.duration / 3600) * hourlyRate;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            View detailed time tracking reports
          </p>
        </div>

        <Select
          value={timeRange}
          onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") =>
            setTimeRange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
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

      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-x-visible sm:pb-0 sm:grid sm:grid-cols-2">
        <Card className="flex-shrink-0 w-[180px] sm:w-auto bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="truncate">Total Time</span>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-bold tracking-tight">
              {formatDuration(totalDuration)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
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

        <Card className="flex-shrink-0 w-[180px] sm:w-auto bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="truncate">Total Earnings</span>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-bold tracking-tight">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(totalEarnings)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
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

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? (
          <ChevronUp className="h-4 w-4 mr-2" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-2" />
        )}
        Filters
      </Button>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <AdvancedFilters
              projects={projects}
              customers={customers}
              onFiltersChange={(newFilters) => {
                setFilters((prev) => ({
                  ...prev,
                  ...newFilters,
                }));
              }}
            />
          </CardContent>
        </Card>
      )}

      {!isMobile && (
        <div className="grid gap-6 md:grid-cols-2">
          <ProductivityChart entries={filteredEntries} />
          <TrendChart entries={filteredEntries} />
        </div>
      )}

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
        onDeleteEntry={onDeleteEntry}
      />
    </div>
  );
}
