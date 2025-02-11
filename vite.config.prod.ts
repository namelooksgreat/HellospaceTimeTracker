import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      plugins: process.env.TEMPO === "true" ? [["tempo-devtools/swc", {}]] : [],
    }),
  ],
  optimizeDeps: {
    exclude: ["tempo-routes"],
    include: ["react", "react-dom", "react-router-dom"],
  },
  base: "/",
  build: {
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    global: "globalThis",
  },
});
