import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDuration } from "@/lib/utils/time";
import { TimeEntry } from "@/types";

interface ProductivityChartProps {
  entries: TimeEntry[];
}

export function ProductivityChart({ entries }: ProductivityChartProps) {
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      duration: 0,
      count: 0,
    }));

    entries.forEach((entry) => {
      const hour = new Date(entry.start_time).getHours();
      hours[hour].duration += entry.duration;
      hours[hour].count += 1;
    });

    return hours.map((data) => ({
      ...data,
      hour: `${String(data.hour).padStart(2, "0")}:00`,
      avgDuration: data.count > 0 ? data.duration / data.count : 0,
    }));
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Hourly Productivity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="hour" />
              <YAxis tickFormatter={(value) => formatDuration(value)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">Time:</div>
                          <div>{data.hour}</div>
                          <div className="font-medium">Total Duration:</div>
                          <div>{formatDuration(data.duration)}</div>
                          <div className="font-medium">Entries:</div>
                          <div>{data.count}</div>
                          <div className="font-medium">Average:</div>
                          <div>{formatDuration(data.avgDuration)}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="duration"
                fill="hsl(var(--primary))"
                opacity={0.8}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
