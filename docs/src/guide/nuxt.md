# Nuxt

vue-animejs works in Nuxt as-is: install it and import composables, directives and components like in any Vue app. Everything is [SSR-safe](/guide/guidelines#ssr), so nothing needs a `<ClientOnly>` wrapper.

The sections below are optional and use only Nuxt's own configuration: auto-importing the composables, and registering the directives globally.

## Installation

::: code-group

```sh [npm]
npm install @juleshry/vue-animejs
```

```sh [pnpm]
pnpm add @juleshry/vue-animejs animejs @vueuse/core
```

```sh [yarn]
yarn add @juleshry/vue-animejs animejs @vueuse/core
```

```sh [bun]
bun add @juleshry/vue-animejs
```

:::

## Auto-importing composables

Add the composables you use to Nuxt's [`imports.presets`](https://nuxt.com/docs/guide/concepts/auto-imports#auto-import-from-third-party-packages). Nuxt generates their types, so they're typed in your components without an import line:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  imports: {
    presets: [
      {
        from: "@juleshry/vue-animejs",
        imports: ["useAnimate", "useTimeline", "useText"],
      },
    ],
  },
})
```

```vue
<script setup lang="ts">
const box = useTemplateRef("box")

useAnimate(box, { translateX: 200, duration: 800 })
</script>

<template>
  <div ref="box" />
</template>
```

::: warning With @vueuse/nuxt
`@vueuse/nuxt` also auto-imports a `useScroll` and a `useDraggable`. If you add ours to the preset under the same names, they replace VueUse's everywhere in your app, without any warning. Rename them with `as` to keep both:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@vueuse/nuxt"],
  imports: {
    presets: [
      {
        from: "@juleshry/vue-animejs",
        imports: [
          "useAnimate",
          { name: "useScroll", as: "useAnimeScroll" },
          { name: "useDraggable", as: "useAnimeDraggable" },
        ],
      },
    ],
  },
})
```

Or leave them out of the preset and import them explicitly where you use them.
:::

## Registering directives globally

Register the directives you use in a plugin:

```ts [plugins/animejs.ts]
import { vAnimate, vTextSplit } from "@juleshry/vue-animejs"

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive("animate", vAnimate)
  nuxtApp.vueApp.directive("text-split", vTextSplit)
})
```

```vue
<template>
  <div v-animate="{ opacity: [0, 1], translateY: [20, 0] }" />
</template>
```

::: warning
Name the file `animejs.ts`, not `animejs.client.ts`. The plugin has to run on the server too: that's where `v-animate`, `v-waapi`, `v-svg-drawable` and `v-text-split` (with `ssrHidden`) render their [initial state](/guide/guidelines#initial-state-on-the-server), so elements don't flash their final state before hydration.
:::

You can also skip the plugin and import a directive in the component that uses it, as shown in [Getting Started](/guide/getting-started#your-first-directive).

## SSR

Nuxt renders every page on the server first, so the [SSR rules](/guide/guidelines#ssr) apply as-is:

- Call composables at the top level of `<script setup>`. They create their Anime.js instance once the component has mounted in the browser, so their instance refs are `undefined` on the server and control methods do nothing there.
- `useRawAnimate` and `useRawAnimatable` are the exception: call them inside your own `onMounted`.
