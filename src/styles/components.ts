// Component style tokens for consistent component styling

export const cardStyles = {
  // Card variants
  default:
    "relative overflow-hidden bg-card/50 dark:bg-card/25 border border-border/50 rounded-xl shadow-sm transition-all transition-medium ease-default hover:shadow-md hover:border-border/80",
  gradient:
    "relative overflow-hidden bg-card/50 dark:bg-card/25 border border-border/50 rounded-xl shadow-sm transition-all transition-medium ease-default hover:shadow-md hover:border-border/80",
  elevated:
    "relative overflow-hidden bg-card/80 dark:bg-card/40 border border-border/60 rounded-xl shadow-md transition-all transition-medium ease-default hover:shadow-lg hover:border-border/90",
  flat: "relative overflow-hidden bg-card/30 dark:bg-card/10 border border-border/30 rounded-xl transition-all transition-medium ease-default hover:bg-card/40 dark:hover:bg-card/20",
  interactive:
    "relative overflow-hidden bg-card/50 dark:bg-card/25 border border-border/50 rounded-xl shadow-sm cursor-pointer transition-all transition-medium ease-default hover:shadow-md hover:border-border/80 hover:bg-muted/50 active:scale-[0.99]",
};

export const buttonStyles = {
  // Button sizes
  sizes: {
    xs: "h-7 px-2 text-xs rounded-md",
    sm: "h-8 px-3 text-sm rounded-lg",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
    xl: "h-14 px-8 text-lg rounded-xl",
    icon: {
      xs: "h-7 w-7 rounded-md",
      sm: "h-8 w-8 rounded-lg",
      md: "h-10 w-10 rounded-lg",
      lg: "h-12 w-12 rounded-xl",
      xl: "h-14 w-14 rounded-xl",
    },
  },

  // Button variants
  variants: {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors transition-medium ease-default",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors transition-medium ease-default",
    outline:
      "border border-input bg-background hover:bg-muted/50 hover:text-accent-foreground transition-colors transition-medium ease-default",
    ghost:
      "bg-transparent hover:bg-muted/50 text-foreground transition-colors transition-medium ease-default",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors transition-medium ease-default",
    link: "text-primary underline-offset-4 hover:underline transition-colors transition-medium ease-default",
  },
};

export const badgeStyles = {
  // Badge sizes
  sizes: {
    xs: "h-4 px-1 text-[10px] rounded-sm",
    sm: "h-5 px-2 text-xs rounded-md",
    md: "h-6 px-2.5 text-xs rounded-md",
    lg: "h-7 px-3 text-sm rounded-lg",
  },

  // Badge variants
  variants: {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-transparent",
    destructive: "bg-destructive text-destructive-foreground",
    success:
      "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30",
    warning:
      "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30",
    info: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30",
    tag: "bg-primary/10 text-primary border border-primary/20 flex items-center gap-1",
  },
};

export const inputStyles = {
  // Input sizes
  sizes: {
    sm: "h-8 px-3 text-sm rounded-lg",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-4 text-base rounded-xl",
  },

  // Input variants
  variants: {
    default:
      "border border-input bg-background hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    filled:
      "border border-transparent bg-muted/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    flushed:
      "border-b border-input bg-transparent rounded-none px-0 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary",
  },
};

export const dialogStyles = {
  // Dialog sizes
  sizes: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  },
};

export const gradientStyles = {
  // Common gradient backgrounds
  backgrounds: {
    primary: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
    blue: "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent",
    green: "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent",
    purple:
      "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent",
    amber: "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent",
    rose: "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent",
    indigo:
      "bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent",
  },

  // Text gradients
  text: {
    primary:
      "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
    blue: "bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent",
    green:
      "bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent",
    purple:
      "bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent",
    amber:
      "bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent",
    rose: "bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent",
    indigo:
      "bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent",
  },
};
