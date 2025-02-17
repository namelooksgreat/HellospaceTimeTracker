import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] p-6 text-center animate-in fade-in-50 duration-500",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground/50 animate-in zoom-in-50 duration-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground/80 mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
