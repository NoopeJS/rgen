import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    base: "./",
    open: true,
  },
  build: {
    minify: false,
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          rgen: ["@noopejs/react-gen"],
        },
      },
    },
  },
  preview: {
    port: 3201,
  },
  resolve: {
    alias: {
      "@": "src",
    },
  },
  publicDir: "public"
});
