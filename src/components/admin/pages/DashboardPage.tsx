import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCard } from "../components/AdminCard";
import { AdminHeader } from "../components/AdminHeader";
import {
  BarChartIcon,
  Users,
  Building2,
  Clock,
  DollarSign,
  Timer,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api/admin";
import TimeEntry from "@/components/TimeEntry";
import { TimeEntry as TimeEntryType } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDuration } from "@/lib/utils/time";

interface DashboardStats {
  users: number;
  customers: number;
  projects: number;
  timeEntries: number;
  recentEntries: TimeEntryType[];
  todayHours: number;
  monthlyEarnings: number;
  totalEntries: number;
}

export function DashboardPage() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    customers: 0,
    projects: 0,
    timeEntries: 0,
    recentEntries: [],
    todayHours: 0,
    monthlyEarnings: 0,
    totalEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      setStats(data as DashboardStats);
      setLoading(false);
    };

    loadStats();
  }, []);

  // Prepare chart data by grouping entries by date
  const chartData = stats.recentEntries.reduce(
    (acc, entry) => {
      const date = new Date(entry.start_time).toLocaleDateString();
      const existingData = acc.find((item) => item.date === date);

      if (existingData) {
        existingData.duration += entry.duration;
        existingData.count += 1;
      } else {
        acc.push({
          date,
          duration: entry.duration,
          count: 1,
        });
      }

      return acc;
    },
    [] as Array<{ date: string; duration: number; count: number }>,
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <AdminHeader
        title={t("admin.dashboard.title")}
        description="Genel istatistikler ve aktiviteler"
        icon={<BarChartIcon className="h-5 w-5" />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          icon={<Users className="h-5 w-5 text-primary" />}
          title={t("admin.dashboard.stats.totalUsers")}
          value={loading ? t("common.loading") : stats.users.toString()}
          description={loading ? "" : "5 yeni kullanıcı bu ay"}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Building2 className="h-5 w-5 text-primary" />}
          title={t("admin.dashboard.stats.totalCustomers")}
          value={loading ? t("common.loading") : stats.customers.toString()}
          description={loading ? "" : "3 aktif müşteri"}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />

        <AdminCard
          icon={<Timer className="h-5 w-5 text-primary" />}
          title={t("admin.dashboard.stats.todayWork")}
          value={
            loading ? t("common.loading") : `${stats.todayHours.toFixed(1)}s`
          }
          description={loading ? "" : "↑ 12% geçen haftaya göre"}
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
          trend={{
            value: 12,
            label: "compared to last week",
            isPositive: true,
          }}
        />

        <AdminCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          title={t("admin.dashboard.stats.monthlyEarnings")}
          value={
            loading
              ? t("common.loading")
              : new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }).format(stats.monthlyEarnings)
          }
          description={
            loading
              ? t("common.loading")
              : `${stats.totalEntries} ${t("admin.dashboard.stats.records")}`
          }
          className="bg-card hover:bg-card/90 shadow-sm hover:shadow transition-all duration-200"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <CardHeader>
            <CardTitle className="text-lg relative z-10">
              {t("admin.dashboard.recentEntries")}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-muted-foreground">
                    {t("common.loading")}
                  </div>
                ) : stats.recentEntries.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    {t("admin.dashboard.noEntries")}
                  </div>
                ) : (
                  stats.recentEntries.map((entry) => (
                    <TimeEntry
                      key={entry.id}
                      taskName={entry.task_name}
                      projectName={entry.project?.name}
                      duration={entry.duration}
                      startTime={entry.start_time}
                      projectColor={entry.project?.color}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <CardHeader>
            <CardTitle className="text-lg relative z-10">
              Aktivite Grafiği
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                              <div className="font-medium">Tarih:</div>
                              <div>{data.date}</div>
                              <div className="font-medium">Toplam Süre:</div>
                              <div>{formatDuration(data.duration)}</div>
                              <div className="font-medium">Giriş Sayısı:</div>
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
      </div>
    </div>
  );
}
