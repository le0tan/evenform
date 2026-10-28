import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { cn } from "cn/vite"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_PATH || "/",
  plugins: [cn({ css: "src/core.css", out: "src/lib/cn-tables.ts", full: true }), react(), tailwindcss()],
  server: {
    // Let editor writes finish before cn reads the CSS theme scales.
    watch: { awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 20 } },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    license: { fileName: "third-party-licenses.json" },
    outDir: mode === "starter" ? "dist-starter" : "dist",
    rolldownOptions: {
      input: mode === "starter" ? resolve(import.meta.dirname, "starter.html") : {
        showcase: resolve(import.meta.dirname, "index.html"),
        starter: resolve(import.meta.dirname, "starter.html"),
      },
    },
  },
}))
