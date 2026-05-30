# useSvgDrawable

## Demo

<UseSvgDrawableDemo />

Wraps an SVG geometry element in Anime.js's drawable Proxy, enabling `draw` property animations with `useAnimate`. The proxy intercepts `setAttribute('draw', …)` and translates normalised draw values (`0`–`1`) into the correct `stroke-dasharray` / `stroke-dashoffset` updates.

## Usage

### Basic draw animation

Pass the returned `drawable` ref as the target to `useAnimate`, then animate the `draw` property. Values are normalised: `0` = hidden, `1` = fully drawn.

::: warning
You must pass `drawable` — not the original template ref — as the `useAnimate` target. Animating the raw element bypasses the Proxy and produces no visual effect.
:::

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate, useSvgDrawable } from "@juleshry/vue-animejs"

const path_el = useTemplateRef<SVGPathElement>("path")

const { drawable } = useSvgDrawable(path_el)

useAnimate(drawable, {
  draw: "0 1",
  duration: 1500,
  ease: "inOutQuad",
})
</script>

<template>
  <svg viewBox="0 0 200 100">
    <path
      ref="path"
      d="M10 50 Q100 10 190 50"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    />
  </svg>
</template>
```

### Keyframe draw animation

Use an array of `draw` keyframes for more expressive stroke animations. Each keyframe is a `"start end"` string with normalised values.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate, useSvgDrawable } from "@juleshry/vue-animejs"

const circle_el = useTemplateRef<SVGCircleElement>("circle")

const { drawable } = useSvgDrawable(circle_el)

// Hidden → second half only → fully drawn
useAnimate(drawable, {
  draw: ["0 0", "0.5 1", "0 1"],
  duration: 1200,
  ease: "inOutQuad",
})
</script>

<template>
  <svg viewBox="0 0 100 100">
    <circle ref="circle" cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4" />
  </svg>
</template>
```

### Partial draw range

Use `start` and `end` to set the initial visible portion, and animate from there.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate, useSvgDrawable } from "@juleshry/vue-animejs"

const path_el = useTemplateRef<SVGPathElement>("path")

// Start half-drawn
const { drawable } = useSvgDrawable(path_el, 0, 0.5)

useAnimate(drawable, {
  draw: "0 1",
  duration: 1000,
  ease: "outExpo",
})
</script>

<template>
  <svg viewBox="0 0 200 100">
    <path ref="path" d="M10 50 Q100 10 190 50" fill="none" stroke="currentColor" stroke-width="3" />
  </svg>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseSvgDrawableReturn {
  /**
   * The Anime.js drawable Proxy for the target element. `undefined` until the element is available.
   * Pass this ref — not the original template ref — as the `useAnimate` target to animate the `draw` property.
   */
  drawable: DeepReadonly<ShallowRef<DrawableSVGGeometry | undefined>>
}

/**
 * Wraps an SVG geometry element in Anime.js's drawable Proxy. The proxy intercepts `setAttribute('draw', …)` calls and translates normalised `draw` values (`0`–`1`) into the correct `stroke-dasharray` / `stroke-dashoffset` updates. Pass the returned `drawable` ref as the target to `useAnimate`.
 *
 * @param target - The SVG element to make drawable. Accepts a template ref, a CSS selector, or a reactive ref to either.
 * @param start - Initial draw start position (`0`–`1`). Defaults to `0`.
 * @param end - Initial draw end position (`0`–`1`). Defaults to `0` (fully hidden).
 */
export declare function useSvgDrawable(
  target: MaybeRef<DOMTargetSelector> | MaybeComputedElementRef,
  start?: MaybeRef<number>,
  end?: MaybeRef<number>,
): UseSvgDrawableReturn
```

:::

## Reactivity & Lifecycle

- When `target` is a **template ref** (`useTemplateRef`), the drawable proxy is created after the component mounts (`flush: 'post'`), guaranteeing the element is in the DOM.
- When `target` is a **plain value** (string selector, element), the proxy is created immediately.
- If `target` changes, the previous proxy is discarded and a new one is created for the new element.
- On component **unmount**, the watcher is stopped and `drawable` is set to `undefined`.

::: tip
`draw` values are normalised: `0` = start of path, `1` = end of path. The format is `"startPosition endPosition"` — e.g. `"0 1"` draws the full stroke, `"0.25 0.75"` draws only the middle half.
:::

::: warning
`useSvgDrawable` overrides `stroke-linecap` to `butt` while the draw endpoints are not at `0` or `1`. This prevents visible gaps at the stroke ends during animation.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-svg-drawable.ts)
