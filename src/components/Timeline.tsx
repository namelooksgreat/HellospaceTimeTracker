import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import TimeEntry from "./TimeEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock, BarChart2 } from "lucide-react";

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
  entries = [
    {
      id: "1",
      taskName: "Design Review",
      projectName: "Website Redesign",
      duration: "2h 15m",
      startTime: "9:00 AM",
      projectColor: "#4F46E5",
    },
    {
      id: "2",
      taskName: "Client Meeting",
      projectName: "Mobile App",
      duration: "1h 30m",
      startTime: "11:30 AM",
      projectColor: "#10B981",
    },
    {
      id: "3",
      taskName: "Code Review",
      projectName: "Backend API",
      duration: "45m",
      startTime: "2:00 PM",
      projectColor: "#F59E0B",
    },
  ],
  onEditEntry = () => {},
  onDeleteEntry = () => {},
}: TimelineProps) => {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden sm:rounded-lg rounded-none border-x-0 sm:border-x">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Time Entries
          </CardTitle>
          <div className="text-sm text-muted-foreground">Total: 4h 30m</div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="today" className="w-full">
          <div className="px-4 border-b border-border/50">
            <TabsList className="w-full h-11 p-1 bg-muted/50 rounded-lg my-3">
              <TabsTrigger
                value="today"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Today</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="flex-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-sm">This Week</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="today"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <ScrollArea
              className="h-[calc(100vh-24rem)] sm:h-[400px]"
              type="always"
            >
              <div className="p-3 space-y-2">
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Timeline;
