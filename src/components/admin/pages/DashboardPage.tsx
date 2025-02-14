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

interface DashboardStats {
  users: number;
  customers: number;
  projects: number;
  timeEntries: number;
  recentEntries: TimeEntryType[];
  todayHours: number;
  totalEarnings: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    customers: 0,
    projects: 0,
    timeEntries: 0,
    recentEntries: [],
    todayHours: 0,
    totalEarnings: 0,
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
      <h1 className="text-3xl font-bold tracking-tight">Yönetim Paneli</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.users}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Müşteri
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.customers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bugünkü Çalışma
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats.todayHours.toFixed(1)}s`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kazanç</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats.totalEarnings.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Son Zaman Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">
                  Yükleniyor...
                </div>
              ) : stats.recentEntries.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Henüz kayıt yok
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
