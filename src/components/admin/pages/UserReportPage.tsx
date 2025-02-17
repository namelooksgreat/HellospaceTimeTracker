import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TimeEntry from "@/components/TimeEntry";
import {
  Clock,
  DollarSign,
  BarChart2,
  Calendar,
  PieChart,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { formatDuration } from "@/lib/utils/time";
import { exportToPDF, exportToExcel } from "@/lib/utils/export";
import { TimeEntry as TimeEntryType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface UserReport {
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
  projectDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyActivity: Array<{
    date: string;
    duration: number;
    count: number;
  }>;
}

export function UserReportPage() {
  const { userId } = useParams<{ userId: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ full_name: string } | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntryType[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setUserData(userData);

        // Get user settings (for rate)
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("default_rate, currency")
          .eq("user_id", userId)
          .single();

        if (settingsError && settingsError.code !== "PGRST116")
          throw settingsError;

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
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", now.toISOString())
          .order("created_at", { ascending: false });

        if (entriesError) throw entriesError;
        setTimeEntries(entries || []);

        // Calculate project distribution
        const projectStats = entries?.reduce(
          (
            acc: Record<
              string,
              { duration: number; color: string; name: string }
            >,
            entry,
          ) => {
            if (entry.project) {
              const projectId = entry.project.id;
              if (!acc[projectId]) {
                acc[projectId] = {
                  duration: 0,
                  color: entry.project.color,
                  name: entry.project.name,
                };
              }
              acc[projectId].duration += entry.duration;
            }
            return acc;
          },
          {},
        );

        // Calculate daily activity
        const dailyStats = entries?.reduce(
          (acc: Record<string, { duration: number; count: number }>, entry) => {
            const date = new Date(entry.created_at).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = { duration: 0, count: 0 };
            }
            acc[date].duration += entry.duration;
            acc[date].count += 1;
            return acc;
          },
          {},
        );

        const totalDuration =
          entries?.reduce((acc, entry) => acc + entry.duration, 0) || 0;
        const hourlyRate = settingsData?.default_rate || 0;
        const totalEarnings = (totalDuration / 3600) * hourlyRate;

        setReport({
          totalDuration,
          totalEarnings,
          currency: settingsData?.currency || "USD",
          hourlyRate,
          projectDistribution: Object.values(projectStats || {}).map(
            ({ duration, color, name }) => ({
              name,
              value: duration,
              color,
            }),
          ),
          dailyActivity: Object.entries(dailyStats || {}).map(
            ([date, { duration, count }]) => ({
              date,
              duration,
              count,
            }),
          ),
        });
      } catch (error) {
        handleError(error, "UserReportPage");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, timeRange]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            {userData?.full_name}'s Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Detailed time tracking and performance analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToPDF({
                userName: userData?.full_name || "",
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
                userName: userData?.full_name || "",
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50">
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

        <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Earnings</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: report?.currency || "USD",
                }).format(report?.totalEarnings || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {report?.hourlyRate} {report?.currency}/hour rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Time Entries</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{timeEntries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average{" "}
                {formatDuration(
                  Math.round(
                    (report?.totalDuration || 0) / (timeEntries.length || 1),
                  ),
                )}{" "}
                per entry
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report?.dailyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatDuration(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Date:</div>
                              <div>{data.date}</div>
                              <div className="font-medium">Duration:</div>
                              <div>{formatDuration(data.duration)}</div>
                              <div className="font-medium">Entries:</div>
                              <div>{data.count}</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="duration"
                    fill="hsl(var(--primary))"
                    opacity={0.8}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Project Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={report?.projectDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name} (${formatDuration(value)})`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {report?.projectDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Project:</div>
                              <div>{data.name}</div>
                              <div className="font-medium">Duration:</div>
                              <div>{formatDuration(data.value)}</div>
                              <div className="font-medium">Percentage:</div>
                              <div>
                                {(
                                  (data.value / (report?.totalDuration || 1)) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">
                  Loading...
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No time entries for this period
                </div>
              ) : (
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
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
