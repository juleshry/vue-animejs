import { defineConfig, devices } from "@playwright/test"

const PORT = 4319

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun fixture/server.ts",
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/v-animate`,
    reuseExistingServer: !process.env.CI,
  },
})