# v-svg-drawable

## Demo

<VSvgDrawableDemo />

Wraps an SVG geometry element in Anime.js's drawable Proxy and animates its `draw` property directly from a template attribute. The animation is created on mount, re-created whenever the binding value changes, and reverted automatically on unmount.

## Usage

### Basic draw animation

Values are normalised: `0` = hidden, `1` = fully drawn.

```vue
<script setup lang="ts">
import { vSvgDrawable } from "@juleshry/vue-animejs"
</script>

<template>
  <svg viewBox="0 0 200 100">
    <path
      v-svg-drawable="{ draw: '0 1', duration: 1500, ease: 'inOutQuad' }"
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
import { vSvgDrawable } from "@juleshry/vue-animejs"

// Hidden → second half only → fully drawn
const options = {
  draw: ["0 0", "0.5 1", "0 1"],
  duration: 1200,
  ease: "inOutQuad",
}
</script>

<template>
  <svg viewBox="0 0 100 100">
    <circle v-svg-drawable="options" cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4" />
  </svg>
</template>
```

### Reactive options

Bind a `ref` or `computed` — the animation is cancelled and re-created whenever the value changes.

::: warning
Changing options recreates the drawable and its animation from scratch.
:::

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { vSvgDrawable } from "@juleshry/vue-animejs"

const duration = ref(1200)

const options = computed(() => ({
  draw: "0 1",
  duration: duration.value,
  ease: "outExpo",
}))
</script>

<template>
  <svg viewBox="0 0 200 100">
    <path
      v-svg-drawable="options"
      d="M10 50 Q100 10 190 50"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    />
  </svg>
  <input type="range" min="200" max="3000" v-model.number="duration" />
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
/**
 * Declarative SVG drawable directive. Wraps the SVG geometry element in an Anime.js drawable
 * Proxy and animates the `draw` property on mount. Re-creates it when the binding value changes
 * and reverts on unmount.
 *
 * @example
 * <path v-svg-drawable="{ draw: '0 1', duration: 1200 }" />
 * <path v-svg-drawable="{ draw: ['0 0', '0.5 1', '0 1'], ease: 'inOutQuad', loop: true }" />
 */
export declare const vSvgDrawable: Directive<SVGGeometryElement, AnimationParams | undefined>
```

:::

## Lifecycle Behavior

- On **mount**, the element is wrapped in a drawable Proxy and, if a binding value is provided, the `draw` animation is created immediately.
- On **update**, if the binding value changed, the previous animation is **cancelled** and **reverted**, then a new drawable and animation are created from the new value.
- On **unmount**, the animation is cancelled and reverted.

::: tip
`draw` values are normalised: `0` = start of path, `1` = end of path. The format is `"startPosition endPosition"` — e.g. `"0 1"` draws the full stroke, `"0.25 0.75"` draws only the middle half.
:::

::: warning
Only use `v-svg-drawable` on SVG geometry elements (`path`, `circle`, `line`, `polyline`, `polygon`, `rect`, `ellipse`) — it relies on Anime.js's `svg.createDrawable()`, which requires a measurable stroke path.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-svg-drawable.ts)
