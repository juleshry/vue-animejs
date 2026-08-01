# v-text-split

## Demo

<VTextSplitDemo />

Splits the element's text into chars, words, or lines directly from a template attribute, and optionally animates the resulting spans. Re-splits when the binding value changes and reverts the DOM automatically on unmount.

## Usage

### Split and animate by character

```vue
<script setup lang="ts">
import { stagger } from "animejs"
import { vTextSplit } from "@juleshry/vue-animejs"

const options = {
  chars: true,
  animation: {
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 600,
    ease: "outExpo",
    delay: stagger(40),
  },
}
</script>

<template>
  <p v-text-split="options">Vue + Anime.js</p>
</template>
```

### Split by word or line

Use `words` or `lines` instead of `chars` to control the split granularity.

::: warning
Line detection waits for `document.fonts.ready` before animating, since line breaks depend on the font having finished loading.
:::

```vue
<script setup lang="ts">
import { stagger } from "animejs"
import { vTextSplit } from "@juleshry/vue-animejs"

const word_options = {
  words: true,
  animation: {
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 500,
    ease: "outBack(1.5)",
    delay: stagger(80),
  },
}

const line_options = {
  lines: true,
  animation: {
    translateX: [-40, 0],
    opacity: [0, 1],
    duration: 700,
    ease: "outCubic",
    delay: stagger(120),
  },
}
</script>

<template>
  <p v-text-split="word_options">Animate every word</p>
  <p v-text-split="line_options">Split text into lines. Each line slides in.</p>
</template>
```

### Splitting without animating

Omit `animation` to split the text without running an animation — useful if you want to animate the spans yourself later.

```vue
<script setup lang="ts">
import { vTextSplit } from "@juleshry/vue-animejs"
</script>

<template>
  <p v-text-split="{ chars: true }">Just split, no animation</p>
</template>
```

### Reactive options

Bind a `ref` or `computed` — the split is reverted and re-created whenever the value changes.

::: warning
Changing options reverts the current split and re-runs it from scratch. Any in-progress animation on the old spans is lost.
:::

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { stagger } from "animejs"
import { vTextSplit } from "@juleshry/vue-animejs"

const duration = ref(500)

const options = computed(() => ({
  words: true,
  animation: {
    opacity: [0, 1],
    duration: duration.value,
    delay: stagger(80),
  },
}))
</script>

<template>
  <p v-text-split="options">Reactive duration</p>
  <input type="range" min="100" max="1200" v-model.number="duration" />
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface VTextSplitValue extends TextSplitterParams {
  animation?: AnimationParams
}

/**
 * Declarative text-split directive. Splits the element's text into chars, words, or lines on
 * mount, and optionally animates the resulting spans. Re-creates on binding change, reverts on unmount.
 *
 * @example
 * <p v-text-split="{ words: true, animation: { translateY: [20, 0], opacity: [0, 1], delay: stagger(60) } }">Hello</p>
 * <p v-text-split="{ chars: true, animation: { opacity: [0, 1], delay: stagger(30) } }">Hello</p>
 * <p v-text-split="{ lines: true, animation: { translateX: [-20, 0], delay: stagger(100) } }">Hello</p>
 */
export declare const vTextSplit: Directive<HTMLElement, VTextSplitValue | undefined>
```

:::

## Lifecycle Behavior

- On **mount**, the text is split immediately. If `animation` is provided, it's applied to the resulting spans — for `lines`, the animation waits for `document.fonts.ready` first.
- On **update**, if the binding value changed, the previous split is **reverted** and its animation **cancelled**, then the text is split and animated again from the new value.
- On **unmount**, the animation is cancelled and the split is reverted, restoring the original text content.

::: tip
`animation` accepts the same parameters as `useAnimate` / `v-animate`, including `stagger()` for `delay` to sequence chars, words, or lines.
:::

::: warning
Only one of `chars`, `words`, or `lines` is used for the animation target when multiple are set — `lines` takes priority, then `chars`, then `words`.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-text-split.ts)
