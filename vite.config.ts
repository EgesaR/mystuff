import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
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
      },

      "/uploads": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },

      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
