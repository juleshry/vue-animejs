# Getting Started

## Overview

**vue-animejs** wraps [Anime.js v4](https://animejs.com/) into Vue 3 composables, directives and components. Everything integrates with Vue's reactivity system and cleans up automatically when the component unmounts.

## Installation

npm and bun install peer dependencies automatically. pnpm and yarn require you to add them explicitly:

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

::: tip pnpm auto-install
You can avoid listing peer dependencies manually by adding `auto-install-peers=true` to your `.npmrc`.
:::

::: tip Nuxt
Using Nuxt? See the [Nuxt guide](/guide/nuxt) to auto-import the composables and register the directives globally.
:::

## Requirements

| Dependency     | Version  |
| -------------- | -------- |
| Vue            | `>= 3.5` |
| Anime.js       | `>= 4`   |
| @vueuse/core   | `>= 14`  |

## Your first animation

Animate a DOM element by passing a template ref and animation options to `useAnimate`.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")

const { play, pause, restart } = useAnimate(box, {
  translateX: 200,
  duration: 800,
  ease: "inOutQuad",
  autoplay: false,
})
</script>

<template>
  <div ref="box" class="box" />

  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
  <button @click="restart">Restart</button>
</template>
```

## Your first directive

For animations that don't need script-side control, a directive achieves the same result directly on the element — no `<script setup>` logic, no cleanup to write:

```vue
<script setup lang="ts">
import { vAnimate } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-animate="{ translateX: 200, duration: 800, ease: 'inOutQuad' }" class="box" />
</template>
```

::: tip
See the [Directives](/directives/v-animate) section for the full list — `v-draggable`, `v-waapi`, `v-svg-drawable`, and `v-text-split` cover the same use cases as their composable counterparts.
:::

## Your first component

Some animations need an element of their own, like a container whose children move to their new place when the list changes. A component renders that element for you:

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue"
import { AnimeLayout } from "@juleshry/vue-animejs"

const list = useTemplateRef("list")
const items = ref(["a", "b", "c"])

async function reverse() {
  list.value?.record()
  items.value = [...items.value].reverse()
  await nextTick()
  list.value?.animate()
}
</script>

<template>
  <AnimeLayout ref="list" as="ul" :options="{ duration: 500 }">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </AnimeLayout>
  <button @click="reverse">Reverse</button>
</template>
```

::: tip
See [AnimeLayout](/components/anime-layout) for the details, and [Components](/guide/guidelines#components) in the guidelines for when to pick a component over a composable or a directive.
:::
