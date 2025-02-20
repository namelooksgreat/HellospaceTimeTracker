export const styles = {
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    hover: "hover:bg-accent/50 transition-colors duration-150",
  },
  label: {
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  },
  components: {
    selectContent:
      "rounded-lg border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg",
    selectItem: "py-2.5 cursor-pointer focus:bg-accent/50",
    stopButton:
      "h-11 sm:h-12 w-11 sm:w-12 rounded-lg sm:rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90",
    timerButton:
      "flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl transition-all duration-300",
    timerButtonRunning:
      "bg-gradient-to-tr from-purple-400 to-cyan-700 text-white hover:opacity-90",
    timerButtonPaused:
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90",
  },
};
