import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

const messageVariants = cva(
  "relative w-full flex items-center gap-3 p-4 rounded-lg transition-all",
  {
    variants: {
      variant: {
        error: "message-error",
        success: "message-success",
        warning: "message-warning",
        info: "message-info",
      },
      size: {
        sm: "message-sm",
        md: "message-md",
        lg: "message-lg",
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

export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {
  title?: string;
  onDismiss?: () => void;
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      className,
      variant = "info",
      size = "md",
      dismissible = false,
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
          messageVariants({ variant, size, dismissible }),
          className,
        )}
        role="alert"
        {...props}
      >
        {IconComponent && (
          <IconComponent
            className={cn(
              "h-5 w-5",
              variant === "error" && "text-destructive",
              variant === "success" && "text-green-600 dark:text-green-400",
              variant === "warning" && "text-yellow-600 dark:text-yellow-400",
              variant === "info" && "text-blue-600 dark:text-blue-400",
            )}
          />
        )}
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          <div className={title ? "text-sm opacity-100" : ""}>{children}</div>
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

Message.displayName = "Message";

export { Message, messageVariants };
