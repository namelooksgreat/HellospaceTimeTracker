import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TimeEntryProps {
  taskName?: string;
  projectName?: string;
  duration?: string;
  startTime?: string;
  projectColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TimeEntry = ({
  taskName = "Sample Task",
  projectName = "Default Project",
  duration = "1h 30m",
  startTime = "9:00 AM",
  projectColor = "#4F46E5",
  onEdit = () => {},
  onDelete = () => {},
}: TimeEntryProps) => {
  return (
    <Card className="p-4 mb-2 bg-card hover:bg-accent/50 transition-all duration-200 border border-border rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{taskName}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{projectName}</span>
              <span>•</span>
              <span>{startTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {duration}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit entry</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="hover:bg-red-100 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete entry</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export default TimeEntry;
