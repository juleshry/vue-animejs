# morphTo

## Demo

<UseSvgDemo />

Morphs an SVG `<path>` to another shape. Returns a `FunctionValue` to pass as the `d` property in animation options. Part of [`useSvg`](/composables/use-svg).

## Usage

### Basic morphing

`morphTo` requires a live DOM element as the morph target — it cannot accept raw path data strings. Add the target shape as a hidden `<path>`, reference it with `useTemplateRef`, then **pass the ref directly** to `morphTo`. `morphTo` returns a `FunctionValue` that resolves the ref lazily, only when Anime.js reads the `d` value — so a plain options object works whether the target is mounted yet or not. Reach for `computed()` only if you want the morph target itself to change later.

::: warning
Both paths must have the same number of SVG commands and the same command types for smooth interpolation.
:::

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate, useSvg } from "@juleshry/vue-animejs"

const shape = useTemplateRef<SVGPathElement>("shape")
const target = useTemplateRef<SVGPathElement>("target")

const { morphTo } = useSvg()

useAnimate(shape, {
  d: morphTo(target),
  duration: 1400,
  ease: "inOutCubic",
  loop: true,
  alternate: true,
})
</script>

<template>
  <svg viewBox="0 0 100 100">
    <!-- Visible animated shape -->
    <path ref="shape" d="M 50 15 C 78 8, 95 28, 90 52 C 85 76, 68 90, 50 88 C 32 90, 15 76, 10 52 C 5 28, 22 8, 50 15 Z" />
    <!-- Hidden morph target — morphTo reads its path geometry -->
    <path ref="target" d="M 50 5 C 54 32, 68 32, 95 50 C 68 68, 54 68, 50 95 C 46 68, 32 68, 5 50 C 32 32, 46 32, 50 5 Z" visibility="hidden" />
  </svg>
</template>
```

### Multi-shape timeline morphing

To cycle through several shapes, use `useTimeline`. Pass each morph step as a plain `{ d: morphTo(target) }` object — `morphTo` resolves each target lazily on its own, so `useTimeline.add()` doesn't need a `computed()` wrapper to stay correct. Use a position offset (`"+=N"`) between steps to pause, and `loopDelay` on the timeline options to pause before looping back.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useSvg, useTimeline } from "@juleshry/vue-animejs"

const shape = useTemplateRef<SVGPathElement>("shape")
const t_circle = useTemplateRef<SVGPathElement>("t-circle")
const t_diamond = useTemplateRef<SVGPathElement>("t-diamond")

const { morphTo } = useSvg()

const { add, restart } = useTimeline({
  loop: true,
  defaults: { duration: 1200, ease: "inOutCubic" },
  loopDelay: 500,
})

add(shape, { d: morphTo(t_circle) })
  .add(shape, { d: morphTo(t_diamond) }, "+=500")
</script>

<template>
  <svg viewBox="0 0 100 100">
    <path ref="shape" d="M 50 15 C 78 8, 95 28, 90 52 C 85 76, 68 90, 50 88 C 32 90, 15 76, 10 52 C 5 28, 22 8, 50 15 Z" />
    <path ref="t-circle" d="M 50 10 C 72 10, 90 28, 90 50 C 90 72, 72 90, 50 90 C 28 90, 10 72, 10 50 C 10 28, 28 10, 50 10 Z" visibility="hidden" />
    <path ref="t-diamond" d="M 50 5 C 54 32, 68 32, 95 50 C 68 68, 54 68, 50 95 C 46 68, 32 68, 5 50 C 32 32, 46 32, 50 5 Z" visibility="hidden" />
  </svg>
  <button @click="restart">Restart</button>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseSvgReturn {
  /** Returns a `FunctionValue` that morphs the current path to the given `path`. Pass the result as the `d` property in `useAnimate` options. */
  morphTo: (path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) => FunctionValue
}
```

:::

## Behavior

- `morphTo` requires a **live DOM element** — always add the target as a hidden `<path>` in the template.
- Pass the **ref itself** (not `.value`) to `morphTo`. The returned `FunctionValue` re-resolves the ref every time Anime.js invokes it, so it stays correct even if the target isn't mounted yet when `morphTo()` is called (e.g. behind a `v-if`).
- When cycling through multiple shapes, Anime.js stores the resampled target path on the source element after each morph, ensuring seamless chaining across loop iterations.

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-svg.ts)
