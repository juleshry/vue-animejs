import { defineConfig } from "vitepress"
import { resolve } from "path"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "vue-animejs": resolve(__dirname, "../../src/index.ts"),
      },
    },
  },

  title: "Vue x Animejs",
  description: "Vue x Animejs library documentation",

  srcDir: "src",

  themeConfig: {
    logo: "/icon.png",

    socialLinks: [{ icon: "github", link: "https://github.com/juleshry/vue-animejs" }],

    search: {
      provider: "local",
    },

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Contributing", link: "/contributing" },
          { text: "Guidelines", link: "/guide/guidelines" },
        ],
      },
      {
        text: "Composables",
        items: [
          { text: "useAnimate", link: "/composables/use-animate" },
          { text: "useTimer", link: "/composables/use-timer" },
        ],
      },
    ],
  },
})