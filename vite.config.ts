import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 8000,
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },
  esbuild: {
    jsx: "automatic", // Handle JSX automatically for .tsx files
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Ensure Vite resolves these extensions
  },
  build: {
    rollupOptions: {
      onLog(level, log) {
        if (log.message.includes("Failed to parse source")) {
          console.error("Import analysis error:", log);
        }
      },
    },
  },
});