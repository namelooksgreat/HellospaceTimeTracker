import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

const MobileDialog = Drawer.Root;

const MobileDialogTrigger = Drawer.Trigger;

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof Drawer.Content>,
  React.ComponentPropsWithoutRef<typeof Drawer.Content>
>(({ className, children, ...props }, ref) => (
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
    <Drawer.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-background",
        "border-t border-border/50 shadow-xl",
        "transition-transform duration-300 ease-in-out",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-1.5 w-[100px] rounded-full bg-muted" />
      {children}
    </Drawer.Content>
  </Drawer.Portal>
));
MobileDialogContent.displayName = "MobileDialogContent";

const MobileDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50",
      className,
    )}
    {...props}
  />
);
MobileDialogHeader.displayName = "MobileDialogHeader";

const MobileDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl border-t border-border/50 z-50",
      className,
    )}
    {...props}
  />
);
MobileDialogFooter.displayName = "MobileDialogFooter";

const MobileDialogTitle = React.forwardRef<
  React.ElementRef<typeof Drawer.Title>,
  React.ComponentPropsWithoutRef<typeof Drawer.Title>
>(({ className, ...props }, ref) => (
  <Drawer.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
MobileDialogTitle.displayName = "MobileDialogTitle";

const MobileDialogDescription = React.forwardRef<
  React.ElementRef<typeof Drawer.Description>,
  React.ComponentPropsWithoutRef<typeof Drawer.Description>
>(({ className, ...props }, ref) => (
  <Drawer.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MobileDialogDescription.displayName = "MobileDialogDescription";

export {
  MobileDialog,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
};
