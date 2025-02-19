import { cva } from "class-variance-authority";

export const styles = {
  input: {
    base: "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
    hover:
      "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
    disabled: "cursor-not-allowed opacity-50",
  },
  components: {
    selectContent:
      "rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm shadow-lg",
    selectItem:
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    stopButton:
      "h-11 sm:h-12 w-11 sm:w-12 rounded-lg sm:rounded-xl bg-background/80 dark:bg-black hover:bg-accent/80 dark:hover:bg-black/80 text-foreground dark:text-white hover:text-foreground/90 dark:hover:text-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-border/10 hover:border-border/20",
  },
};

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
