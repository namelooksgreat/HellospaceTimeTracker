export const tokens = {
  colors: {
    // Brand Colors
    primary: {
      50: "hsl(240, 100%, 97%)",
      100: "hsl(240, 100%, 94%)",
      200: "hsl(240, 95%, 86%)",
      300: "hsl(240, 90%, 76%)",
      400: "hsl(240, 85%, 66%)",
      500: "hsl(240, 80%, 56%)", // Primary brand color
      600: "hsl(240, 75%, 46%)",
      700: "hsl(240, 70%, 36%)",
      800: "hsl(240, 65%, 26%)",
      900: "hsl(240, 60%, 16%)",
    },
    // Neutral Colors
    neutral: {
      50: "hsl(0, 0%, 98%)",
      100: "hsl(0, 0%, 96%)",
      200: "hsl(0, 0%, 90%)",
      300: "hsl(0, 0%, 83%)",
      400: "hsl(0, 0%, 64%)",
      500: "hsl(0, 0%, 45%)",
      600: "hsl(0, 0%, 32%)",
      700: "hsl(0, 0%, 25%)",
      800: "hsl(0, 0%, 15%)",
      900: "hsl(0, 0%, 9%)",
    },
    // Semantic Colors
    success: "hsl(145, 80%, 42%)",
    warning: "hsl(45, 93%, 47%)",
    error: "hsl(0, 84%, 60%)",
    info: "hsl(200, 98%, 39%)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  typography: {
    fonts: {
      sans: "Inter, system-ui, -apple-system, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: "1.25",
      base: "1.5",
      relaxed: "1.75",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  radii: {
    sm: "0.25rem",
    base: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  },
  transitions: {
    base: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
