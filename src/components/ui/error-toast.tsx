import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorToastProps {
  title: string;
  message: string;
  severity?: ErrorSeverity;
}

export function ErrorToast({
  title,
  message,
  severity = "medium",
}: ErrorToastProps) {
  const severityConfig = {
    low: {
      icon: Info,
      className: "text-blue-500 dark:text-blue-400",
      bgClass: "bg-blue-500/10 dark:bg-blue-400/10",
    },
    medium: {
      icon: AlertTriangle,
      className: "text-yellow-500 dark:text-yellow-400",
      bgClass: "bg-yellow-500/10 dark:bg-yellow-400/10",
    },
    high: {
      icon: AlertCircle,
      className: "text-destructive dark:text-destructive",
      bgClass: "bg-destructive/10 dark:bg-destructive/10",
    },
    critical: {
      icon: XCircle,
      className: "text-red-600 dark:text-red-500",
      bgClass: "bg-red-600/10 dark:bg-red-500/10",
    },
  };

  const { icon: Icon, className, bgClass } = severityConfig[severity];

  return (
    <div className={cn("flex w-full flex-col gap-2 p-4", bgClass)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", className)} />
        <div className="grid gap-1">
          <div className="font-semibold text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{message}</div>
        </div>
      </div>
    </div>
  );
}
