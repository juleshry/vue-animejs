# useAnimate

## Demo

<UseAnimateDemo />

Wraps Anime.js [`animate()`](https://animejs.com/documentation/animation) into a Vue composable. The animation is created reactively — it re-creates whenever the target element or options change — and is cancelled automatically on unmount.

## Usage

### Basic animation

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "vue-animejs"

const box = useTemplateRef("box")

const { play, pause, restart } = useAnimate(box, {
  translateX: 200,
  duration: 800,
  easing: "easeInOutQuad",
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
import { useAnimate } from "vue-animejs"

const box = useTemplateRef("box")
const distance = ref(100)

const options = computed(() => ({
  translateX: distance.value,
  duration: 600,
  easing: "easeOutExpo",
}))

useAnimate(box, options)

function increase() {
  distance.value += 50
}
</script>

<template>
  <div ref="box" class="box" />
  <button @click="increase">Increase distance</button>
</template>
```

### CSS selector target

You can pass any valid Anime.js `TargetSelector` directly instead of a template ref.

```vue
<script setup lang="ts">
import { useAnimate } from "vue-animejs"

const { play } = useAnimate(".box", {
  rotate: 360,
  duration: 1000,
})
</script>

<template>
  <div class="box" />
  <button @click="play">Spin</button>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseAnimateReturn {
  /** The underlying Anime.js animation instance. `undefined` until the target is available. */
  animation: DeepReadonly<ShallowRef<JSAnimation | undefined>>
  /** Starts or resumes the animation. */
  play: () => JSAnimation | undefined
  /** Reverses playback direction. */
  reverse: () => JSAnimation | undefined
  /** Pauses the animation at the current position. */
  pause: () => JSAnimation | undefined
  /** Restarts the animation from the beginning. */
  restart: () => JSAnimation | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => JSAnimation | undefined
  /** Resumes from a paused state. */
  resume: () => JSAnimation | undefined
  /** Jumps immediately to the end of the animation. */
  complete: () => JSAnimation | undefined
  /** Stops the animation and removes it from the Anime.js engine. */
  cancel: () => JSAnimation | undefined
  /** Cancels the animation and restores all animated properties to their original values. */
  revert: () => JSAnimation | undefined
  /** Resets the animation to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => JSAnimation | undefined
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => JSAnimation | undefined
  /** Rescales the animation to a new total duration. */
  stretch: (newDuration: number) => JSAnimation | undefined
  /** Re-reads the current values of animated properties from the DOM. */
  refresh: () => JSAnimation | undefined
}

/**
 * Wraps Anime.js `animate()` into a Vue composable. Reactively re-creates the animation when the target or options change, and cancels it automatically on unmount.
 *
 * @param target - The element(s) to animate. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animation parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useAnimate(
  target: MaybeRef<TargetSelector> | MaybeComputedElementRef,
  options?: MaybeRef<AnimationParams>
): UseAnimateReturn
```

:::

## Reactivity Behavior

- When `target` is a **template ref** (`useTemplateRef`), the animation is created after the component mounts (`flush: 'post'`).
- When `target` is a **plain value** (string selector, element), the animation is created immediately.
- If either `target` or `options` changes, the current animation is **cancelled** and a new one is created.
- On component **unmount**, the watcher and animation are cleaned up automatically.

::: tip
Always use `useTemplateRef<HTMLElement>('refName')` for DOM targets — not `ref<HTMLElement | null>(null)`. The composable uses [`unrefElement`](https://vueuse.org/core/unrefElement/) from [`@vueuse/core`](https://vueuse.org/) to resolve it correctly.
:::

::: warning
`animation` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-animate.ts)