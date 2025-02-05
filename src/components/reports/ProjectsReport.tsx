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

interface ProjectsReportProps {
  entries: TimeEntry[];
}

export function ProjectsReport({ entries }: ProjectsReportProps) {
  // Group entries by project and calculate total duration
  const projectStats = entries.reduce(
    (acc, entry) => {
      const duration = typeof entry.duration === "number" ? entry.duration : 0;
      const durationInMinutes = Math.floor(duration / 60);

      if (!acc[entry.projectName]) {
        acc[entry.projectName] = {
          duration: 0,
          color: entry.projectColor,
        };
      }
      acc[entry.projectName].duration += durationInMinutes;
      return acc;
    },
    {} as Record<string, { duration: number; color: string }>,
  );

  const totalDuration = Object.values(projectStats).reduce(
    (sum, { duration }) => sum + duration,
    0,
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Object.entries(projectStats).map(
            ([projectName, { duration, color }]) => (
              <div key={projectName} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <Label>{projectName}</Label>
                  </div>
                  <span className="text-muted-foreground">
                    {formatDuration(duration)} (
                    {((duration / totalDuration) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={(duration / totalDuration) * 100}
                  className="h-2"
                  indicatorClassName={`bg-[${color}]`}
                />
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
}
