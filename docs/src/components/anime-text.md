# AnimeText

## Demo

<AnimeTextDemo />

Wraps [`useText`](/composables/use-text) into a component: renders a root element and splits the text of its default slot into lines, words and/or characters. When the slot content changes, the root is rendered anew and its text split again.

## Usage

### Animating the split characters

Put a template ref on `AnimeText`: it exposes the `useText` controls, with `lines`, `words` and `chars` unwrapped to plain arrays. Pass a getter reading them to [`useAnimate`](/composables/use-animate): every new split gives new arrays, so the animation is re-created on the new elements.

```vue
<script setup lang="ts">
import { stagger } from "animejs"
import { useTemplateRef } from "vue"
import { AnimeText, useAnimate } from "@juleshry/vue-animejs"

const text = useTemplateRef("text")

const { restart } = useAnimate(() => text.value?.chars, {
  translateY: [-24, 0],
  opacity: [0, 1],
  delay: stagger(40),
  ease: "outExpo",
})
</script>

<template>
  <AnimeText ref="text" as="h1" :options="{ chars: true }">Hello, vue-animejs!</AnimeText>
  <button @click="restart">Restart</button>
</template>
```

::: tip
`AnimeText` mounts before its parent, so the text is already split when the parent's `useAnimate` builds its animation.
:::

### Reactive content

The slot can render reactive text. Anime.js replaces the root's content when it splits it, so Vue can't patch the old nodes anymore. When the slot renders different content, `AnimeText` renders a new root element instead, and the text is split again. A re-render with the same content (e.g. a `class` change) keeps the root and its split.

::: warning
Keep the slot to text and plain inline elements (`<strong>`, `<em>`, `<a>`…). Anime.js replaces the nodes Vue rendered with copies, so components, directives, listeners and template refs inside the slot are no longer connected to what's on the page once the text is split.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeText } from "@juleshry/vue-animejs"

const name = ref("world")
</script>

<template>
  <input v-model="name" />
  <AnimeText as="p" :options="{ words: true }">Hello, <strong>{{ name }}</strong>!</AnimeText>
</template>
```

### Reactive options

Bind `options` to reactive values. An inline object literal is fine: the text is only split again when its content changes, not on every re-render of the parent.

::: warning
Changing `options` reverts the current split and splits the text again. Any running animation on the old spans is lost.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeText } from "@juleshry/vue-animejs"

const split_by = ref<"chars" | "words">("chars")
</script>

<template>
  <AnimeText :options="{ [split_by]: true }">Reactive split type.</AnimeText>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeTextProps {
  /**
   * The root element, whose text is split: a tag name, or a component that renders a single root element with the
   * default slot directly inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js text-splitter parameters. An inline object literal only re-splits the text when its content changes. */
  options?: TextSplitterParams
}

/** What a template ref on `AnimeText` exposes: the `useText` controls, with `splitter`, `lines`, `words` and `chars` unwrapped like any exposed ref. */
export type AnimeTextExposed = ShallowUnwrapRef<UseTextReturn>

declare const component: DefineSetupFnComponent<
  AnimeTextProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeTextProps & {},
  PublicProps
>

/**
 * Wraps `useText` into a component: renders a root element and splits the text of its default slot into lines, words
 * and/or characters. When the slot content changes, the root is rendered anew and its text split again.
 *
 * The `useText` controls (`splitter`, `lines`, `words`, `chars`, `revert`, `refresh`) are exposed on the component
 * instance, to animate the split elements through a template ref. Refs are unwrapped like any exposed ref.
 */
export declare const AnimeText: {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeTextExposed
} & typeof component
```

See [`useText`](/composables/use-text#type-declarations) for `UseTextReturn`.

:::

## Lifecycle Behavior

- The text is split once the component has **mounted**, so nothing runs during SSR and the server HTML is hydrated untouched. The server renders the unsplit text.
- If the slot renders **different content**, a new root element replaces the old one and its text is split again. The exposed `lines`, `words` and `chars` then hold the new spans.
- If `options` changes content, or `as` changes the root element (a tag or a component), the current split is **reverted** and the text is split again.
- On **unmount**, the split is reverted automatically.
- All other attributes (`class`, `style`, listeners) fall through to the root element.

::: tip
For text that never changes, the [`v-text-split`](/directives/v-text-split) directive splits and animates it in one binding, and can hide it on the server until it's split.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-text.ts)
