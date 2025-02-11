import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Vercel deployment configuration
  plugins: [
    react({
      plugins: process.env.TEMPO === "true" ? [["tempo-devtools/swc", {}]] : [],
    }),
    tempo(),
  ],
  optimizeDeps: {
    include: ["tempo-devtools"],
  },
  base: "/",
  // Enable SPA fallback for client-side routing
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor";
            }
            if (id.includes("@radix-ui")) {
              return "ui";
            }
            if (id.includes("zustand") || id.includes("date-fns")) {
              return "utils";
            }
            return "deps";
          }
        },
        format: "es",
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@id": path.resolve(__dirname, "."),
    },
  },
});
