import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

const alertMessageVariants = cva(
  "relative w-full flex items-start gap-3 p-4 rounded-lg border transition-all",
  {
    variants: {
      variant: {
        error: "alert-error",
        success: "alert-success",
        warning: "alert-warning",
        info: "alert-info",
      },
      size: {
        sm: "p-3 text-xs rounded-md",
        md: "p-4 text-sm rounded-lg",
        lg: "p-5 text-base rounded-xl",
      },
      dismissible: {
        true: "pr-10",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "md",
      dismissible: false,
    },
  },
);

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertMessageVariants> {
  title?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const AlertMessage = React.forwardRef<HTMLDivElement, AlertMessageProps>(
  (
    {
      className,
      variant = "info",
      size = "md",
      dismissible = false,
      title,
      children,
      onDismiss,
      action,
      ...props
    },
    ref,
  ) => {
    const IconComponent = iconMap[variant as keyof typeof iconMap];

    return (
      <div
        ref={ref}
        className={cn(
          alertMessageVariants({ variant, size, dismissible }),
          className,
        )}
        role="alert"
        {...props}
      >
        {IconComponent && (
          <IconComponent
            className={cn(
              "h-5 w-5 mt-0.5",
              variant === "error" && "text-destructive",
              variant === "success" && "text-green-600 dark:text-green-400",
              variant === "warning" && "text-yellow-600 dark:text-yellow-400",
              variant === "info" && "text-blue-600 dark:text-blue-400",
            )}
          />
        )}
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          <div className={title ? "text-sm opacity-100 mt-1" : ""}>
            {children}
          </div>
          {action && <div className="mt-3">{action}</div>}
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-background/80 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  },
);

AlertMessage.displayName = "AlertMessage";

export { AlertMessage, alertMessageVariants };
