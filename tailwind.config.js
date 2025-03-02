/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Extended color system
        text: {
          primary: "hsl(var(--foreground))",
          secondary: "hsl(var(--muted-foreground))",
          tertiary: "hsl(var(--muted-foreground) / 0.7)",
          quaternary: "hsl(var(--muted-foreground) / 0.5)",
        },
        surface: {
          DEFAULT: "hsl(var(--background))",
          raised: "hsl(var(--card))",
          raisedMuted: "hsl(var(--card) / 0.5)",
          overlay: "hsl(var(--card) / 0.8)",
        },
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
      },
      opacity: {
        15: "0.15",
        35: "0.35",
        85: "0.85",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-out-up": {
          "0%": { transform: "translateY(150%)", opacity: "0", scale: "0.95" },
          "60%": {
            transform: "translateY(-10%)",
            opacity: "0.8",
            scale: "1.02",
          },
          "80%": { transform: "translateY(5%)", opacity: "0.9", scale: "0.98" },
          "100%": { transform: "translateY(0)", opacity: "1", scale: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15%)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up-fade-in": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up-fade-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        "timer-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
      },
      animation: {
        "slide-out-up": "slide-out-up 0.3s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shine: "shine 2s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-up-fade-in": "slide-up-fade-in 0.3s ease-out forwards",
        "slide-up-fade-out": "slide-up-fade-out 0.3s ease-out forwards",
        "timer-pulse": "timer-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
