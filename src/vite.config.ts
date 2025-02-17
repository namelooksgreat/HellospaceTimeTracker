import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      plugins: process.env.TEMPO === "true" ? [["tempo-devtools/swc", {}]] : [],
      jsxImportSource: "react",
    }),
    tempo(),
  ],
  optimizeDeps: {
    exclude: ["tempo-routes"],
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
  base: "/",
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    host: true,
    port: 3000,
  },
  build: {
    sourcemap: false,
    minify: "terser",
    chunkSizeWarningLimit: 4000,
    target: "esnext",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      external: ["tempo-routes"],
      output: {
        paths: {
          "tempo-routes": "/tempo-routes",
        },
        manualChunks: (id) => {
          // Core vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("@radix-ui")) return "ui-vendor";
            if (id.includes("lucide-react")) return "icons-vendor";
            if (id.includes("date-fns")) return "date-vendor";
            if (id.includes("recharts") || id.includes("d3"))
              return "charts-vendor";
            if (id.includes("@supabase/supabase-js")) return "supabase-vendor";
            if (
              id.includes("zustand") ||
              id.includes("sonner") ||
              id.includes("jspdf") ||
              id.includes("xlsx")
            )
              return "utils-vendor";
            return "vendor";
          }
          // App code chunks
          if (id.includes("/admin/")) return "admin";
          if (id.includes("/reports/")) return "reports";
          if (id.includes("/ui/")) return "ui";
        },
        format: "es",
        entryFileNames: "[name].[hash].mjs",
        chunkFileNames: "[name].[hash].mjs",
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    global: "globalThis",
  },
});
