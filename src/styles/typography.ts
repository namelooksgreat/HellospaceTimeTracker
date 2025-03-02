// Typography tokens for consistent text styling across the application

export const fontSizes = {
  // Font size scale
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
};

export const fontWeights = {
  // Font weight scale
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const lineHeights = {
  // Line height scale
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
};

export const letterSpacings = {
  // Letter spacing scale
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

export const textStyles = {
  // Heading styles
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-bold tracking-tight",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  h5: "text-lg font-medium",
  h6: "text-base font-medium",

  // Body text styles
  bodyLarge: "text-lg font-normal",
  bodyDefault: "text-base font-normal",
  bodySmall: "text-sm font-normal",
  bodyXSmall: "text-xs font-normal",

  // Special text styles
  label: "text-sm font-medium",
  caption: "text-xs font-normal text-muted-foreground",
  code: "font-mono text-sm",
};

export const textColors = {
  // Text color hierarchy
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  tertiary: "text-tertiary",
  quaternary: "text-quaternary",

  // Semantic text colors
  success: "text-green-600 dark:text-green-500",
  warning: "text-yellow-600 dark:text-yellow-500",
  danger: "text-destructive",
  info: "text-blue-600 dark:text-blue-500",
};
