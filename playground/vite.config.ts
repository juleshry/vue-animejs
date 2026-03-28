import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  plugins: [vue()],
  root: ".",
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
  },
})
