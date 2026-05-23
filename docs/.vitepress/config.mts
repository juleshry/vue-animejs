import { defineConfig } from "vitepress"
import { resolve } from "path"

// https://vitepress.dev/reference/site-config
const HOSTNAME = "https://vue-animejs.juleshry.dev"
const OG_IMAGE = `${HOSTNAME}/icon-animated.svg`

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@juleshry/vue-animejs": resolve(__dirname, "../../src/index.ts"),
      },
    },
  },

  title: "Vue x Animejs",
  description: "Reactive, lifecycle-aware animation composables for Vue 3 — powered by Anime.js v4.",

  srcDir: "src",

  sitemap: {
    hostname: HOSTNAME,
  },

  head: [
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Vue x Animejs" }],
    ["meta", { property: "og:image", content: OG_IMAGE }],
    ["meta", { name: "twitter:card", content: "summary" }],
    ["meta", { name: "twitter:image", content: OG_IMAGE }],
  ],

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
          { text: "useRawAnimate", link: "/composables/use-raw-animate" },
          { text: "useTimer", link: "/composables/use-timer" },
          { text: "useTimeline", link: "/composables/use-timeline" },
          { text: "useWaapi", link: "/composables/use-waapi" },
        ],
      },
    ],
  },
})