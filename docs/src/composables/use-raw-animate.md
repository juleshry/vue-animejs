# useRawAnimate

## Demo

<UseRawAnimateDemo />

Calls Anime.js `animate()` directly, returning the raw `JSAnimation` instance without any Vue lifecycle integration or reactivity wrappers.

## Usage

### Basic animation

::: warning
`useRawAnimate` does not integrate with Vue's lifecycle. Call it inside `onMounted` when targeting a DOM element so the element exists when the animation is created.
:::

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useRawAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLElement>("box")

onMounted(() => {
  useRawAnimate(box.value!, {
    translateX: 200,
    duration: 800,
    easing: "easeInOutQuad",
  })
})
</script>

<template>
  <div ref="box" class="box" />
</template>
```

### Manual playback control

Because `useRawAnimate` returns the raw `JSAnimation`, you can store it and call Anime.js methods directly.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useRawAnimate } from "@juleshry/vue-animejs"
import type { JSAnimation } from "animejs"

const box = useTemplateRef<HTMLElement>("box")
let animation: JSAnimation | null = null

onMounted(() => {
  animation = useRawAnimate(box.value!, {
    translateX: 200,
    duration: 1000,
    easing: "easeOutExpo",
    autoplay: false,
  })
})
</script>

<template>
  <div ref="box" class="box" />
  <button @click="animation?.play()">Play</button>
  <button @click="animation?.pause()">Pause</button>
  <button @click="animation?.restart()">Restart</button>
</template>
```

### CSS selector target

You can pass any valid Anime.js `TargetSelector` directly.

```vue
<script setup lang="ts">
import { useRawAnimate } from "@juleshry/vue-animejs"

const animation = useRawAnimate(".box", {
  rotate: 360,
  duration: 1000,
  loop: true,
})
</script>

<template>
  <div class="box" />
  <button @click="animation.pause()">Pause</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js animation documentation](https://animejs.com/documentation/animation).

::: details Show Type Declarations

```ts
export interface UseRawAnimateReturn {
  animate: (target: TargetSelector, options: AnimationParams) => void
}

/**
 * Calls Anime.js `animate()` directly, returning the raw `JSAnimation` instance without Vue lifecycle integration or reactivity.
 *
 * @param target - The element(s) to animate. Accepts a CSS selector, DOM element, or a `MaybeRef` of either.
 * @param options - Anime.js animation parameters. Accepts a plain object or a `MaybeRef`. Defaults to `{}`.
 */
export declare function useRawAnimate(
  target: MaybeRef<TargetSelector>,
  options?: MaybeRef<AnimationParams>
): JSAnimation
```

:::

## Behavior

- `useRawAnimate` is a **thin escape hatch** — it unrefs `target` and `options`, then delegates directly to Anime.js `animate()`.
- There is **no reactivity**: changing `target` or `options` after the call does nothing.
- There is **no automatic cleanup**: the animation is not cancelled on component unmount. You must call `animation.cancel()` or `animation.revert()` yourself in `onUnmounted` if needed.
- The return value is the raw Anime.js `JSAnimation` instance — not a Vue ref.

::: tip
Prefer [`useAnimate`](./use-animate) for typical use cases. Use `useRawAnimate` only when you need direct access to the `JSAnimation` instance and want to manage the lifecycle yourself.
:::

::: warning
Passing a template ref as `target` outside of `onMounted` (or a post-flush watcher) will warn and produce no animation — the DOM element does not exist yet at setup time.
:::

## Source

[`use-raw-animate.ts`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-raw-animate.ts)
