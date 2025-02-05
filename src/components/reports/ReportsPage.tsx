import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { Calendar, BarChart2, PieChart } from "lucide-react";

interface TimeEntry {
  id: string;
  taskName: string;
  projectName: string;
  duration: number;
  startTime: string;
  projectColor: string;
}

interface ReportsPageProps {
  entries: TimeEntry[];
  onDeleteEntry?: (id: string) => void;
}

export function ReportsPage({ entries, onDeleteEntry }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState("daily");

  const calculateTotalDuration = (entries: TimeEntry[]) => {
    return entries.reduce((acc, entry) => {
      const duration =
        typeof entry.duration === "number" ? Math.max(0, entry.duration) : 0;
      return acc + duration;
    }, 0);
  };

  const getDailyEntries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
  };

  const getWeeklyEntries = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfWeek;
    });
  };

  const totalDuration = calculateTotalDuration(
    activeTab === "daily" ? getDailyEntries() : getWeeklyEntries(),
  );

  const formatTotalDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden sm:rounded-lg rounded-none border-x-0 sm:border-x">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Time Reports
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Total Time: {formatTotalDuration(totalDuration)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="daily"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Daily</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Weekly</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Projects</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="daily" className="m-0">
              <DailyReport entries={entries} onDeleteEntry={onDeleteEntry} />
            </TabsContent>
            <TabsContent value="weekly" className="m-0">
              <WeeklyReport entries={entries} />
            </TabsContent>
            <TabsContent value="projects" className="m-0">
              <ProjectsReport entries={entries} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
