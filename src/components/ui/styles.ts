export const styles = {
  dialog: {
    content:
      "max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-xl dark:shadow-2xl dark:shadow-primary/10",
    header:
      "sticky top-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-xl border-b border-border/50",
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
  card: {
    base: "bg-gradient-to-b from-background/95 via-background/80 to-background/90 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300",
    hover: "hover:shadow-xl hover:border-primary/20",
    inner:
      "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10 border border-border/50 rounded-xl transition-all duration-300",
  },
  components: {
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
  commonStyles: {
    label:
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    input:
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    button:
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    dialog: {
      overlay: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      content:
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
    },
  },
};

export { styles as commonStyles };
