import { configDefaults, defineConfig } from "vitest/config"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    pool: "vmThreads",
    // Playwright e2e specs, run with `bun run test:e2e`
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      "@src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})