import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue x Animejs",
  description: "Vue x Animejs library documentation",

  srcDir: "src",

  themeConfig: {
    logo: "/icon.png",

    search: {
      provider: "local",
    },

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
        ],
      },
    ],
  },
})