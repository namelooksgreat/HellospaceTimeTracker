import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import TimeEntry from "./TimeEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock, BarChart2 } from "lucide-react";
import { Separator } from "./ui/separator";

interface TimelineProps {
  entries?: Array<{
    id: string;
    taskName: string;
    projectName: string;
    duration: string;
    startTime: string;
    projectColor: string;
  }>;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

const Timeline = ({
  entries = [],
  onEditEntry = () => {},
  onDeleteEntry = () => {},
}: TimelineProps) => {
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
    <Card className="bg-card/95 dark:bg-card/90 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time Entries
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: {formatTotalDuration(totalDuration)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full h-12 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border transition-all duration-300 ease-in-out">
            <TabsTrigger
              value="today"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Today</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>This Week</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent
              value="today"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <ScrollArea className="h-[400px] overflow-y-auto overscroll-none">
                <div className="space-y-2">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <TimeEntry
                        key={entry.id}
                        taskName={entry.taskName}
                        projectName={entry.projectName}
                        duration={entry.duration}
                        startTime={entry.startTime}
                        projectColor={entry.projectColor}
                        onEdit={() => onEditEntry(entry.id)}
                        onDelete={() => onDeleteEntry(entry.id)}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />
                      <p className="text-center mb-1">No time entries yet</p>
                      <p className="text-sm text-muted-foreground/80">
                        Start tracking your time to see entries here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="week"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <BarChart2 className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-center mb-1">Weekly summary coming soon</p>
                <p className="text-sm text-muted-foreground/80">
                  Track your productivity across the week
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Timeline;
