// Design tokens for consistent styling across the application

export const colorTokens = {
  // Primary colors
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },

  // Text opacity levels
  text: {
    primary: "hsl(var(--foreground))",
    secondary: "hsl(var(--muted-foreground))",
    tertiary: "hsl(var(--muted-foreground) / 0.4)",
    quaternary: "hsl(var(--muted-foreground) / 0.3)",
  },

  // Accent colors
  accent: {
    blue: {
      DEFAULT: "hsl(210, 100%, 50%)",
      muted: "hsl(210, 100%, 50%, 0.5)",
      subtle: "hsl(210, 100%, 50%, 0.3)",
    },
    green: {
      DEFAULT: "hsl(142, 72%, 50%)",
      muted: "hsl(142, 72%, 50%, 0.5)",
      subtle: "hsl(142, 72%, 50%, 0.3)",
    },
  },

  // Background opacity levels
  surface: {
    DEFAULT: "hsl(var(--background))",
    raised: "hsl(var(--card))",
    raisedMuted: "hsl(var(--card) / 0.5)",
    overlay: "hsl(var(--card) / 0.8)",
  },
};

export const opacityLevels = {
  // Standard opacity levels
  full: "1",
  high: "0.7",
  medium: "0.4",
  low: "0.3",
  subtle: "0.1",
  decorative: "0.05",
};

export const textStyles = {
  // Text hierarchy
  heading: "text-foreground font-bold",
  subheading: "text-foreground font-medium",
  body: "text-foreground",
  secondary: "text-muted-foreground",
  tertiary: "text-tertiary",
};

export const buttonStyles = {
  // Button variants
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  ghost: "bg-transparent hover:bg-accent/10 text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export const spacingTokens = {
  // Consistent spacing
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
};

export const animationTokens = {
  // Animation durations
  fast: "150ms",
  medium: "300ms",
  slow: "500ms",
  // Easing functions
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeIn: "cubic-bezier(0.7, 0, 0.84, 0)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
};
