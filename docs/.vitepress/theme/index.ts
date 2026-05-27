// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import Layout from "./components/Layout.vue"
import UseAnimateDemo from "./components/UseAnimateDemo.vue"
import UseTimerDemo from "./components/UseTimerDemo.vue"
import UseTimelineDemo from "./components/UseTimelineDemo.vue"
import UseRawAnimateDemo from "./components/UseRawAnimateDemo.vue"
import UseWaapiDemo from "./components/UseWaapiDemo.vue"
import UseAnimatableDemo from "./components/UseAnimatableDemo.vue"
import UseDraggableDemo from "./components/UseDraggableDemo.vue"
import UseScopeDemo from "./components/UseScopeDemo.vue"
import UseScopeDemoInner from "./components/UseScopeDemoInner.vue"
import "./style.css"

const DEMO_ROUTES = ["/demos/use-scope"]

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    router.onBeforePageLoad = to => {
      if (typeof window !== "undefined" && DEMO_ROUTES.some(r => to.endsWith(r)) && window.self === window.top) {
        window.location.replace("/composables/use-scope")
        return false
      }
    }
    app.component("UseAnimateDemo", UseAnimateDemo)
    app.component("UseTimerDemo", UseTimerDemo)
    app.component("UseTimelineDemo", UseTimelineDemo)
    app.component("UseRawAnimateDemo", UseRawAnimateDemo)
    app.component("UseWaapiDemo", UseWaapiDemo)
    app.component("UseAnimatableDemo", UseAnimatableDemo)
    app.component("UseDraggableDemo", UseDraggableDemo)
    app.component("UseScopeDemo", UseScopeDemo)
    app.component("UseScopeDemoInner", UseScopeDemoInner)
  },
} satisfies Theme