import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      plugins: process.env.TEMPO === "true" ? [["tempo-devtools/swc", {}]] : [],
    }),
    tempo(),
  ],
  optimizeDeps: {
    include: [
      "tempo-devtools",
      "@supabase/supabase-js",
      "@supabase/auth-js",
      "zustand",
      "react",
      "react-dom",
      "react/jsx-runtime",
    ],
    exclude: ["tempo-routes"],
  },
  base: "/",
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    host: true,
    port: 3000,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    minify: "terser",
    target: "esnext",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },
    },
    commonjsOptions: {
      include: [/framer-motion/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ["tempo-routes"],
      output: {
        paths: {
          "tempo-routes": "/tempo-routes",
        },
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("react")) return "react-vendor";
            if (id.includes("@radix-ui")) return "ui";
            if (id.includes("zustand") || id.includes("date-fns"))
              return "utils";
            return "vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
