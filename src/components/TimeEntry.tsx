import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
    <Card className="p-3 bg-card hover:bg-accent/50 transition-all duration-200 border border-border/50 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5 sm:mt-0"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{taskName}</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="truncate">{projectName}</span>
              <span className="hidden sm:inline">•</span>
              <span>{startTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
          <div className="text-base sm:text-lg font-semibold text-foreground">
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="h-10 w-10 hover:bg-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
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
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Delete entry</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimeEntry;
