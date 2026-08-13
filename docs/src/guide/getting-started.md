# Getting Started

## Overview

**vue-animejs** wraps [Anime.js v4](https://animejs.com/) into a set of Vue 3 composables. Every composable integrates with Vue's reactivity system and cleans up automatically when the component unmounts.

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