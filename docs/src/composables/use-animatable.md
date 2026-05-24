# useAnimatable

## Demo

<UseAnimatableDemo />

Wraps Anime.js [`createAnimatable()`](https://animejs.com/documentation/animatable) into a Vue composable. Creates an animatable object whose properties can be set imperatively to spring-animate to new values — without running a discrete animation.

## Usage

### Basic usage

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useEventListener } from "@vueuse/core"
import { utils } from "animejs"
import { useAnimatable } from "@juleshry/vue-animejs"

const stage = useTemplateRef("stage")
const box = useTemplateRef("box")

const { animatable } = useAnimatable(box, {
  x: 500,
  y: 500,
  ease: "out(3)",
})

let bounds = { width: 0, height: 0, left: 0, top: 0 }

useEventListener("mousemove", (e: MouseEvent) => {
  if (!animatable.value) return
  const { width, height, left, top } = bounds
  const hw = width / 2
  const hh = height / 2
  animatable.value.x(utils.clamp(e.clientX - left - hw, -hw, hw))
  animatable.value.y(utils.clamp(e.clientY - top - hh, -hh, hh))
})

useEventListener("scroll", refreshBounds, { capture: true })

function refreshBounds() { 
  bounds = stage.value?.getBoundingClientRect() ?? bounds 
}
</script>

<template>
  <div ref="stage" class="stage" @vue:mounted="refreshBounds">
    <div ref="box" class="box" />
  </div>
</template>
```

### Reverting

Call `revert()` to stop the animatable and restore all properties to their original values.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimatable } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")

const { animatable, revert } = useAnimatable(box, {
  x: 500,
  ease: "out(3)",
})

function move() {
  if (!animatable.value) return
  animatable.value.x(200)
}
</script>

<template>
  <div ref="box" class="box" />
  <button @click="move">Move</button>
  <button @click="revert">Revert</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js animatable documentation](https://animejs.com/documentation/animatable).

::: details Show Type Declarations

```ts
export interface UseAnimatableReturn {
  /** The underlying Anime.js animatable instance. `undefined` until the target is available. */
  animatable: DeepReadonly<ShallowRef<AnimatableObject | undefined>>
  /** Stops the animatable and restores all properties to their original values. */
  revert: () => AnimatableObject | undefined
}

/**
 * Wraps Anime.js `createAnimatable()` into a Vue composable. The animatable is created reactively — it re-creates whenever the target element or options change — and is reverted automatically on unmount.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useAnimatable(
  targets: MaybeRef<TargetsParam>,
  options?: MaybeRef<AnimatableParams>
): UseAnimatableReturn
```

:::

## Reactivity Behavior

- When `targets` is a **template ref** (`useTemplateRef`), the animatable is created after the component mounts (`flush: 'post'`).
- When `targets` is a **plain value** (string selector, element), the animatable is created immediately.
- If either `targets` or `options` changes, the current animatable is **reverted** and a new one is created.
- On component **unmount**, the watcher and animatable are cleaned up automatically via `revert()`.

::: tip
Call properties as functions on `animatable.value` (e.g. `animatable.value.x(100)`) to spring-animate to the new value. Calling without arguments reads the current value (e.g. `animatable.value.x()`). No play method needed — the animatable responds immediately.
:::

::: warning
`animatable` is a readonly shallow ref. Do not replace `animatable.value` directly — only set properties on the existing instance.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-animatable.ts)
