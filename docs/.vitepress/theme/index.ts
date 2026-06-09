// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import Layout from "./components/layout/Layout.vue"
import UseAnimateDemo from "./components/demo/UseAnimateDemo.vue"
import UseTimerDemo from "./components/demo/UseTimerDemo.vue"
import UseTimelineDemo from "./components/demo/UseTimelineDemo.vue"
import UseRawAnimateDemo from "./components/demo/UseRawAnimateDemo.vue"
import UseWaapiDemo from "./components/demo/UseWaapiDemo.vue"
import UseAnimatableDemo from "./components/demo/UseAnimatableDemo.vue"
import UseDraggableDemo from "./components/demo/UseDraggableDemo.vue"
import UseScopeDemo from "./components/demo/use-scope/UseScopeDemo.vue"
import UseScopeDemoInner from "./components/demo/use-scope/UseScopeDemoInner.vue"
import UseTextDemo from "./components/demo/UseTextDemo.vue"
import UseSvgDemo from "./components/demo/svg/UseSvgDemo.vue"
import UseSvgDrawableDemo from "./components/demo/svg/UseSvgDrawableDemo.vue"
import UseCreateMotionPathDemo from "./components/demo/svg/UseCreateMotionPathDemo.vue"
import UseLayoutDemo from "./components/demo/UseLayoutDemo.vue"
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
    app.component("UseTextDemo", UseTextDemo)
    app.component("UseSvgDemo", UseSvgDemo)
    app.component("UseSvgDrawableDemo", UseSvgDrawableDemo)
    app.component("UseCreateMotionPathDemo", UseCreateMotionPathDemo)
    app.component("UseLayoutDemo", UseLayoutDemo)
  },
} satisfies Theme