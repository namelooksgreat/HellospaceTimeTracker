import { cn } from "@/lib/utils";

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export function AdminCard({
  icon,
  title,
  value,
  description,
  trend,
  className,
  ...props
}: AdminCardProps) {
  return (
    <div
      className={cn(
        "p-6 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10",
        "border border-border/50 rounded-xl",
        "transition-all duration-300 hover:shadow-lg hover:border-border/80",
        "group admin-card",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div className="p-2 bg-primary/10 rounded-xl transition-colors group-hover:bg-primary/20">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
          {trend && (
            <div
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}% {trend.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
