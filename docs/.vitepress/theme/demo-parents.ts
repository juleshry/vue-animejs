// Demo pages rendered in an iframe, and the page to send them to when opened on their own
const DEMO_PARENTS: Record<string, string> = {
  "/demos/use-scope": "/composables/use-scope",
  "/demos/anime-scope": "/components/anime-scope",
}

/** The page embedding the demo at `path`, or `undefined` if `path` isn't an iframe demo. */
export function demoParent(path: string): string | undefined {
  const demo = Object.keys(DEMO_PARENTS).find(route => path.replace(/\.html$/, "").endsWith(route))
  return demo && DEMO_PARENTS[demo]
}