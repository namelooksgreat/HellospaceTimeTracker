import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Reset any existing styles
        "outline-none",

        // Base styles
        "fixed z-50 bg-background",

        // Mobile styles
        "inset-x-0 bottom-0", // Always stick to bottom on mobile
        "w-full", // Full width on mobile
        "rounded-t-[1.25rem]", // Rounded top corners
        "border-t border-border/50",

        // Mobile height with safe area
        "h-[85vh]", // 85% of viewport height
        "pb-[env(safe-area-inset-bottom)]", // iOS safe area

        // Desktop styles
        "sm:bottom-auto sm:left-1/2 sm:top-1/2", // Center on desktop
        "sm:-translate-x-1/2 sm:-translate-y-1/2", // Center transform
        "sm:h-auto sm:max-h-[85vh]", // Auto height, max 85vh
        "sm:w-[95vw] sm:max-w-lg", // Responsive width
        "sm:rounded-xl sm:border", // Full rounded on desktop

        // Animation
        "motion-safe:transition-all motion-safe:duration-200",

        className,
      )}
      {...props}
    >
      {/* Flex container for header, content, footer */}
      <div className="flex flex-col h-full overflow-hidden">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky top-0 z-20",
      "px-6 py-4",
      "bg-background/80 backdrop-blur-md",
      "border-b border-border/50",
      className,
    )}
    {...props}
  />
));

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky bottom-0 z-20",
      "p-6", // Larger padding for touch targets
      "pb-[max(24px,env(safe-area-inset-bottom))]", // Safe area handling
      "bg-background/80 backdrop-blur-md",
      "border-t border-border/50",
      className,
    )}
    {...props}
  />
));

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

const SheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto overscroll-contain px-6 py-4",
      "scrollbar-thin scrollbar-thumb-border/50",
      className,
    )}
    {...props}
  />
));

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
