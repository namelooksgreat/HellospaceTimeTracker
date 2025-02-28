import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TimeEntry from "@/components/TimeEntry";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Calendar,
} from "lucide-react";
import { formatDuration, formatCurrency } from "@/lib/utils/common";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";
import type { ExportData } from "@/types/export";
import { TimeEntry as TimeEntryType } from "@/types";
import { LoadingState } from "@/components/ui/loading-state";
import { generateHTMLPreview } from "@/lib/utils/html-preview";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly" | "custom";

interface CustomerReport {
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
}

export function CustomerReportPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [report, setReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<{ name: string } | null>(
    null,
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntryType[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;

      try {
        setLoading(true);

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

        const now = new Date();
        let startDate = new Date();

        if (timeRange === "custom" && dateRange?.from) {
          startDate = dateRange.from;
          // If dateRange.to is not set, use dateRange.from as the end date
          now.setTime(
            dateRange.to ? dateRange.to.getTime() : dateRange.from.getTime(),
          );
          // Set time to end of day
          now.setHours(23, 59, 59, 999);
        } else {
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
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id")
          .eq("customer_id", customerId);

        if (projectsError) throw projectsError;

        const projectIds = projectsData?.map((p) => p.id) || [];

        if (projectIds.length === 0) {
          setTimeEntries([]);
          setReport({
            totalDuration: 0,
            totalEarnings: 0,
            currency: rateData?.currency || "TRY",
            hourlyRate: rateData?.hourly_rate || 0,
          });
          return;
        }

        const { data: entries, error: entriesError } = await supabase
          .from("time_entries")
          .select(
            `
            *,
            project:projects!inner(id, name, color, customer:customers!inner(
              id, name, customer_rates(hourly_rate, currency)
            ))
          `,
          )
          .in("project_id", projectIds)
          .gte("start_time", startDate.toISOString())
          .lte("start_time", now.toISOString())
          .order("start_time", { ascending: false });

        if (entriesError) throw entriesError;

        // Fetch tags for time entries
        const timeEntryIds = entries?.map((entry) => entry.id) || [];
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

        // Fetch user data separately to avoid join issues
        const userIds = entries?.map((entry) => entry.user_id) || [];
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, email, full_name")
          .in("id", userIds);

        if (usersError) throw usersError;

        // Create a map of user data for quick lookup
        const userMap = (usersData || []).reduce(
          (map, user) => {
            map[user.id] = user;
            return map;
          },
          {} as Record<string, any>,
        );

        const transformedEntries =
          entries?.map((entry) => ({
            ...entry,
            project: entry.project
              ? {
                  id: entry.project.id,
                  name: entry.project.name,
                  color: entry.project.color,
                  customer: entry.project.customer,
                }
              : undefined,
            user_email: userMap[entry.user_id]?.email || entry.user_id || "-",
            user_name:
              userMap[entry.user_id]?.full_name ||
              userMap[entry.user_id]?.email ||
              entry.user_id ||
              "-",
            tags: tagsByEntryId[entry.id] || [],
          })) || [];

        setTimeEntries(transformedEntries);

        const totalDuration = transformedEntries.reduce(
          (acc, entry) => acc + entry.duration,
          0,
        );
        const totalHours = totalDuration / 3600;
        const hourlyRate = rateData?.hourly_rate || 0;
        const totalEarnings = totalHours * hourlyRate;

        setReport({
          totalDuration,
          totalEarnings,
          currency: rateData?.currency || "TRY",
          hourlyRate,
        });
      } catch (error) {
        handleError(error, "CustomerReportPage");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, timeRange, dateRange]);

  const getReportData = () => {
    let periodText;
    if (timeRange === "custom" && dateRange?.from) {
      const fromDate = dateRange.from.toLocaleDateString("tr-TR");
      const toDate = dateRange.to
        ? dateRange.to.toLocaleDateString("tr-TR")
        : fromDate;
      periodText = `${fromDate} - ${toDate}`;
    } else {
      periodText = {
        daily: "Bugün",
        weekly: "Bu Hafta",
        monthly: "Bu Ay",
        yearly: "Bu Yıl",
        custom: "Özel Aralık",
      }[timeRange];
    }

    return {
      customerName: customerData?.name || "Müşteri",
      timeRange: periodText,
      totalDuration: report?.totalDuration || 0,
      totalEarnings: report?.totalEarnings || 0,
      currency: report?.currency || "TRY",
      hourlyRate: report?.hourlyRate || 0,
      entries: timeEntries,
    };
  };

  const handleExportPDF = () => {
    try {
      // Use the exportToPDF function directly from export.ts
      exportToPDF(getReportData());
      toast.success("PDF raporu başarıyla oluşturuldu");
    } catch (error) {
      toast.error("PDF oluşturulurken bir hata oluştu");
      console.error("PDF export error:", error);
    }
  };

  const handlePreviewReport = () => {
    // Generate HTML content directly and open in new window
    const htmlContent = generateHTMLPreview(getReportData());
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      toast.success("Rapor yeni pencerede açıldı");
    } else {
      toast.error(
        "Yeni pencere açılamadı. Lütfen popup engelleyiciyi kontrol edin.",
      );
    }
  };

  if (loading) {
    return (
      <LoadingState
        title="Yükleniyor"
        description="Müşteri raporu hazırlanıyor..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviewReport}>
            <FileText className="h-4 w-4 mr-2" />
            Raporu Görüntüle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                const exportData = {
                  customerName: customerData?.name || "Müşteri",
                  timeRange:
                    timeRange === "custom" && dateRange?.from
                      ? `${dateRange.from.toLocaleDateString("tr-TR")} - ${dateRange.to ? dateRange.to.toLocaleDateString("tr-TR") : dateRange.from.toLocaleDateString("tr-TR")}`
                      : {
                          daily: "Bugün",
                          weekly: "Bu Hafta",
                          monthly: "Bu Ay",
                          yearly: "Bu Yıl",
                          custom: "Özel Aralık",
                        }[timeRange],
                  totalDuration: report?.totalDuration || 0,
                  totalEarnings: report?.totalEarnings || 0,
                  currency: report?.currency || "TRY",
                  hourlyRate: report?.hourlyRate || 0,
                  entries: timeEntries,
                };
                // Add userName field for compatibility with ExportData type
                exportToExcel({
                  ...exportData,
                  userName: exportData.customerName,
                });
                toast.success("Excel raporu başarıyla oluşturuldu");
              } catch (error) {
                toast.error("Excel oluşturulurken bir hata oluştu");
                console.error("Excel export error:", error);
              }
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel İndir
          </Button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {customerData?.name || "Müşteri"} Raporu
          </h2>
          <p className="text-sm text-muted-foreground">
            Detaylı zaman ve kazanç raporu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => {
              setTimeRange(value);
              if (value !== "custom") {
                setDateRange(undefined);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zaman aralığı seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Bugün</SelectItem>
              <SelectItem value="weekly">Bu Hafta</SelectItem>
              <SelectItem value="monthly">Bu Ay</SelectItem>
              <SelectItem value="yearly">Bu Yıl</SelectItem>
              <SelectItem value="custom">Özel Aralık</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === "custom" && (
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium">Toplam Süre</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {formatDuration(report?.totalDuration || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeRange === "custom" && dateRange?.from
                  ? `${dateRange.from.toLocaleDateString("tr-TR")} - ${dateRange.to ? dateRange.to.toLocaleDateString("tr-TR") : dateRange.from.toLocaleDateString("tr-TR")}`
                  : timeRange === "daily"
                    ? "Bugün"
                    : timeRange === "weekly"
                      ? "Bu hafta"
                      : timeRange === "monthly"
                        ? "Bu ay"
                        : "Bu yıl"}{" "}
                için toplam
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium">Toplam Tutar</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                {formatCurrency(report?.totalEarnings || 0, report?.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {report?.hourlyRate} {report?.currency}/saat üzerinden
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Zaman Kayıtları</h3>
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
                    tags={entry.tags}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-center mb-1">
                    Bu dönem için kayıt bulunamadı
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Farklı bir zaman aralığı seçmeyi deneyin
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* No Report Preview Dialog needed anymore */}
    </div>
  );
}
