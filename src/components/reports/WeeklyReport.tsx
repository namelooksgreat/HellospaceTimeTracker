import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";

interface TimeEntry {
  id: string;
  taskName: string;
  projectName: string;
  duration: string;
  startTime: string;
  projectColor: string;
}

interface WeeklyReportProps {
  entries: TimeEntry[];
}

export function WeeklyReport({ entries }: WeeklyReportProps) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const maxHours = 8; // Maximum expected hours per day

  // Mock data - replace with actual calculations
  const dailyHours = days.map((day) => ({
    day,
    hours: Math.random() * maxHours,
    color: "hsl(var(--primary))",
  }));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {dailyHours.map(({ day, hours, color }) => (
            <div key={day} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>{day}</Label>
                <span className="text-muted-foreground">
                  {hours.toFixed(1)}h / {maxHours}h
                </span>
              </div>
              <Progress
                value={(hours / maxHours) * 100}
                className="h-2"
                indicatorClassName={color}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
