<div align="center">
  <img src="./docs/src/public/icon-animated.svg" alt="vue-animejs" width="120" />

  <h1 align="center">vue-animejs</h1>
  <p align="center">Vue 3 composables for <a href="https://animejs.com/">Anime.js</a> v4 — reactive animations that integrate naturally with Vue's reactivity system and component lifecycle.</p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@juleshry/vue-animejs"><img src="https://img.shields.io/npm/v/%40juleshry%2Fvue-animejs?label=npm&color=a1b858" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@juleshry/vue-animejs"><img src="https://img.shields.io/npm/dm/%40juleshry%2Fvue-animejs?color=50a36f" alt="npm downloads" /></a>
    <a href="https://vue-animejs.juleshry.dev"><img src="https://img.shields.io/badge/docs%20%26%20demos-vue--animejs-4fc08d" alt="docs & demos" /></a>
    <a href="https://github.com/juleshry/vue-animejs"><img src="https://img.shields.io/github/stars/juleshry/vue-animejs?style=flat&color=yellow" alt="GitHub stars" /></a>
  </p>
  <p align="center"><a href="https://app.netlify.com/projects/vue-animejs/deploys"><img src="https://api.netlify.com/api/v1/badges/8017f5b4-47b7-45e4-a5d6-269d638a71ab/deploy-status" alt="Netlify Status" /></a></p>
  <p align="center"><a href="https://ko-fi.com/C7O720SP29"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="ko-fi" /></a></p>
</div>

## 🚀 Overview

**vue-animejs** wraps Anime.js v4 as idiomatic Vue 3 composables. It integrates with Vue's reactivity system — pass a `ref` as a target or option and the animation updates automatically. Lifecycle cleanup is handled for you.

**Before** — raw Anime.js in a Vue component:

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { animate } from 'animejs'

const el = useTemplateRef<HTMLElement>('el')
let animation

onMounted(() => {
  if (!el.value) {
    console.warn('Targets element is null or undefined')
    return
  }
  
  animation = animate(el.value, { translateX: 250, duration: 800 })
})

onUnmounted(() => {
  animation?.cancel()
})
</script>

<template>
  <div ref="el" />
</template>
```

**After** — with vue-animejs:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimate } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

useAnimate(el, { translateX: 250, duration: 800 })
</script>

<template>
  <div ref="el" />
</template>
```

## 📦 Requirements

- Vue 3.5+
- Anime.js 4+
- @vueuse/core 14+

## 🦄 Composables & Directives

| Composable       | Description                                       |
|------------------|---------------------------------------------------|
| `useAnimate`     | Animate a DOM target with reactive params         |
| `useRawAnimate`  | Thin wrapper around Anime.js `animate()` with ref unwrapping |
| `useTimer`       | Drive a timer with full playback control          |
| `useTimeline`    | Sequence multiple animations on a shared timeline |
| `useWaapi`       | Animate via the Web Animations API (WAAPI)        |
| `useAnimatable`  | Create a reactive animatable object               |
| `useDraggable`   | Make a DOM element draggable with full control    |
| `useLayout`      | Animate DOM layout changes (reorder, add, remove) |
| `useScope`       | Create an Anime.js scope with lifecycle management |
| `useSvg`         | SVG utilities: morph paths and motion path         |
| `useSvgDrawable` | Animate SVG stroke drawing with the `draw` property |
| `useText`        | Split text into animatable lines, words, and chars |

**Directives** — declarative alternatives for element-bound animations:

| Directive    | Description                                      |
|--------------|--------------------------------------------------|
| `v-animate`  | Animate an element declaratively via template attribute |

## 🚀 Usage

For full API docs and live demos, see **[the doc here](https://vue-animejs.juleshry.dev)**.

## 👨‍🚀 Contributors

<a href="https://github.com/juleshry/vue-animejs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=juleshry/vue-animejs" alt="Contributors" />
</a>

## 🌸 Thanks

- [Anime.js](https://animejs.com/) by [Julian Garnier](https://github.com/juliangarnier) — the animation engine powering this library
- [VueUse](https://vueuse.org/) by [Anthony Fu](https://github.com/antfu) — inspiration for composable conventions and element ref patterns

## 🧱 Contributing

See the [Contributing Guide](./CONTRIBUTING.md).

## 🗺️ TODO

- [ ] Allow reactive refs inside option objects
- [ ] Finish doc website
- [ ] Add components
- [ ] Add missing directives

## 📄 License

[MIT](./LICENSE.md) © 2025-present [Jules Hery](https://github.com/juleshry)
