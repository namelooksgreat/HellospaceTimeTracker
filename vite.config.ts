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
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "framer-motion",
        "@/components/home",
        "@/components/TimeTracker",
        "@/lib/utils/common",
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@radix-ui/react-tabs",
        "lucide-react",
      ],
      exclude: ["tempo-routes"],
    },
    build: {
      target: "esnext",
      outDir: "dist",
      assetsDir: "assets",
      cssCodeSplit: true,
      sourcemap: false,
      minify: "terser",
      chunkSizeWarningLimit: 3000,
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
          manualChunks: {
            vendor: ["framer-motion"],
            "react-core": ["react", "react-dom", "react-router-dom"],
            "ui-utils": ["class-variance-authority", "clsx", "tailwind-merge"],
            "date-utils": ["date-fns"],
            "state-management": ["zustand"],
            charts: ["recharts", "d3-scale", "d3-shape", "d3-path"],
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
