# createMotionPath

## Demo

<UseCreateMotionPathDemo />

Animates an element along an SVG `<path>` track. Returns an object with `translateX`, `translateY`, and `rotate` properties to spread into `useAnimate` options. Part of [`useSvg`](/composables/use-svg).

## Usage

### Motion path

Spread the object returned by `createMotionPath` into `useAnimate` options. The track element must be mounted before calling `createMotionPath`, so call it inside `onMounted`.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useAnimate, useSvg } from "@juleshry/vue-animejs"

const dot = useTemplateRef<HTMLDivElement>("dot")
const track = useTemplateRef<SVGPathElement>("track")

const { createMotionPath } = useSvg()

useAnimate(dot, {
  ...createMotionPath(track),
  duration: 2000,
  ease: "linear",
  loop: true,
})
</script>

<template>
  <div style="position: relative; height: 100px">
    <svg viewBox="0 0 300 100" style="position: absolute; inset: 0; width: 100%; height: 100%">
      <path ref="track" d="M0 50 C75 0, 225 100, 300 50" fill="none" />
    </svg>
    <div ref="dot" style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: currentColor" />
  </div>
</template>
```

### Path offset

Pass an `offset` value (`0`–`1`) to start the animation at a specific point along the path instead of the beginning.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useAnimate, useSvg } from "@juleshry/vue-animejs"

const dot = useTemplateRef<HTMLDivElement>("dot")
const track = useTemplateRef<SVGPathElement>("track")

const { createMotionPath } = useSvg()

useAnimate(dot, {
  // Start halfway along the path
  ...createMotionPath(track, 0.5),
  duration: 2000,
  ease: "linear",
  loop: true,
})
</script>

<template>
  <div style="position: relative; height: 100px">
    <svg viewBox="0 0 300 100" style="position: absolute; inset: 0; width: 100%; height: 100%">
      <path ref="track" d="M0 50 C75 0, 225 100, 300 50" fill="none" />
    </svg>
    <div ref="dot" style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: currentColor" />
  </div>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseSvgReturn {
  /** Creates a motion-path object from an SVG `<path>`. Spread the result into `useAnimate` options to animate `translateX`, `translateY`, and `rotate` along the path. */
  createMotionPath: (path: MaybeRef<TargetsParam>, offset?: MaybeRef<number>) => ReturnType<typeof svg.createMotionPath>
}
```

:::

## Behavior

- `createMotionPath` must be called **after the track element is mounted** — wrap the call in `onMounted` or a watcher with `flush: 'post'`.
- The returned object contains `translateX`, `translateY`, and `rotate` properties that Anime.js drives along the path geometry. Spread them directly into the options object.
- The `offset` parameter shifts the starting position along the path (`0` = start, `1` = end). Useful for staggering multiple elements on the same track.

::: warning
`createMotionPath` spreads into the options object at call time — it is not reactive. If the track element changes after mount, call `createMotionPath` again with the new ref value.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-svg.ts)
