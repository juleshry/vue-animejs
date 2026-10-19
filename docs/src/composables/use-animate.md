# useAnimate

## Demo

<UseAnimateDemo />

Wraps Anime.js [`animate()`](https://animejs.com/documentation/animation) into a Vue composable. The animation is created reactively — it re-creates whenever the target element or options change — and is cancelled automatically on unmount.

## Usage

### Basic animation

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

### Reactive options

Put a `ref` straight into the options object: changing it recreates the animation with the new value. The whole options object can also be a `ref`, a `computed` or a getter.

::: warning
Changing options recreates the animation from scratch with the new parameters.
:::

```vue
<script setup lang="ts">
import { useTemplateRef, ref } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")
const distance = ref(100)

useAnimate(box, {
  translateX: distance,
  duration: 600,
  ease: "outExpo",
})

function increase() {
  distance.value += 50
}
</script>

<template>
  <div ref="box" class="box" />
  <button @click="increase">Increase distance</button>
</template>
```

Refs are only unwrapped one level deep. For a value nested in a tween object or a keyframe array, build the options in a getter (or a `computed`) instead:

```ts
useAnimate(box, () => ({
  translateX: { to: distance.value, ease: "outExpo" },
  duration: 600,
}))
```

### CSS selector target

You can pass any valid Anime.js `TargetSelector` directly instead of a template ref.

```vue
<script setup lang="ts">
import { useAnimate } from "@juleshry/vue-animejs"

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

### Array of targets

Pass an array of individual template refs to animate them together as a single group.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const box1 = useTemplateRef("box1")
const box2 = useTemplateRef("box2")
const box3 = useTemplateRef("box3")

useAnimate([box1, box2, box3], {
  translateY: -20,
  duration: 600,
  ease: "outExpo",
})
</script>

<template>
  <div ref="box1" class="box" />
  <div ref="box2" class="box" />
  <div ref="box3" class="box" />
</template>
```

## Type Declarations

For all available options, see the [Anime.js animation documentation](https://animejs.com/documentation/animation).

::: details Show Type Declarations

```ts
export interface UseAnimateReturn {
  /** The underlying Anime.js animation instance. `undefined` until the target is available. */
  animation: Readonly<ShallowRef<JSAnimation | undefined>>
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
 * @param target - The element(s) to animate. Accepts a template ref, a CSS selector, a DOM element, a reactive ref to any of these, or an array of them.
 * @param options - Anime.js animation parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties. Defaults to `{}`.
 */
export declare function useAnimate(
  target: MaybeRef<TargetSelector> | MaybeComputedElementRef,
  options?: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>
): UseAnimateReturn
```

:::

## Reactivity Behavior

- The animation is created once the component has **mounted**, whatever form `target` takes (template ref, selector, element), so a selector can point into the component's own template, and server-rendered HTML is never touched before hydration.
- A template ref that is still empty at mount (e.g. behind a `v-if`) creates the animation as soon as it resolves.
- If `target` or `options` changes, the current animation is **cancelled** and a new one is created. For `options`, that means a new object in a ref / computed / getter, a ref inside it changing, or a property of a reactive options object mutated in place.
- On component **unmount**, the watcher and animation are cleaned up automatically.

::: tip
Always use `useTemplateRef<HTMLElement>('refName')` for DOM targets — not `ref<HTMLElement | null>(null)`. The composable uses [`unrefElement`](https://vueuse.org/core/unrefElement/) from [`@vueuse/core`](https://vueuse.org/) to resolve it correctly.
:::

::: warning
`animation` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-animate.ts)