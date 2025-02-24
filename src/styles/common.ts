export const commonStyles = {
  card: {
    base: "relative overflow-hidden bg-card/50 dark:bg-card/25 border border-border/50 transition-all duration-300 hover:bg-accent/5 hover:shadow-md group",
    gradients: {
      primary:
        "bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50",
      pattern:
        "bg-[linear-gradient(to_right,transparent_0%,transparent_49%,rgb(var(--primary))_50%,transparent_51%,transparent_100%)] opacity-[0.03] bg-[length:8px_100%]",
      grid: "bg-grid-white/[0.02]",
    },
  },
  button: {
    base: "h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
    variants: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-input hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
  },
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  },
};
