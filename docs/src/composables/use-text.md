# useText

## Demo

<UseTextDemo />

Wraps Anime.js [`splitText()`](https://animejs.com/documentation/split-text) into a Vue composable. Reactively re-splits the text when the target or params change, and reverts the DOM automatically on unmount.

## Usage

### Basic text splitting

```vue
<script setup lang="ts">
import { type Target } from "animejs"
import { useTemplateRef } from "vue"
import { useAnimate, useText } from "@juleshry/vue-animejs"

const text_el = useTemplateRef<HTMLParagraphElement>("textEl")
const { chars } = useText(text_el, { chars: true })

const { play, restart } = useAnimate(chars, {
  translateY: [-24, 0],
  opacity: [0, 1],
  duration: 700,
  delay: (_: Target, i: number) => i * 50,
  easing: "easeOutExpo",
})
</script>

<template>
  <p ref="textEl">Hello, vue-animejs!</p>
  <button @click="play">Play</button>
  <button @click="restart">Restart</button>
</template>
```

### Animating words

Use `words` instead of `chars` to animate word by word.

```vue
<script setup lang="ts">
import { type Target } from "animejs"
import { useTemplateRef } from "vue"
import { useAnimate, useText } from "@juleshry/vue-animejs"

const text_el = useTemplateRef<HTMLParagraphElement>("textEl")
const { words } = useText(text_el, { words: true })

const { play } = useAnimate(words, {
  opacity: [0, 1],
  translateX: [-16, 0],
  duration: 500,
  delay: (_: Target, i: number) => i * 80,
  easing: "easeOutCubic",
})
</script>

<template>
  <p ref="textEl">Split by word, not character.</p>
  <button @click="play">Play</button>
</template>
```

### Reactive params

Pass a `ref` or `computed` as the second argument.

::: warning
Changing `params` reverts the current split and re-runs `splitText()` with the new options. Any in-progress animation on the old spans will be lost.
:::

```vue
<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue"
import { useText } from "@juleshry/vue-animejs"

const text_el = useTemplateRef<HTMLParagraphElement>("textEl")
const splitBy = ref<"chars" | "words">("chars")

const params = computed(() => ({ [splitBy.value]: true }))
const { chars, words } = useText(text_el, params)
</script>

<template>
  <p ref="textEl">Reactive split type.</p>
  <label>
    <input v-model="splitBy" type="radio" value="chars" /> Chars
  </label>
  <label>
    <input v-model="splitBy" type="radio" value="words" /> Words
  </label>
  <p>Spans: {{ splitBy === "chars" ? chars.length : words.length }}</p>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseTextReturn {
  /** The underlying Anime.js `TextSplitter` instance. `undefined` until the target is available. */
  splitter: DeepReadonly<ShallowRef<TextSplitter | undefined>>
  /** Reactive array of `<span>` elements representing each line after splitting. */
  lines: ComputedRef<HTMLElement[]>
  /** Reactive array of `<span>` elements representing each word after splitting. */
  words: ComputedRef<HTMLElement[]>
  /** Reactive array of `<span>` elements representing each character after splitting. */
  chars: ComputedRef<HTMLElement[]>
  /** Removes all split `<span>` wrappers and restores the original text content. */
  revert: () => void
  /** Re-splits the text, updating `lines`, `words`, and `chars` to reflect any DOM or size changes. */
  refresh: () => void
}

/**
 * Wraps Anime.js `splitText()` into a Vue composable. Reactively re-splits the text when the target or params change, and reverts the DOM automatically on unmount.
 *
 * @param _target - The element(s) whose text content should be split. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param _params - Anime.js text-splitter parameters. Accepts a plain object or a reactive ref / computed.
 */
export declare function useText(
  _target: MaybeRef<HTMLElement | NodeList | string | HTMLElement[]> | MaybeComputedElementRef,
  _params?: MaybeRef<TextSplitterParams>
): UseTextReturn
```

:::

## Reactivity & Lifecycle

- `lines`, `words`, and `chars` are `ComputedRef<HTMLElement[]>` — they update automatically whenever the splitter re-runs.
- If `_target` or `_params` changes, the DOM is reverted and `splitText()` is called again.
- On component **unmount**, the watcher is stopped and the DOM is reverted automatically.

::: tip
Pass `chars` or `words` directly as the target to `useAnimate` — it accepts `ComputedRef<HTMLElement[]>` and will re-create the animation whenever the split updates.
:::

::: warning
`splitter` is a readonly shallow ref. Do not mutate the Anime.js `TextSplitter` instance directly — use `revert()` and `refresh()` instead.
:::

## Source

[`use-text.ts`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-text.ts)
