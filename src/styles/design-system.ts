export const designSystem = {
  colors: {
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
      50: "hsl(var(--primary-50))",
      100: "hsl(var(--primary-100))",
      200: "hsl(var(--primary-200))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
      hover: "hsl(var(--card-hover))",
    },
    input: {
      DEFAULT: "hsl(var(--input))",
      focus: "hsl(var(--input-focus))",
      hover: "hsl(var(--input-hover))",
    },
  },
  components: {
    card: {
      base: "bg-gradient-to-b from-background/95 via-background/80 to-background/90 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300",
      hover: "hover:shadow-xl hover:border-primary/20",
      inner:
        "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300",
    },
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
    dialog: {
      content:
        "max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10",
      header:
        "sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50",
    },
    timerDisplay:
      "relative p-4 bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border/80 group",
    iconButton:
      "h-8 w-8 rounded-lg hover:bg-accent/50 transition-colors duration-200",
    selectContent:
      "max-h-[280px] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg dark:bg-popover/90",
    selectItem: "py-2.5 cursor-pointer focus:bg-accent/50",
    timerButton: "flex-1 h-12 rounded-xl transition-all duration-300",
    timerButtonRunning:
      "bg-primary hover:bg-primary/90 text-primary-foreground",
    timerButtonPaused: "border-border/50 hover:bg-accent/50",
    stopButton:
      "h-12 w-12 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300",
  },
  animations: {
    slideUp: "animate-in fade-in-50 duration-500",
    fadeIn: "animate-in fade-in duration-300",
    scaleUp: "animate-in zoom-in-50 duration-300",
  },
};
