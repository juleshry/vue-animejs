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

### Server-side rendering

Text can only be split in the browser, so the server sends it whole and the client splits it after hydration. Without help, the full text shows for a moment before the animation hides each piece and animates it back in. Set `ssrHidden: true` to hide the element on the server instead: it stays hidden until the text is split and the animation has painted its starting state, then becomes visible.

The text can't be split on the server because:

- splitting rewrites the element's children into `<span>`s, and a directive can only add attributes to its element on the server, not change what's inside it
- `lines` depends on layout (container width, loaded fonts), which only exists in the browser. That's also why line animations wait for `document.fonts.ready`
- pre-split HTML wouldn't match the component's template, so Vue would report a hydration mismatch on the children

::: warning
`ssrHidden` is opt-in because the text stays invisible until JavaScript runs: if it fails to load, or hydration is slow, the text isn't readable. Prefer it for decorative headings, not for content that must be readable right away.
:::

```vue
<script setup lang="ts">
import { stagger } from "animejs"
import { vTextSplit } from "@juleshry/vue-animejs"
</script>

<template>
  <h1 v-text-split="{ words: true, ssrHidden: true, animation: { opacity: [0, 1], delay: stagger(60) } }">
    Hidden until split
  </h1>
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
  /**
   * SSR only: renders the element with `visibility: hidden` on the server, removed once the text is
   * split and the animation has painted its starting state, so the unsplit text doesn't flash before
   * hydration. Opt-in because the text stays invisible until JavaScript runs.
   */
  ssrHidden?: boolean
}

/**
 * Declarative text-split directive. Splits the element's text into chars, words, or lines on
 * mount (once the mount flush has finished, so components' own `onMounted` hooks still see the
 * rendered DOM), and optionally animates the resulting spans. Re-creates on binding change, reverts
 * on unmount.
 *
 * With `ssrHidden: true`, the element is hidden on the server until its text is split and animated
 * on the client (text can only be split in the browser).
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

- On **mount**, the text is split. If `animation` is provided, it's applied to the resulting spans — for `lines`, the animation waits for `document.fonts.ready` first. It runs once the mount flush has finished, so the `onMounted` hooks of the surrounding components (including ones whose root is this element) still see the DOM as rendered. That's still before the browser paints.
- On **update**, if the binding value changed, the previous split is **reverted** and its animation **cancelled**, then the text is split and animated again from the new value.
- On **unmount**, the animation is cancelled and the split is reverted, restoring the original text content.
- During **SSR**, the text is rendered unsplit. With `ssrHidden: true`, the element also gets `visibility: hidden`, removed on the client right after the animation is created (after `document.fonts.ready` for `lines`), or right after the split when there's no `animation`.

::: tip
`animation` accepts the same parameters as `useAnimate` / `v-animate`, including `stagger()` for `delay` to sequence chars, words, or lines.
:::

::: warning
Only one of `chars`, `words`, or `lines` is used for the animation target when multiple are set — `lines` takes priority, then `chars`, then `words`.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-text-split.ts)
