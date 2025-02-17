import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

const MobileSheet = Drawer.Root;

const MobileSheetTrigger = Drawer.Trigger;

const MobileSheetContent = React.forwardRef<
  React.ElementRef<typeof Drawer.Content>,
  React.ComponentPropsWithoutRef<typeof Drawer.Content>
>(({ className, children, ...props }, ref) => (
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
    <Drawer.Content
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </Drawer.Content>
  </Drawer.Portal>
));
MobileSheetContent.displayName = "MobileSheetContent";

const MobileSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
MobileSheetHeader.displayName = "MobileSheetHeader";

const MobileSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
MobileSheetFooter.displayName = "MobileSheetFooter";

const MobileSheetTitle = React.forwardRef<
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
MobileSheetTitle.displayName = "MobileSheetTitle";

const MobileSheetDescription = React.forwardRef<
  React.ElementRef<typeof Drawer.Description>,
  React.ComponentPropsWithoutRef<typeof Drawer.Description>
>(({ className, ...props }, ref) => (
  <Drawer.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MobileSheetDescription.displayName = "MobileSheetDescription";

export {
  MobileSheet,
  MobileSheetTrigger,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetFooter,
  MobileSheetTitle,
  MobileSheetDescription,
};
