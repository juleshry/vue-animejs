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
import "./style.css"

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("UseAnimateDemo", UseAnimateDemo)
    app.component("UseTimerDemo", UseTimerDemo)
    app.component("UseTimelineDemo", UseTimelineDemo)
    app.component("UseRawAnimateDemo", UseRawAnimateDemo)
    app.component("UseWaapiDemo", UseWaapiDemo)
    app.component("UseAnimatableDemo", UseAnimatableDemo)
  },
} satisfies Theme