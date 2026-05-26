# useDraggable

## Demo

<UseDraggableDemo />

Wraps Anime.js [`createDraggable()`](https://animejs.com/documentation/draggable) into a Vue composable. The draggable instance is created reactively — it re-creates whenever the target element or options change — and is reverted automatically on unmount.

## Usage

### Basic draggable

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useDraggable } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")

const { reset, disable, enable } = useDraggable(box)
</script>

<template>
  <div ref="box" class="box" />

  <button @click="enable">Enable</button>
  <button @click="disable">Disable</button>
  <button @click="reset">Reset</button>
</template>
```

### Constrained to a container

Pass a container element via the `container` option to keep the element within bounds. Use `containerPadding` to add inner spacing.

::: warning
`container` must be resolved inside a `computed` — a template ref's `.value` is `null` at setup time, so passing it directly in a plain object will result in an unconstrained draggable.
:::

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { useDraggable } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")
const container = useTemplateRef("container")

const options = computed(() => ({
  container: container.value,
  containerPadding: 10,
}))

useDraggable(box, options)
</script>

<template>
  <div ref="container" class="stage">
    <div ref="box" class="box" />
  </div>
</template>
```

### Release easing

Control the animation that plays when the element is released with `releaseEase`.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useDraggable } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")

useDraggable(box, {
  releaseEase: "spring(1, 80, 12, 0)",
})
</script>

<template>
  <div ref="box" class="box" />
</template>
```

### Reactive options

Pass a `ref` or `computed` as the second argument to change draggable behaviour at runtime.

::: warning
Changing options reverts the current draggable instance and creates a new one from scratch.
:::

```vue
<script setup lang="ts">
import { useTemplateRef, ref, computed } from "vue"
import { useDraggable } from "@juleshry/vue-animejs"

const box = useTemplateRef("box")
const locked = ref(false)

const options = computed(() => ({
  x: !locked.value,
  y: !locked.value,
}))

useDraggable(box, options)
</script>

<template>
  <div ref="box" class="box" />
  <button @click="locked = !locked">Toggle lock</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js draggable documentation](https://animejs.com/documentation/draggable).

::: details Show Type Declarations

```ts
export interface UseDraggableReturn {
  /** The underlying Anime.js draggable instance. `undefined` until the target is available. */
  draggable: DeepReadonly<ShallowRef<Draggable | undefined>>
  /** Disables dragging without removing the instance. */
  disable: () => void
  /** Re-enables a disabled draggable. */
  enable: () => void
  /** Programmatically sets the x position. */
  setX: (x: number, muteUpdateCallback?: boolean) => void
  /** Programmatically sets the y position. */
  setY: (y: number, muteUpdateCallback?: boolean) => void
  /** Animates the element back into the viewport. */
  animateInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  /** Scrolls the element into the viewport. */
  scrollInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  /** Stops any in-progress release animation. */
  stop: () => void
  /** Resets the element to its initial position. */
  reset: () => void
  /** Removes the draggable and restores the element's original styles. */
  revert: () => void
  /** Re-reads container and element dimensions (call after layout changes). */
  refresh: () => void
}

/**
 * Wraps Anime.js `createDraggable()` into a Vue composable. Reactively re-creates the draggable when the target or options change, and reverts it automatically on unmount.
 *
 * @param targets - The element(s) to make draggable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js draggable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useDraggable(
  targets: MaybeRef<TargetsParam>,
  options?: MaybeRef<DraggableParams>
): UseDraggableReturn
```

:::

## Reactivity Behavior

- When `targets` is a **template ref** (`useTemplateRef`), the draggable is created after the component mounts (`flush: 'post'`).
- When `targets` is a **plain value** (string selector, element), the draggable is created immediately.
- If either `targets` or `options` changes, the current draggable is **reverted** and a new one is created.
- On component **unmount**, the watcher and draggable instance are cleaned up automatically.

::: tip
Call `refresh()` after any layout change that affects the container or element dimensions — for example, after a resize or after toggling visibility.
:::

::: warning
`draggable` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-draggable.ts)
