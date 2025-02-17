import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDuration } from "@/lib/utils/time";
import { TimeEntry } from "@/types";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

interface TrendChartProps {
  entries: TimeEntry[];
}

export function TrendChart({ entries }: TrendChartProps) {
  const trendData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const days = eachDayOfInterval({ start, end }).map((date) => ({
      date: format(date, "MMM dd"),
      duration: 0,
      count: 0,
    }));

    entries.forEach((entry) => {
      const entryDate = new Date(entry.start_time);
      const dayIndex = days.findIndex(
        (day) => day.date === format(entryDate, "MMM dd"),
      );
      if (dayIndex !== -1) {
        days[dayIndex].duration += entry.duration;
        days[dayIndex].count += 1;
      }
    });

    return days.map((day) => ({
      ...day,
      avgDuration: day.count > 0 ? day.duration / day.count : 0,
    }));
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={2}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(value) => formatDuration(value)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">Date:</div>
                          <div>{data.date}</div>
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
              <Line
                type="monotone"
                dataKey="duration"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
