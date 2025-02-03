import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import TimeEntry from "./TimeEntry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {entries.map((entry) => (
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
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="yesterday" className="mt-0">
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No entries for yesterday
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Weekly view coming soon
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Timeline;
