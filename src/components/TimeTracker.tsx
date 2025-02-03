import React, { useState, useEffect } from "react";
import { createTimeEntry } from "@/lib/api";
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
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
  availableTags?: Array<{ value: string; label: string }>;
}

const TimeTracker = ({
  onStart = () => {},
  onStop = () => {},
  onReset = () => {},
  initialTaskName = "",
  projects = [],

  customers = [
    { id: "1", name: "Customer 1" },
    { id: "2", name: "Customer 2" },
    { id: "3", name: "Customer 3" },
  ],
  availableTags = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "documentation", label: "Documentation" },
    { value: "design", label: "Design" },
    { value: "testing", label: "Testing" },
  ],
}: TimeTrackerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [taskName, setTaskName] = useState(
    localStorage.getItem("lastTaskName") || initialTaskName,
  );
  const [selectedCustomer, setSelectedCustomer] = useState(
    localStorage.getItem("selectedCustomerId") || customers[0]?.id || "",
  );
  const [selectedProject, setSelectedProject] = useState(
    localStorage.getItem("selectedProjectId") || "",
  );

  // Filter projects based on selected customer
  const customerProjects = projects.filter(
    (project) => project.customer_id === selectedCustomer,
  );
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

  const handleSaveTimeEntry = async (data: {
    taskName: string;
    projectId: string;
    customerId: string;
    description: string;
    tags: string[];
  }) => {
    try {
      await createTimeEntry(
        {
          task_name: data.taskName,
          description: data.description,
          duration: time,
          start_time: new Date(Date.now() - time * 1000).toISOString(),
          project_id: data.projectId,
        },
        data.tags,
      );

      onStop();
      setTaskName("");
      localStorage.removeItem("lastTaskName");
      localStorage.removeItem("lastDescription");
      localStorage.removeItem("selectedProjectId");
      localStorage.removeItem("selectedCustomerId");
      setTime(0);
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving time entry:", error);
      // TODO: Show error toast
    }
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
          <div className="space-y-4">
            <Select
              value={selectedCustomer}
              onValueChange={(value) => {
                setSelectedCustomer(value);
                setSelectedProject(""); // Reset project when customer changes
                localStorage.setItem("selectedCustomerId", value);
                localStorage.removeItem("selectedProjectId"); // Clear saved project when customer changes
              }}
            >
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

            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                localStorage.setItem("selectedProjectId", value);
              }}
              disabled={!selectedCustomer}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {customerProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => {
              setTaskName(e.target.value);
              localStorage.setItem("lastTaskName", e.target.value);
            }}
            className="w-full"
          />

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
        projects={projects}
        customers={customers}
        availableTags={availableTags}
        duration={time}
        onSave={handleSaveTimeEntry}
      />
    </Card>
  );
};

export default TimeTracker;
