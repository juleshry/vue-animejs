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
/** The keys of `T` that represent animatable properties, excluding Anime.js's reserved config keys (`ease`, `duration`, `unit`, `modifier`, `composition`). */
export type AnimatablePropertyKeys<T extends AnimatableParams> = Exclude<keyof T, keyof AnimatablePropertyParamsOptions>

/** An `AnimatableObject` narrowed to only the property setters/getters implied by `T`. */
export type TypedAnimatableObject<T extends AnimatableParams> = Animatable & {
  [K in AnimatablePropertyKeys<T>]: AnimatableProperty
}

export interface UseAnimatableReturn<T extends AnimatableParams = AnimatableParams> {
  /** The underlying Anime.js animatable instance. `undefined` until the target is available. */
  animatable: Readonly<ShallowRef<TypedAnimatableObject<T> | undefined>>
  /** Cancels the animatable and restores all animated properties to their original values. */
  revert: () => TypedAnimatableObject<T> | undefined
}

/**
 * Wraps Anime.js `createAnimatable()` into a Vue composable. Reactively re-creates the animatable when the target or options change, and reverts it automatically on unmount.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useAnimatable<T extends AnimatableParams = AnimatableParams>(
  targets: MaybeRef<TargetsParam>,
  options?: MaybeRef<T>
): UseAnimatableReturn<T>
```

:::

## Reactivity Behavior

- When `targets` is a **template ref** (`useTemplateRef`), the animatable is created after the component mounts (`flush: 'post'`).
- When `targets` is a **plain value** (string selector, element), the animatable is created immediately.
- If either `targets` or `options` changes, the current animatable is **reverted** and a new one is created.
- On component **unmount**, the watcher and animatable are cleaned up automatically via `revert()`.
- The properties available on `animatable.value` are inferred from the shape of `options` passed at the call site — calling a property that wasn't configured (or a reserved config key like `ease`) is a type error.

::: tip
Call properties as functions on `animatable.value` (e.g. `animatable.value.x(100)`) to spring-animate to the new value. Calling without arguments reads the current value (e.g. `animatable.value.x()`). No play method needed — the animatable responds immediately.
:::

::: warning
`animatable` is a readonly shallow ref. Do not replace `animatable.value` directly — only set properties on the existing instance.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-animatable.ts)
