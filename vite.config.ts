import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
  plugins: [
    react({
      plugins: [...conditionalPlugins],
      jsxImportSource: "react",
      swcOptions: {
        jsc: {
          target: "es2020",
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: false,
            dynamicImport: false,
          },
          transform: {
            react: {
              runtime: "automatic",
              development: process.env.NODE_ENV === "development",
              refresh: process.env.NODE_ENV === "development",
            },
          },
        },
      },
    }),
    tempo(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
