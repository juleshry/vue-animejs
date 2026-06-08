import { $ } from "bun"

const token = process.env.NETLIFY_AUTH_TOKEN
const siteId = process.env.NETLIFY_SITE_ID

if (!token || !siteId) {
  console.error("Error: NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID must be set in .env")
  process.exit(1)
}

await $`bun install`
await $`bun run --cwd docs docs:build`
await $`bunx netlify-cli deploy --prod --dir=docs/.vitepress/dist`.env({
  ...process.env,
  NETLIFY_AUTH_TOKEN: token,
  NETLIFY_SITE_ID: siteId,
})