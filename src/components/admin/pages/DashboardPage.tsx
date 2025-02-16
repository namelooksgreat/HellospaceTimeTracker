import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
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

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <BarChart className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("admin.dashboard.title")}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.dashboard.stats.totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? t("common.loading") : stats.users}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.dashboard.stats.totalCustomers")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? t("common.loading") : stats.customers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.dashboard.stats.todayWork")}
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? t("common.loading")
                : `${stats.todayHours.toFixed(1)}s`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("admin.dashboard.stats.monthlyEarnings")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? t("common.loading")
                : `${stats.monthlyEarnings.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loading
                ? t("common.loading")
                : `${stats.totalEntries} ${t("admin.dashboard.stats.records")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("admin.dashboard.recentEntries")}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    createdAt={entry.created_at}
                    projectColor={entry.project?.color}
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
