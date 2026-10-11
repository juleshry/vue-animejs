import { createSSRApp } from "vue"
import { renderToString } from "vue/server-renderer"
import { pages } from "./pages.ts"

export { pages }

/** Server-renders one fixture page to an HTML string. */
export function render(name: string): Promise<string> {
  return renderToString(createSSRApp(pages[name]))
}