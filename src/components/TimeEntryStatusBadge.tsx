import { cn } from "@/lib/utils";
import { Clock, Pause, Play, CheckCircle } from "lucide-react";
import { statusIndicators } from "@/styles/status-indicators";

type TimeEntryStatus = "active" | "paused" | "completed" | "overdue";

interface TimeEntryStatusBadgeProps {
  status: TimeEntryStatus;
  variant?: "dot" | "badge" | "pill";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function TimeEntryStatusBadge({
  status,
  variant = "badge",
  showIcon = true,
  showLabel = true,
  className,
}: TimeEntryStatusBadgeProps) {
  // Durum göstergesi için ikon seçimi
  const StatusIcon = {
    active: Play,
    paused: Pause,
    completed: CheckCircle,
    overdue: Clock,
  }[status];

  // Durum göstergesi için metin seçimi
  const statusLabel = {
    active: "Çalışıyor",
    paused: "Duraklatıldı",
    completed: "Tamamlandı",
    overdue: "Gecikmiş",
  }[status];

  if (variant === "dot") {
    return (
      <div
        className={cn(
          statusIndicators.dot.base,
          statusIndicators.dot[status],
          status === "active" && "animate-pulse",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        statusIndicators[variant].base,
        statusIndicators[variant][status],
        className,
      )}
    >
      {showIcon && <StatusIcon className="h-3 w-3" />}
      {showLabel && <span>{statusLabel}</span>}
    </div>
  );
}
