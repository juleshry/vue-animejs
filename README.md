<div align="center">
  <img src="./docs/src/public/icon-animated.svg" alt="vue-animejs" width="120" />

  <h1 align="center">vue-animejs</h1>
  <p align="center">Vue 3 composables for <a href="https://animejs.com/">Anime.js</a> v4 — reactive animations that integrate naturally with Vue's reactivity system and component lifecycle.</p>
  <p align="center"><a href="https://vue-animejs.juleshry.dev">📖 Documentation</a></p>
  <p align="center"><a href="https://app.netlify.com/projects/vue-animejs/deploys"><img src="https://api.netlify.com/api/v1/badges/8017f5b4-47b7-45e4-a5d6-269d638a71ab/deploy-status" alt="Netlify Status" /></a></p>
</div>

> [!WARNING]
> This library is a work in progress. The API is not stable and may change at any time.

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

## 🦄 Composables

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
| `useSvg`         | SVG utilities: morph, drawable stroke, motion path |
| `useText`        | Split text into animatable lines, words, and chars |

## 🚀 Usage

### `useAnimate`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimate } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

const { play, pause } = useAnimate(el, {
  translateX: 250,
  duration: 800,
  easing: 'easeInOutQuad',
})
</script>

<template>
  <div ref="el" />
  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
</template>
```

### `useTimer`

```vue
<script setup lang="ts">
import { useTimer } from '@juleshry/vue-animejs'

const { play, pause } = useTimer({
  duration: 3000,
  onUpdate: (self) => console.log(self.currentTime),
})
</script>
```

### `useTimeline`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useTimeline } from '@juleshry/vue-animejs'

const box = useTemplateRef<HTMLElement>('box')

const { add, play } = useTimeline({ loop: true })

add(box, { translateX: 100 })
add(box, { translateY: 50 }, '+=200')
play()
</script>
```

### `useRawAnimate`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useRawAnimate } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

// Returns the raw Anime.js JSAnimation instance directly
const animation = useRawAnimate(el, { translateX: 250, duration: 800 })
</script>

<template>
  <div ref="el" />
</template>
```

### `useAnimatable`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimatable } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

const { animatable } = useAnimatable(el, {
  x: 0,
  opacity: 1,
})
</script>
```

### `useWaapi`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useWaapi } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

const { play, pause } = useWaapi(el, {
  translateX: 250,
  duration: 800,
  easing: 'easeInOutQuad',
})
</script>

<template>
  <div ref="el" />
  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
</template>
```

### `useSvg`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimate, useSvg } from '@juleshry/vue-animejs'

const path = useTemplateRef<SVGPathElement>('path')
const target = useTemplateRef<SVGPathElement>('target')

const { morphTo, createDrawable } = useSvg()

// Animate a path morph
useAnimate(path, { d: morphTo(target), duration: 1000 })

// Animate a drawable stroke
const drawable = createDrawable(path)
useAnimate(drawable, { strokeDashoffset: [1, 0], duration: 1200 })
</script>
```

### `useDraggable`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDraggable } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

const { disable, enable } = useDraggable(el, {
  onGrab: () => console.log('grabbed'),
  onDrag: () => console.log('dragging'),
  onRelease: () => console.log('released'),
})
</script>

<template>
  <div ref="el" />
  <button @click="disable">Disable</button>
  <button @click="enable">Enable</button>
</template>
```

### `useLayout`

> **Note:** Vue's DOM updates are asynchronous. Use `await nextTick()` between the state change and `animate()` so Anime.js reads the updated positions.

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { useLayout } from '@juleshry/vue-animejs'

const list = useTemplateRef<HTMLElement>('list')
const { record, animate } = useLayout(list, {})

const items = ref([1, 2, 3, 4, 5])

async function shuffle() {
  record()
  items.value = [...items.value].sort(() => Math.random() - 0.5)
  await nextTick()
  animate({ duration: 600 })
}
</script>

<template>
  <ul ref="list">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
  <button @click="shuffle">Shuffle</button>
</template>
```

When you mutate the DOM directly with `classList.toggle`, the change is synchronous — no `nextTick` needed:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useLayout } from '@juleshry/vue-animejs'

const container = useTemplateRef<HTMLElement>('container')
const { update } = useLayout(container, {})

function toggleLayout() {
  update(() => {
    container.value!.classList.toggle('grid')
  }, { duration: 600 })
}
</script>

<template>
  <div ref="container" class="grid">
    <div v-for="i in 6" :key="i" class="item" />
  </div>
  <button @click="toggleLayout">Toggle layout</button>
</template>
```

### `useScope`

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimate, useScope } from '@juleshry/vue-animejs'

const el = useTemplateRef<HTMLElement>('el')

const { add, revert } = useScope({ mediaQuery: '(prefers-reduced-motion: no-preference)' })

// Animations added via add() are automatically reverted when the scope reverts
// or when the component unmounts
add(scope => {
  useAnimate(el, { translateX: 250, duration: 800 })
})
</script>

<template>
  <div ref="el" />
  <button @click="revert">Revert</button>
</template>
```

### `useText`

> **Note:** `words`, `chars`, and `lines` are `ComputedRef<HTMLElement[]>` — they populate after mount and can be passed directly to `useAnimate`.

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useAnimate, useText } from '@juleshry/vue-animejs'
import { stagger } from 'animejs'

const el = useTemplateRef<HTMLElement>('el')

const { words, chars } = useText(el, { words: true, chars: true })

// words and chars are ComputedRef<HTMLElement[]> — pass them directly as targets
useAnimate(words, {
  y: ['100%', '0%'],
  duration: 600,
  delay: stagger(50),
})
</script>

<template>
  <p ref="el">Hello, world!</p>
</template>
```

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
- [ ] Add directives

## 📄 License

[MIT](./LICENSE.md) © 2025-present [Jules Hery](https://github.com/juleshry)
