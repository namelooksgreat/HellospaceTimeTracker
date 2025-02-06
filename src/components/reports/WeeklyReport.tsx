import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import type { TimeEntry } from "@/types";

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

  const dailyHours = days.map((day) => {
    const dayEntries = entries.filter((entry) => {
      const date = new Date(entry.start_time);
      return date.getDay() === days.indexOf(day) + 1; // +1 because our array starts with Monday (1)
    });

    const totalHours = dayEntries.reduce((acc, entry) => {
      return acc + entry.duration / 3600; // Convert seconds to hours
    }, 0);

    return {
      day,
      hours: totalHours,
      color: "hsl(var(--primary))",
    };
  });

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
                style={{ "--progress-color": color } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
