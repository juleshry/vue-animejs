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
import { useAnimate } from "vue-animejs"

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

This applies to all composables: `useAnimate`, `useTimer`, `useTimeline`, and `useAnimatable`.

## Returned Values

Each composable returns a plain object with reactive refs and control functions. Destructure only what you need:

```ts
const { play, pause, restart } = useAnimate(el, { translateX: 200 })
```

The `animation` property (where exposed) is a `DeepReadonly<ShallowRef<...>>`. Do not mutate it directly — use the returned control methods instead.

## TypeScript

The library is written in strict TypeScript and ships with full type declarations. All public API types are re-exported from the main entry point:

```ts
import type { UseAnimateReturn } from "vue-animejs"
```

Anime.js types (`AnimationParams`, `TargetSelector`, etc.) come from the `animejs` package itself and are passed through without wrapping.