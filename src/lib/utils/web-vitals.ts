/**
 * Utilities for measuring and reporting Web Vitals metrics
 */

type MetricName = "FCP" | "LCP" | "CLS" | "FID" | "TTFB";

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}

type ReportHandler = (metric: WebVitalMetric) => void;

// Thresholds based on web.dev/vitals
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  TTFB: { good: 800, poor: 1800 },
};

/**
 * Determines the rating of a metric value
 */
function getRating(
  name: MetricName,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const threshold = thresholds[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Reports First Contentful Paint (FCP)
 */
export function reportFCP(onReport: ReportHandler): void {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;

      const entry = entries[0];
      const value = entry.startTime;
      const delta = value;

      onReport({
        name: "FCP",
        value,
        delta,
        rating: getRating("FCP", value),
      });

      observer.disconnect();
    });

    observer.observe({ type: "paint", buffered: true });
  } catch (e) {
    console.error("Error reporting FCP:", e);
  }
}

/**
 * Reports Largest Contentful Paint (LCP)
 */
export function reportLCP(onReport: ReportHandler): void {
  if (!("PerformanceObserver" in window)) return;

  try {
    let lastValue = 0;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const entry = entries[entries.length - 1];

      const value = entry.startTime;
      const delta = value - lastValue;
      lastValue = value;

      onReport({
        name: "LCP",
        value,
        delta,
        rating: getRating("LCP", value),
      });
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });

    // Stop observing after the page is fully loaded
    window.addEventListener("beforeunload", () => observer.disconnect(), {
      once: true,
    });
  } catch (e) {
    console.error("Error reporting LCP:", e);
  }
}

/**
 * Reports all Web Vitals metrics
 */
export function reportWebVitals(onReport: ReportHandler): void {
  reportFCP(onReport);
  reportLCP(onReport);

  // Add other metrics as needed (CLS, FID, TTFB)
}
