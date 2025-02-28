import React, { useState, useEffect } from "react";
import { reportWebVitals } from "./web-vitals";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

/**
 * Records a performance metric
 */
export function recordMetric(
  metric: Omit<PerformanceMetric, "timestamp">,
): void {
  metrics.push({
    ...metric,
    timestamp: Date.now(),
  });

  // Keep only the last 100 metrics
  if (metrics.length > 100) {
    metrics.shift();
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `%c[Performance] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${metric.rating === "good" ? "green" : metric.rating === "needs-improvement" ? "orange" : "red"};`,
    );
  }
}

/**
 * Gets all recorded metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Component that monitors and displays performance metrics
 */
export function PerformanceMonitor({ visible = false }: { visible?: boolean }) {
  const [isVisible, setIsVisible] = useState(visible);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Start monitoring web vitals
    reportWebVitals((metric) => {
      recordMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
    });

    // Update metrics periodically
    const intervalId = setInterval(() => {
      if (isVisible) {
        setCurrentMetrics(getMetrics());
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white px-3 py-1 rounded-full text-xs opacity-70 hover:opacity-100"
      >
        Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 w-80 max-h-80 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        {currentMetrics.length > 0 ? (
          currentMetrics.map((metric, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between">
                <span>{metric.name}</span>
                <span
                  className={`font-mono ${metric.rating === "good" ? "text-green-500" : metric.rating === "needs-improvement" ? "text-yellow-500" : "text-red-500"}`}
                >
                  {metric.value.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full ${metric.rating === "good" ? "bg-green-500" : metric.rating === "needs-improvement" ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{
                    width: `${Math.min(100, (metric.value / 5000) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No metrics recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
