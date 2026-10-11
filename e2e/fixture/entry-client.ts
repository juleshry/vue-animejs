import { createSSRApp } from "vue"
import { pages } from "./pages.ts"

declare global {
  interface Window {
    __PAGE__: string
    __HYDRATED__?: number
  }
}

createSSRApp(pages[window.__PAGE__]).mount("#app")
window.__HYDRATED__ = performance.now()