import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Allow serving on LAN when `vite --host` or `--host 0.0.0.0` is used
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      host: process.env.HMR_HOST || undefined,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        router: (req: any) => {
          const host = req.headers?.host?.toString().split(":")[0] ?? "localhost";
          return `http://${host}:${process.env.VITE_API_PORT ?? 8000}`;
        },
      },
      "/uploads": {
        target: "http://localhost:8000",
        changeOrigin: true,
        router: (req: any) => {
          const host = req.headers?.host?.toString().split(":")[0] ?? "localhost";
          return `http://${host}:${process.env.VITE_API_PORT ?? 8000}`;
        },
      },
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
        router: (req: any) => {
          const host = req.headers?.host?.toString().split(":")[0] ?? "localhost";
          return `ws://${host}:${process.env.VITE_API_PORT ?? 8000}`;
        },
      },
    },
  },
});
