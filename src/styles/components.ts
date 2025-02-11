import { tokens } from "./design-tokens";

export const components = {
  // Layout Components
  card: {
    base: "bg-gradient-to-b from-background/95 via-background/80 to-background/90 backdrop-blur-xl border-border/50 overflow-hidden rounded-3xl shadow-lg transition-all duration-300",
    hover: "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
    inner:
      "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-2xl transition-all duration-300",
  },

  // Form Components
  input: {
    base: "h-12 bg-background/50 transition-all duration-150 rounded-xl border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 shadow-sm",
    hover: "hover:bg-accent/50",
    focus: "focus-visible:ring-primary/50",
  },
  button: {
    base: "h-12 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    outline: "border border-border/50 hover:bg-accent/50",
  },
  select: {
    content:
      "max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg dark:bg-popover/90",
    item: "py-3 cursor-pointer focus:bg-accent/50",
  },

  // Dialog Components
  dialog: {
    content:
      "max-w-lg w-full p-0 gap-0 overflow-hidden rounded-3xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10",
    header:
      "sticky top-0 z-10 p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50",
  },

  // Timer Components
  timer: {
    display:
      "relative p-6 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group overflow-hidden",
    time: "font-mono text-4xl sm:text-5xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary",
    button:
      "flex-1 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    buttonRunning: "bg-primary hover:bg-primary/90 text-primary-foreground",
    buttonPaused: "border-border/50 hover:bg-accent/50",
    stopButton:
      "h-12 w-12 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300",
    pattern:
      "absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]",
    gradient:
      "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50",
  },

  // Common Components
  iconButton:
    "h-9 w-9 rounded-lg hover:bg-accent/50 transition-colors duration-200",
  badge:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  avatar:
    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-border/50",

  // Stats Card
  statsCard: {
    base: "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-border/80 group",
    value:
      "font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground transition-colors duration-300 group-hover:text-primary",
    label: "text-sm text-muted-foreground flex items-center gap-2",
  },
};
