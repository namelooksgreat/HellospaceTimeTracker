import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TimeTrackerProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  initialTaskName?: string;
  projects?: Array<{ id: string; name: string; color: string }>;
  customers?: Array<{ id: string; name: string }>;
}

const TimeTracker = ({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
  initialTaskName = "",
  projects = [
    { id: "1", name: "Project 1", color: "#4F46E5" },
    { id: "2", name: "Project 2", color: "#10B981" },
    { id: "3", name: "Project 3", color: "#F59E0B" },
  ],
  customers = [
    { id: "1", name: "Customer 1" },
    { id: "2", name: "Customer 2" },
    { id: "3", name: "Customer 3" },
  ],
}: TimeTrackerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [taskName, setTaskName] = useState(initialTaskName);
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0].id);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [mode, setMode] = useState<"list" | "pomodoro">("list");

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      setShowSaveDialog(true);
    } else {
      setIsRunning(true);
      onStart();
    }
  };

  const handleSaveTimeEntry = (data: {
    taskName: string;
    projectId: string;
    description: string;
  }) => {
    onStop();
    setTaskName("");
    setTime(0);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-6">
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon" className="shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleStartStop}
              variant={isRunning ? "destructive" : "default"}
              className="w-full h-12 text-lg font-medium"
            >
              {isRunning ? "Stop" : "Start"}
            </Button>
            <div className="text-center font-mono text-4xl font-semibold tracking-tight">
              {formatTime(time)}
            </div>
          </div>
        </div>
      </CardContent>

      <SaveTimeEntryDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        taskName={taskName}
        projectId={selectedProject}
        customerId={selectedCustomer}
        customers={customers}
        duration={formatTime(time)}
        onSave={handleSaveTimeEntry}
      />
    </Card>
  );
};

export default TimeTracker;
