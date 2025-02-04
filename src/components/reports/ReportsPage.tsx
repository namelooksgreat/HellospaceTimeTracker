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
  duration: string;
  startTime: string;
  projectColor: string;
}

interface ReportsPageProps {
  entries: TimeEntry[];
  onDeleteEntry?: (id: string) => void;
}

export function ReportsPage({ entries, onDeleteEntry }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState("daily");

  const totalDuration = entries.reduce((acc, entry) => {
    const [hours, minutes] = entry.duration.split("h ")[0].split("h");
    return acc + (parseInt(hours) * 60 + parseInt(minutes || "0"));
  }, 0);

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
