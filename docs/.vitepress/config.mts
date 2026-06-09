import { defineConfig } from "vitepress"
import { resolve } from "path"
import { fileURLToPath, URL } from "node:url"

// https://vitepress.dev/reference/site-config
const HOSTNAME = "https://vue-animejs.juleshry.dev"
const OG_IMAGE = `${HOSTNAME}/icon-animated.svg`

const ICON_GLOBE =
  '<img src="https://www.juleshry.dev/favicon.ico" width="14" height="14" alt="" style="vertical-align:-2px;margin-right:3px;border-radius:2px">'
const ICON_GITHUB =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;margin-right:3px"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
const ICON_KOFI =
  '<img src="https://storage.ko-fi.com/cdn/brandasset/v2/kofi_symbol.png" width="14" height="14" alt="" style="vertical-align:-2px;margin-right:3px">'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@juleshry/vue-animejs": resolve(__dirname, "../../src/index.ts"),
        "@src": fileURLToPath(new URL("../../src", import.meta.url)),
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

    socialLinks: [
      { icon: "github", link: "https://github.com/juleshry/vue-animejs", ariaLabel: "View on Github" },
      {
        icon: "npm",
        link: "https://www.npmjs.com/package/@juleshry/vue-animejs",
        ariaLabel: "View on npm",
      },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: `<div style="display: flex; align-items: center; justify-content: center; gap: 6px"">Made by 
        <a href="https://juleshry.dev" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 1px">${ICON_GLOBE}<p>juleshry.dev</p></a> · 
        <a href="https://github.com/juleshry" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 1px">${ICON_GITHUB}<p>GitHub</p></a> · 
        <a href="https://ko-fi.com/C7O720SP29" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 1px">${ICON_KOFI}<p>Support on Ko-fi</p></a>
        </div>`,
    },

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Contributing", link: "/contributing" },
          { text: "Guidelines", link: "/guide/guidelines" },
          { text: "Community", link: "/community" },
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
          { text: "useAnimatable", link: "/composables/use-animatable" },
          { text: "useDraggable", link: "/composables/use-draggable" },
          { text: "useScope", link: "/composables/use-scope" },
          { text: "useText", link: "/composables/use-text" },
          {
            text: "useSvg",
            link: "/composables/use-svg",
            items: [
              { text: "morphTo", link: "/composables/use-svg/use-svg-morph-to" },
              { text: "createMotionPath", link: "/composables/use-svg/use-svg-motion-path" },
            ],
          },
          { text: "useSvgDrawable", link: "/composables/use-svg-drawable" },
          { text: "useLayout", link: "/composables/use-layout" },
        ],
      },
    ],
  },
})