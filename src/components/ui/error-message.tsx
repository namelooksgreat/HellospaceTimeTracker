import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, message, ...props }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm text-destructive mt-1.5",
          className,
        )}
        {...props}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        <span>{message}</span>
      </div>
    );
  },
);

ErrorMessage.displayName = "ErrorMessage";

export { ErrorMessage };
