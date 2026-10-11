import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [vue()],
  // Pre-bundled up front, so Vite never reloads a page mid-test to optimize a newly found dependency
  optimizeDeps: { include: ["vue", "animejs"] },
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("../../src/index.ts", import.meta.url)),
      "@src": fileURLToPath(new URL("../../src", import.meta.url)),
    },
  },
})