import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TimeEntry from "@/components/TimeEntry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/time";
import { exportToPDF, exportToExcel } from "@/lib/utils/export";
import { TimeEntry as TimeEntryType } from "@/types";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface CustomerReport {
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
}

export function CustomerReportPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [report, setReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<{ name: string } | null>(
    null,
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntryType[]>([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("name")
          .eq("id", customerId)
          .single();

        if (customerError) throw customerError;
        setCustomerData(customerData);

        const { data: rateData, error: rateError } = await supabase
          .from("customer_rates")
          .select("hourly_rate, currency")
          .eq("customer_id", customerId)
          .single();

        if (rateError && rateError.code !== "PGRST116") throw rateError;

        // Get time entries based on time range
        const now = new Date();
        let startDate = new Date();

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

        const { data: entries, error: entriesError } = await supabase
          .from("time_entries")
          .select(
            `
            *,
            project:projects!left(id, name, color, customer:customers!left(
              id, name, customer_rates(hourly_rate, currency)
            ))
          `,
          )
          .eq("project.customer_id", customerId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", now.toISOString())
          .order("created_at", { ascending: false });

        setTimeEntries(entries || []);

        if (entriesError) throw entriesError;

        const totalDuration =
          entries?.reduce((acc, entry) => acc + entry.duration, 0) || 0;
        const totalHours = totalDuration / 3600; // Convert seconds to hours
        const totalEarnings = totalHours * (rateData?.hourly_rate || 0);

        setReport({
          totalDuration,
          totalEarnings,
          currency: rateData?.currency || "USD",
          hourlyRate: rateData?.hourly_rate || 0,
        });
      } catch (error) {
        handleError(error, "CustomerReportPage");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, timeRange]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToPDF({
                userName: customerData?.name || "",
                timeRange,
                totalDuration: report?.totalDuration || 0,
                totalEarnings: report?.totalEarnings || 0,
                currency: report?.currency || "USD",
                hourlyRate: report?.hourlyRate || 0,
                entries: timeEntries,
              })
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToExcel({
                userName: customerData?.name || "",
                timeRange,
                totalDuration: report?.totalDuration || 0,
                totalEarnings: report?.totalEarnings || 0,
                currency: report?.currency || "USD",
                hourlyRate: report?.hourlyRate || 0,
                entries: timeEntries,
              })
            }
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {customerData?.name}'s Report
          </h2>
          <p className="text-sm text-muted-foreground">
            View detailed time and earnings report
          </p>
        </div>

        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Today</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="yearly">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Time</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatDuration(report?.totalDuration || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For {timeRange} period
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Earnings</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {report?.totalEarnings.toFixed(2)} {report?.currency}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {report?.hourlyRate} {report?.currency}/hour rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Time Entries</h3>
          </div>
          <ScrollArea className="h-[400px] pr-4 -mr-4">
            <div className="space-y-3">
              {timeEntries.length > 0 ? (
                timeEntries.map((entry) => (
                  <TimeEntry
                    key={entry.id}
                    taskName={entry.task_name}
                    projectName={entry.project?.name || ""}
                    duration={entry.duration}
                    startTime={entry.start_time}
                    projectColor={entry.project?.color || "#94A3B8"}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-center mb-1">
                    No time entries for this period
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Try selecting a different time range
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
