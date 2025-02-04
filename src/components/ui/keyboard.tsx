import * as React from "react";
import { cn } from "@/lib/utils";

const Keyboard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted px-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Keyboard.displayName = "Keyboard";

const KeyboardKey = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
KeyboardKey.displayName = "KeyboardKey";

const KeyboardShortcut = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    keys?: string[];
  }
>(({ className, keys = [], ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-1", className)} {...props}>
    {keys.map((key, index) => (
      <KeyboardKey key={index}>{key}</KeyboardKey>
    ))}
  </div>
));
KeyboardShortcut.displayName = "KeyboardShortcut";

export { Keyboard, KeyboardKey, KeyboardShortcut };
