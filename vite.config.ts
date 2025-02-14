import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      plugins: process.env.TEMPO === "true" ? [["tempo-devtools/swc", {}]] : [],
      jsxImportSource: "react",
      fastRefresh: true,
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
    chunkSizeWarningLimit: 2000,
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
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "framer-motion"],
          ui: [
            "@radix-ui/react-portal",
            "@radix-ui/react-dismissable-layer",
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
          ],
        },
        format: "es",
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
