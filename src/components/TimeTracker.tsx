import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SaveTimeEntryDialog } from "./SaveTimeEntryDialog";
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-xl p-6 mb-6 border border-border shadow-sm">
        <div className="grid grid-cols-2 gap-1 bg-accent p-1 rounded-lg mb-6">
          <button
            onClick={() => setMode("list")}
            className={`py-2 px-4 rounded-md transition-colors ${mode === "list" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent-foreground/10"}`}
          >
            List
          </button>
          <button
            onClick={() => setMode("pomodoro")}
            className={`py-2 px-4 rounded-md transition-colors ${mode === "pomodoro" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent-foreground/10"}`}
          >
            Pomodoro
          </button>
        </div>

        <div className="space-y-6">
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem
                  key={customer.id}
                  value={customer.id}
                  className="hover:bg-accent focus:bg-accent"
                >
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="I'm working on..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="flex-grow"
            />
            <button className="bg-accent p-2 rounded-lg hover:bg-accent-foreground/10 transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15C19.7 14.1 20 13.1 20 12C20 6.5 16.2 2 12 2C7.8 2 4 6.5 4 12C4 17.5 7.8 22 12 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleStartStop}
              className={`w-full py-6 text-lg font-medium rounded-xl transition-colors ${isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
            >
              {isRunning ? "Stop" : "Start"}
            </Button>
            <div className="text-center font-mono text-3xl font-semibold text-foreground">
              {formatTime(time)}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default TimeTracker;
