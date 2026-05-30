# useWaapi

## Demo

<UseWaapiDemo />

Wraps Anime.js [`waapi.animate()`](https://animejs.com/documentation/web-animations-api) into a Vue composable. The animation is driven by the browser's native [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), re-created reactively when the target or options change, and stopped automatically on unmount.

## Usage

### Basic animation

::: warning
`useWaapi` accepts native CSS property names and values (e.g. `translate: "220px"`, `opacity: 0`) — not Anime.js shorthand transforms like `translateX`.
:::

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useWaapi } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")

const { play, pause, restart } = useWaapi(box, {
  translate: "220px",
  duration: 1000,
  ease: "ease-in-out",
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

### Reactive options

Pass a `ref` or `computed` as the second argument.

::: warning
Changing options recreates the animation from scratch with the new parameters.
:::

```vue
<script setup lang="ts">
import { useTemplateRef, ref, computed } from "vue"
import { useWaapi } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")
const distance = ref(100)

const options = computed(() => ({
  translate: `${distance.value}px`,
  duration: 600,
  ease: "ease-out",
}))

useWaapi(box, options)

function increase() {
  distance.value += 50
}
</script>

<template>
  <div ref="box" class="box" />
  <button @click="increase">Increase distance</button>
</template>
```

### Using `convertEase`

Convert an Anime.js easing function to a WAAPI-compatible CSS easing string.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useWaapi } from "@juleshry/vue-animejs"
import { eases } from "animejs"

const box = useTemplateRef("box")

const { play, convertEase } = useWaapi(box, {
  translate: "220px",
  duration: 800,
  ease: convertEase(eases.inOut("quad")),
  autoplay: false,
})
</script>

<template>
  <div ref="box" class="box" />
  <button @click="play">Play</button>
</template>
```

### CSS selector target

You can pass any valid Anime.js `DOMTargetsParam` directly instead of a template ref.

```vue
<script setup lang="ts">
import { useWaapi } from "@juleshry/vue-animejs"

const { play } = useWaapi(".box", {
  rotate: "360deg",
  duration: 1000,
})
</script>

<template>
  <div class="box" />
  <button @click="play">Spin</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js WAAPI documentation](https://animejs.com/documentation/web-animations-api).

::: details Show Type Declarations

```ts
export interface UseWaapiReturn {
  /** The underlying Anime.js WAAPI animation instance. `undefined` until the target is available. */
  animation: DeepReadonly<ShallowRef<WAAPIAnimation | undefined>>
  /** Resumes the animation from a paused state. */
  resume: () => WAAPIAnimation | undefined
  /** Pauses the animation at the current position. */
  pause: () => WAAPIAnimation | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => WAAPIAnimation | undefined
  /** Starts or resumes the animation. */
  play: () => WAAPIAnimation | undefined
  /** Reverses playback direction. */
  reverse: () => WAAPIAnimation | undefined
  /** Seeks to a specific time (in ms). */
  seek: (time: MaybeRef<number>, muteCallbacks?: MaybeRef<boolean>) => WAAPIAnimation | undefined
  /** Restarts the animation from the beginning. */
  restart: () => WAAPIAnimation | undefined
  /** Commits the current animated styles to the element's inline style, then stops the animation. */
  commitStyles: () => WAAPIAnimation | undefined
  /** Jumps immediately to the end of the animation. */
  complete: () => WAAPIAnimation | undefined
  /** Cancels the animation and removes it from the WAAPI engine. */
  cancel: () => WAAPIAnimation | undefined
  /** Cancels the animation and restores all animated properties to their original values. */
  revert: () => WAAPIAnimation | undefined
  /** Converts an Anime.js easing function to a WAAPI-compatible CSS easing string. */
  convertEase: (fn: MaybeRef<EasingFunction>, samples?: MaybeRef<number>) => string
}

/**
 * Wraps Anime.js `waapi.animate()` into a Vue composable. Reactively re-creates the animation when the target or options change, and cancels it automatically on unmount.
 *
 * @param targets - The element(s) to animate. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js WAAPI animation parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useWaapi(
  targets: MaybeRef<DOMTargetsParam> | MaybeComputedElementRef,
  options?: MaybeRef<WAAPIAnimationParams>
): UseWaapiReturn
```

:::

## Reactivity Behavior

- When `targets` is a **template ref** (`useTemplateRef`), the animation is created after the component mounts (`flush: 'post'`).
- When `targets` is a **plain value** (string selector, element), the animation is created immediately.
- If either `targets` or `options` changes, the current animation is **cancelled** and a new one is created.
- On component **unmount**, the watcher is stopped automatically.

::: tip
Always use `useTemplateRef<HTMLElement>('refName')` for DOM targets — not `ref<HTMLElement | null>(null)`. The composable uses [`unrefElement`](https://vueuse.org/core/unrefElement/) from [`@vueuse/core`](https://vueuse.org/) to resolve it correctly.
:::

::: warning
`useWaapi` uses native CSS property names. Use `translate: "220px"` instead of `translateX: 220`, and `rotate: "360deg"` instead of `rotate: 360`.
:::

::: warning
`animation` is a readonly shallow ref. Do not mutate the WAAPI instance directly — use the returned control methods instead.
:::

## Source

[`use-waapi.ts`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-waapi.ts)
