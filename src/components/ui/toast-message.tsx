import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

const toastMessageVariants = cva(
  "relative w-full flex items-start gap-3 p-4 rounded-lg shadow-md transition-all",
  {
    variants: {
      variant: {
        error: "toast-error",
        success: "toast-success",
        warning: "toast-warning",
        info: "toast-info",
      },
      dismissible: {
        true: "pr-10",
      },
    },
    defaultVariants: {
      variant: "info",
      dismissible: true,
    },
  },
);

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface ToastMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastMessageVariants> {
  title?: string;
  onDismiss?: () => void;
}

const ToastMessage = React.forwardRef<HTMLDivElement, ToastMessageProps>(
  (
    {
      className,
      variant = "info",
      dismissible = true,
      title,
      children,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const IconComponent = iconMap[variant as keyof typeof iconMap];

    return (
      <div
        ref={ref}
        className={cn(
          toastMessageVariants({ variant, dismissible }),
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
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-background/80 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  },
);

ToastMessage.displayName = "ToastMessage";

export { ToastMessage, toastMessageVariants };
