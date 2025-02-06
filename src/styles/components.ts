import { tokens } from "./design-tokens";

export const components = {
  // Layout Components
  card: {
    base: "bg-gradient-to-b from-background/95 via-background/80 to-background/90 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300",
    hover: "hover:shadow-xl hover:border-primary/20",
    inner:
      "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300",
  },

  // Form Components
  input: {
    base: "h-9 bg-background/50 transition-all duration-150 rounded-lg border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm",
    hover: "hover:bg-accent/50",
    focus: "focus-visible:ring-primary/50",
  },
  button: {
    base: "h-9 font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl",
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    outline: "border border-border/50 hover:bg-accent/50",
  },
  select: {
    content:
      "max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg dark:bg-popover/90",
    item: "py-2.5 cursor-pointer focus:bg-accent/50",
  },

  // Dialog Components
  dialog: {
    content:
      "max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10",
    header:
      "sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50",
  },

  // Timer Components
  timer: {
    display:
      "relative p-4 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group",
    button: "flex-1 h-12 rounded-xl transition-all duration-300",
    buttonRunning: "bg-primary hover:bg-primary/90 text-primary-foreground",
    buttonPaused: "border-border/50 hover:bg-accent/50",
    stopButton:
      "h-12 w-12 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300",
  },

  // Common Components
  iconButton:
    "h-8 w-8 rounded-lg hover:bg-accent/50 transition-colors duration-200",
  badge:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  avatar: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
};
