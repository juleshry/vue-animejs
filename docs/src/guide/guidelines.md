# Guidelines

## General

- All composables are prefixed with `use` and accept both plain values and Vue `Ref`s as arguments
- Composables integrate with Vue's component lifecycle — animations are cleaned up automatically on unmount
- The library is tree-shakeable: only the composables you import are included in your bundle

## Targets

DOM targets should always be declared with `useTemplateRef`:

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const el = useTemplateRef("el")

useAnimate(el, { translateX: 200 })
</script>

<template>
  <div ref="el" />
</template>
```

::: warning
Never use `ref<HTMLElement | null>(null)` as a target. The composables use [`unrefElement`](https://vueuse.org/core/unrefElement/) from `@vueuse/core` internally, which expects a `useTemplateRef`-style ref to correctly defer DOM access until after mount.
:::

CSS selectors and raw DOM elements are also valid targets:

```ts
useAnimate(".box", { translateX: 200 })
useAnimate(document.querySelector(".box"), { translateX: 200 })
```

::: warning
Avoid CSS selectors inside reusable components. If the component is rendered more than once, the selector matches all instances and triggers the animation on every matching element simultaneously. Use `useTemplateRef` instead to scope the animation to the component's own element. Page-level components rendered only once are not affected.
:::

## Reactive Options

All composables accept a `Ref` or `computed` as their options argument. When the options change, the composable reacts automatically:

```ts
const options = computed(() => ({
  translateX: distance.value,
  duration: 600,
}))

useAnimate(el, options)
```

::: warning
Changing reactive options recreates the underlying Anime.js instance from scratch. The animation restarts from the element's current position with the new parameters.
:::

## Lifecycle & Cleanup

Composables register their own cleanup via `onUnmounted` — you do not need to manually cancel or destroy animations:

```ts
// The animation is cancelled automatically when the component unmounts
const { play } = useAnimate(el, { translateX: 200 })
```

This applies to all composables.

## SSR

Every composable is safe to call during server-side rendering (Nuxt, `@vue/server-renderer`, `vite-ssr`) — Anime.js instances are only ever created once the component has actually mounted in a browser. During SSR, the returned instance ref (`animation`, `timer`, `timeline`, etc.) stays `undefined` and control methods (`play`, `pause`, …) are no-ops:

```ts
// Safe to call at the top level of setup(), even on the server
const { animation, play } = useAnimate(".box", { translateX: 200 })
```

::: warning
`useRawAnimate` is the one exception — it creates the Anime.js instance immediately and unconditionally, by design. Only call it from inside your own `onMounted`.
:::

## Directives

Directives are declarative alternatives to their composable counterparts — they read the same option shapes but apply directly from a template attribute, with no `<script setup>` code required:

```vue
<script setup lang="ts">
import { vAnimate } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-animate="{ translateX: 200, duration: 800 }" />
</template>
```

- All directives are prefixed with `v-` and accept the same option shapes as their composable counterpart (e.g. `v-animate` mirrors `useAnimate`'s `AnimationParams`)
- The binding value creates the instance on mount, re-creates it whenever the value changes, and reverts it on unmount — there is no manual cleanup to write
- Bind a `ref` or `computed` instead of a plain object to react to state changes:

```vue
<script setup lang="ts">
import { computed, ref } from "vue"
import { vAnimate } from "@juleshry/vue-animejs"

const duration = ref(800)
const options = computed(() => ({ translateX: 200, duration: duration.value }))
</script>

<template>
  <div v-animate="options" />
</template>
```

::: warning
Changing the binding value recreates the underlying Anime.js instance from scratch, same as changing a composable's reactive options.
:::

Reach for a directive when the animation has no imperative control needs (no `play` / `pause` / `restart` from script) and the options can be expressed inline. Reach for the composable instead when you need to control playback, read animation state, or share the instance across multiple elements.

## Returned Values

Each composable returns a plain object with reactive refs and control functions. Destructure only what you need:

```ts
const { play, pause, restart } = useAnimate(el, { translateX: 200 })
```

The `animation` property (where exposed) is a `DeepReadonly<ShallowRef<...>>`. Do not mutate it directly — use the returned control methods instead.

## TypeScript

The library is written in strict TypeScript and ships with full type declarations. All public API types are re-exported from the main entry point:

```ts
import type { UseAnimateReturn } from "@juleshry/vue-animejs"
```

Anime.js types (`AnimationParams`, `TargetSelector`, etc.) come from the `animejs` package itself and are passed through without wrapping.