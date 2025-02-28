import { useState, useEffect } from "react";
import {
  getPerformanceMetrics,
  clearPerformanceMetrics,
} from "@/lib/utils/performance-monitor";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface PerformanceMonitorProps {
  visible?: boolean;
}

export function PerformanceMonitor({
  visible = false,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [isOpen, setIsOpen] = useState(visible);

  useEffect(() => {
    if (!isOpen) return;

    const intervalId = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100"
        onClick={() => setIsOpen(true)}
        size="sm"
      >
        Show Performance
      </Button>
    );
  }

  // Group metrics by component
  const componentMetrics: Record<
    string,
    { count: number; totalTime: number; avgTime: number }
  > = {};

  metrics.forEach((metric) => {
    if (!componentMetrics[metric.componentName]) {
      componentMetrics[metric.componentName] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
      };
    }

    componentMetrics[metric.componentName].count += 1;
    componentMetrics[metric.componentName].totalTime += metric.renderTime;
  });

  // Calculate averages
  Object.keys(componentMetrics).forEach((component) => {
    const { count, totalTime } = componentMetrics[component];
    componentMetrics[component].avgTime = totalTime / count;
  });

  // Sort components by average render time (descending)
  const sortedComponents = Object.entries(componentMetrics).sort(
    ([, a], [, b]) => b.avgTime - a.avgTime,
  );

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            Performance Monitor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearPerformanceMetrics()}
              className="h-7 text-xs"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {sortedComponents.map(([component, data]) => (
              <div key={component} className="text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">{component}</span>
                  <span className="text-muted-foreground">
                    {data.count} renders
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data.avgTime > 16 ? "bg-red-500" : data.avgTime > 8 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{
                        width: `${Math.min(100, (data.avgTime / 50) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="ml-2 text-muted-foreground">
                    {data.avgTime.toFixed(1)}ms
                  </span>
                </div>
              </div>
            ))}

            {sortedComponents.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No performance data available yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
