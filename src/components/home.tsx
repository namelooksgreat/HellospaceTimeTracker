import React, { useState } from "react";
import TimeTracker from "./TimeTracker";
import Timeline from "./Timeline";
import BottomNav from "./BottomNav";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HomeProps {
  onTimeEntryStart?: () => void;
  onTimeEntryStop?: () => void;
  onTimeEntryEdit?: (id: string) => void;
  onTimeEntryDelete?: (id: string) => void;
  timeEntries?: Array<{
    id: string;
    taskName: string;
    projectName: string;
    duration: string;
    startTime: string;
    projectColor: string;
  }>;
}

const Home = ({
  onTimeEntryStart = () => {},
  onTimeEntryStop = () => {},
  onTimeEntryEdit = () => {},
  onTimeEntryDelete = () => {},
  timeEntries = [
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
}: HomeProps) => {
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "profile">(
    "timer",
  );
  const { session } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case "timer":
        return (
          <div className="space-y-6 p-4">
            <TimeTracker
              onStart={onTimeEntryStart}
              onStop={onTimeEntryStop}
              projects={[
                { id: "1", name: "Website Redesign", color: "#4F46E5" },
                { id: "2", name: "Mobile App", color: "#10B981" },
                { id: "3", name: "Backend API", color: "#F59E0B" },
              ]}
            />
            <Timeline
              entries={timeEntries}
              onEditEntry={onTimeEntryEdit}
              onDeleteEntry={onTimeEntryDelete}
            />
          </div>
        );
      case "reports":
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reports feature coming soon...
              </p>
            </CardContent>
          </Card>
        );
      case "profile":
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {session?.user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {session?.user?.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <ScrollArea className="h-[calc(100vh-5rem)] pt-14">
        <div className="max-w-2xl mx-auto">{renderContent()}</div>
      </ScrollArea>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;
