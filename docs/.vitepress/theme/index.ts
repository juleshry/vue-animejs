// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import Layout from "./components/Layout.vue"
import UseAnimateDemo from "./components/UseAnimateDemo.vue"
import "./style.css"

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("UseAnimateDemo", UseAnimateDemo)
  },
} satisfies Theme