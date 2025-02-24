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
import { Clock, DollarSign, FileSpreadsheet, FileText } from "lucide-react";
import { formatDuration, formatCurrency } from "@/lib/utils/common";
import { exportToPDF, exportToExcel } from "@/lib/utils/export";
import type { ExportData } from "@/types/export";
import { TimeEntry as TimeEntryType } from "@/types";
import { LoadingState } from "@/components/ui/loading-state";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface CustomerReport {
  totalDuration: number;
  totalEarnings: number;
  currency: string;
  hourlyRate: number;
}

export function CustomerReportPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [report, setReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<{ name: string } | null>(
    null,
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntryType[]>([]);

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
  }, [customerId, timeRange]);

  const handleExportPDF = () => {
    const periodText = {
      daily: "Bugun",
      weekly: "Bu Hafta",
      monthly: "Bu Ay",
      yearly: "Bu Yil",
    }[timeRange];

    exportToPDF({
      // @ts-expect-error - types are correct, TS is wrong
      customerName: customerData?.name || "Musteri",
      timeRange: periodText,
      totalDuration: report?.totalDuration || 0,
      totalEarnings: report?.totalEarnings || 0,
      currency: report?.currency || "TRY",
      hourlyRate: report?.hourlyRate || 0,
      entries: timeEntries,
    });
  };

  if (loading) {
    return (
      <LoadingState
        title="Yukleniyor"
        description="Musteri raporu hazirlaniyor..."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Indir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const periodText = {
                daily: "Bugun",
                weekly: "Bu Hafta",
                monthly: "Bu Ay",
                yearly: "Bu Yil",
              }[timeRange];

              exportToExcel({
                // @ts-expect-error - types are correct, TS is wrong
                customerName: customerData?.name || "Musteri",
                timeRange: periodText,
                totalDuration: report?.totalDuration || 0,
                totalEarnings: report?.totalEarnings || 0,
                currency: report?.currency || "TRY",
                hourlyRate: report?.hourlyRate || 0,
                entries: timeEntries,
              });
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Indir
          </Button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {customerData?.name || "Musteri"} Raporu
          </h2>
          <p className="text-sm text-muted-foreground">
            Detayli zaman ve kazanc raporu
          </p>
        </div>

        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zaman araligi sec" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Bugun</SelectItem>
            <SelectItem value="weekly">Bu Hafta</SelectItem>
            <SelectItem value="monthly">Bu Ay</SelectItem>
            <SelectItem value="yearly">Bu Yil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Toplam Sure</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatDuration(report?.totalDuration || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeRange === "daily"
                  ? "Bugun"
                  : timeRange === "weekly"
                    ? "Bu hafta"
                    : timeRange === "monthly"
                      ? "Bu ay"
                      : "Bu yil"}{" "}
                icin toplam
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Toplam Kazanc</h3>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">
                {formatCurrency(report?.totalEarnings || 0, report?.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {report?.hourlyRate} {report?.currency}/saat uzerinden
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Zaman Kayitlari</h3>
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
                    Bu donem icin kayit bulunamadi
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Farkli bir zaman araligi secmeyi deneyin
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
