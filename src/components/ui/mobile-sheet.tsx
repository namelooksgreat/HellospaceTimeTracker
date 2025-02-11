import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const MobileSheet = DialogPrimitive.Root;
const MobileSheetTrigger = DialogPrimitive.Trigger;

const MobileSheetPortal = DialogPrimitive.Portal;

const MobileSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9999] bg-black/80",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));

const MobileSheetWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9999] flex",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));

const MobileSheetContainer = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      // Base styles
      "fixed left-0 right-0 bottom-0 z-[9999]",
      "flex flex-col",
      "w-full",
      "bg-background",
      "rounded-t-[1.25rem]",
      "border-t border-border/50",
      "shadow-xl",

      // Animation
      "transition-transform duration-300 ease-out",
      "data-[state=open]:translate-y-0",
      "data-[state=closed]:translate-y-full",

      // Height management
      "max-h-[calc(100%-2rem)]",

      // Desktop styles
      "sm:hidden",

      className,
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Content>
));

const MobileSheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <MobileSheetPortal>
    <MobileSheetOverlay />
    <MobileSheetWrapper>
      <MobileSheetContainer className={className} {...props} ref={ref}>
        {children}
      </MobileSheetContainer>
    </MobileSheetWrapper>
  </MobileSheetPortal>
));

const MobileSheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-none",
      "px-4 py-4",
      "bg-background",
      "border-b border-border/50",
      className,
    )}
    {...props}
  />
));

const MobileSheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1",
      "overflow-y-auto",
      "-webkit-overflow-scrolling: touch",
      "px-4 py-4",
      className,
    )}
    {...props}
  />
));

const MobileSheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-none",
      "px-4 py-4",
      "bg-background",
      "border-t border-border/50",
      "pb-[calc(env(safe-area-inset-bottom)+1rem)]",
      className,
    )}
    {...props}
  />
));

const MobileSheetTitle = React.forwardRef<
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

const MobileSheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

export {
  MobileSheet,
  MobileSheetTrigger,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetBody,
  MobileSheetFooter,
  MobileSheetTitle,
  MobileSheetDescription,
};
