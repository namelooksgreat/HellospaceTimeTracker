export const THEME_CONFIG = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    primary: {
      DEFAULT: "hsl(265 84% 45%)",
      foreground: "hsl(0 0% 100%)",
    },
    secondary: {
      DEFAULT: "hsl(240 5% 96%)",
      foreground: "hsl(240 5.9% 10%)",
    },
    muted: {
      DEFAULT: "hsl(240 5% 96%)",
      foreground: "hsl(240 3.8% 46.1%)",
    },
    accent: {
      DEFAULT: "hsl(265 84% 97%)",
      foreground: "hsl(265 84% 45%)",
    },
  },
  dark: {
    background: "hsl(0 0% 0%)",
    foreground: "hsl(0 0% 98%)",
    primary: {
      DEFAULT: "hsl(265 80% 56%)",
      foreground: "hsl(355.7 100% 97.3%)",
    },
    secondary: {
      DEFAULT: "hsl(240 3.7% 15.9%)",
      foreground: "hsl(0 0% 98%)",
    },
    muted: {
      DEFAULT: "hsl(0 0% 15%)",
      foreground: "hsl(240 5% 64.9%)",
    },
    accent: {
      DEFAULT: "hsl(12 6.5% 15.1%)",
      foreground: "hsl(0 0% 98%)",
    },
  },
} as const;

export const TYPOGRAPHY = {
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
} as const;
