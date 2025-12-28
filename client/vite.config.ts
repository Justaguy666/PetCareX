import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    proxy: {
      // Proxy all /api requests to the backend server running on localhost:3000
      // Keeps cookies/session headers so `credentials: 'include'` works from the browser.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Leave path as-is (no rewrite) so frontend can use /api/...
        // Ensure cookie domain is rewritten to the dev server host if backend sets it for localhost:3000
        // Using empty string removes domain attribute so the browser will apply the current host.
        cookieDomainRewrite: '' as any,
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react() /*, expressPlugin()*/], // Temporarily disabled to test frontend
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

