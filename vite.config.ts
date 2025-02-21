import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const conditionalPlugins = [];
  if (process.env.TEMPO === "true") {
    conditionalPlugins.push(["tempo-devtools/swc", {}]);
  }

  return {
    plugins: [
      react({
        plugins: [...conditionalPlugins],
        jsxImportSource: "react",
        fastRefresh: true,
      }),
      tempo(),
    ],
    build: {
      sourcemap: false,
      minify: "terser",
      chunkSizeWarningLimit: 3000,
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
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/framer-motion/, /node_modules/],
      },
      rollupOptions: {
        external: ["tempo-routes"],
        output: {
          paths: {
            "tempo-routes": "/tempo-routes",
          },
          manualChunks: (id) => {
            // React core ve routing
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-core";
            }

            // Radix UI bileşenleri
            if (id.includes("@radix-ui/react-")) {
              return "radix-ui";
            }

            // Framer Motion
            if (id.includes("framer-motion")) {
              return "animations";
            }

            // Recharts ve ilgili bağımlılıklar
            if (id.includes("recharts") || id.includes("d3-")) {
              return "charts";
            }

            // Tarih işleme kütüphaneleri
            if (id.includes("date-fns")) {
              return "date-utils";
            }

            // State management
            if (id.includes("zustand")) {
              return "state-management";
            }

            // UI utils
            if (
              id.includes("class-variance-authority") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "ui-utils";
            }

            // Admin sayfaları
            if (id.includes("/admin/")) {
              return "admin";
            }

            // Auth sayfaları
            if (id.includes("/auth/")) {
              return "auth";
            }
          },
        },
      },
    },
    server: {
      // @ts-ignore
      allowedHosts: process.env.TEMPO === "true" ? true : undefined,
      host: true,
      port: 3000,
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
  };
});
