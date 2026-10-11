import { readFile } from "node:fs/promises"
import { createServer as createHttpServer } from "node:http"
import { fileURLToPath, URL } from "node:url"
import { createServer } from "vite"

// Minimal Vite SSR server: renders `/<page>` on the server, then the client hydrates it.

const PORT = Number(process.env.PORT ?? 4319)

const vite = await createServer({
  configFile: fileURLToPath(new URL("./vite.config.ts", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
})
const template = await readFile(new URL("./index.html", import.meta.url), "utf-8")

createHttpServer((req, res) => {
  vite.middlewares(req, res, async () => {
    const url = req.url ?? "/"
    const name = new URL(url, "http://localhost").pathname.slice(1)
    try {
      const { pages, render } = await vite.ssrLoadModule("/entry-server.ts")
      if (!(name in pages)) {
        res.statusCode = 404
        res.setHeader("Content-Type", "text/plain")
        return res.end(`Unknown page "${name}". Pages: ${Object.keys(pages).join(", ")}`)
      }
      const page_html = template.replace("<!--app-->", await render(name)).replace("<!--page-->", JSON.stringify(name))
      res.setHeader("Content-Type", "text/html")
      res.end(await vite.transformIndexHtml(url, page_html))
    } catch (error) {
      // The stack goes to stderr, which Playwright pipes into the test output, not into the response
      vite.ssrFixStacktrace(error as Error)
      console.error(error)
      res.statusCode = 500
      res.setHeader("Content-Type", "text/plain")
      res.end("Internal Server Error")
    }
  })
}).listen(PORT, () => console.log(`SSR fixture on http://localhost:${PORT}`))