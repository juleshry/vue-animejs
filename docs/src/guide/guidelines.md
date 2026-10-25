# Guidelines

## General

- All composables are prefixed with `use` and accept both plain values and Vue `Ref`s as arguments
- Directives are prefixed with `v-` and components with `Anime` (e.g. `v-animate`, `AnimeLayout`)
- Everything integrates with Vue's component lifecycle — animations are cleaned up automatically on unmount
- The library is tree-shakeable: only the composables, directives and components you import are included in your bundle

## Targets

DOM targets should always be declared with `useTemplateRef`:

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const el = useTemplateRef("el")

useAnimate(el, { translateX: 200 })
</script>

<template>
  <div ref="el" />
</template>
```

::: warning
Never use `ref<HTMLElement | null>(null)` as a target. The composables use [`unrefElement`](https://vueuse.org/core/unrefElement/) from `@vueuse/core` internally, which expects a `useTemplateRef`-style ref to correctly defer DOM access until after mount.
:::

CSS selectors and raw DOM elements are also valid targets:

```ts
useAnimate(".box", { translateX: 200 })
useAnimate(document.querySelector(".box"), { translateX: 200 })
```

::: warning
Avoid CSS selectors inside reusable components. If the component is rendered more than once, the selector matches all instances and triggers the animation on every matching element simultaneously. Use `useTemplateRef` instead to scope the animation to the component's own element. Page-level components rendered only once are not affected.
:::

## Reactive Options

Put a `ref` (or `computed`) straight into the options object of any composable, and it reacts when that ref changes:

```ts
const distance = ref(250)

useAnimate(el, { translateX: distance, duration: 600 })
```

The whole options object can also be a `ref`, a `computed` or a getter, and mutating a property of a reactive options object in place counts as a change too:

```ts
useAnimate(el, () => ({ translateX: distance.value * 2, duration: 600 }))
```

A ref inside the options may hold `null`, like a template ref before mount: the option then counts as unset, so `useDraggable(box, { container })` or `useScope({ root })` work with template refs as-is. Pass the template ref itself, not its `.value`. Where an option accepts an element, a ref to a component works too and resolves to the component's root element (`$el`), the same way targets do.

The exported `MaybeRefOptions<T>` type describes such an options object, if you wrap a composable in your own.

- **One level deep.** Only refs that are direct properties of the options object are unwrapped. A ref nested in a tween object (`translateX: { to: distance }`), a keyframe array or a draggable's `x: { snap }` is passed to Anime.js as-is: build those options in a getter or a `computed` instead.
- **Getters inside options aren't unwrapped.** A function-valued option already means something to Anime.js: a [function-based value](https://animejs.com/documentation/animation/tween-value-types/function-based) (`translateX: (el, i) => i * 50`), a callback, an `ease` or a `modifier`. So `translateX: () => distance.value` is a function-based value, read once per target when the animation is created, not a reactive getter. Use `translateX: distance`, or a getter for the whole object.
- **`useTimeline`'s `add` / `set` params** accept the same shapes, but they're read when the timeline is (re)built, not watched.

::: warning
Changing reactive options recreates the underlying Anime.js instance from scratch. The animation restarts from the element's current position with the new parameters.
:::

::: tip
A value that changes every frame, like the pointer position, doesn't belong in rebuilt options. Use [`useAnimatable`](/composables/use-animatable) and call its setters (`animatable.value.x(value)`) instead.
:::

## Lifecycle & Cleanup

Composables register their own cleanup via `onUnmounted` — you do not need to manually cancel or destroy animations:

```ts
// The animation is cancelled automatically when the component unmounts
const { play } = useAnimate(el, { translateX: 200 })
```

This applies to all composables.

## SSR

Every composable, directive and component is SSR-safe: you can use them during server-side rendering (Nuxt, `@vue/server-renderer`, `vite-ssr`) without `<ClientOnly>`. Nothing touches `window` or `document` on the server, and Anime.js instances are only created in the browser. During SSR, a composable's returned instance ref (`animation`, `timer`, `timeline`, etc.) stays `undefined` and control methods (`play`, `pause`, …) are no-ops:

```ts
// Safe to call at the top level of setup(), even on the server
const { animation, play } = useAnimate(".box", { translateX: 200 })
```

Composables with a DOM target create their instance once the component has mounted, so they never touch the server-rendered HTML before Vue has hydrated it. This also means a selector target can point into the component's own template:

```vue
<script setup lang="ts">
// "#box" doesn't exist yet when setup() runs: the animation is created once it has mounted
const { animation } = useAnimate("#box", { translateX: 200 })
</script>

<template>
  <div id="box" />
</template>
```

Directives don't run on the server at all, apart from rendering their [initial state](#initial-state-on-the-server).

::: warning
`useRawAnimate` is the one exception — it creates the Anime.js instance immediately and unconditionally, by design. Only call it from inside your own `onMounted`.
:::

::: tip
[`useScroll`](/composables/use-scroll) follows the same rule: its `ScrollObserver` is created on mount. Call it before the composable that consumes its `autoplay` (e.g. `useTimeline({ autoplay })`), so the observer already exists when that one builds on mount.
:::

### Initial state on the server

Since nothing animates on the server, the HTML it sends shows every element in its **final** state. Once the page hydrates, Anime.js jumps the element back to its "from" state and animates it in, so it briefly flashes fully visible first.

[`v-animate`](/directives/v-animate) and [`v-waapi`](/directives/v-waapi) avoid this on their own: they render the animation's "from" values as an inline style on the server, and remove it again just before the animation starts on the client.

```vue
<template>
  <!-- Server HTML: <div style="opacity:0;transform:translateY(20px);" data-anime-ssr="opacity,transform"> -->
  <div v-animate="{ opacity: [0, 1], translateY: [20, 0] }" />
</template>
```

Only values whose start is known without the browser are rendered:

- `prop: [from, to]` and `prop: { from }` (or `{ from, to }`)
- transforms (`translateX`, `x`, `rotate`, `scale`, …), with Anime.js's default units (`px`, `deg`) when you pass a number
- unitless properties (`opacity`, `zIndex`, `flexGrow`, `flexShrink`, `order`, `fontWeight`) and CSS variables
- other properties only with an explicit unit (`width: ["50%", "100%"]`, not `width: [50, 100]`)

Anything else is skipped and renders nothing extra: single target values, function values, `stagger()`, keyframes, relative values (`"+=20"`) and colors. If the element also has a `:style` for the same property, the "from" value wins on the server, and your value is put back before the animation starts.

[`v-svg-drawable`](/directives/v-svg-drawable) does the same for the stroke: the path is rendered in its starting draw state (the `from` of `draw`, or nothing drawn), so it doesn't show fully drawn first.

[`v-text-split`](/directives/v-text-split) can't do this, because text can only be split in the browser. Set `ssrHidden: true` to hide the element on the server until its text is split and animated. It's opt-in, since the text stays invisible until JavaScript runs. See [Server-side rendering](/directives/v-text-split#server-side-rendering) for why.

Composables don't own the element they animate, so they can't do this. Use CSS instead: give the element its "from" state in CSS, and only animate towards the target value.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLElement>("box")
useAnimate(box, { opacity: 1, translateY: 0 })
</script>

<template>
  <div ref="box" class="box" />
</template>

<style scoped>
.box {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

## Directives

Directives are declarative alternatives to their composable counterparts — they read the same option shapes but apply directly from a template attribute, with no `<script setup>` code required:

```vue
<script setup lang="ts">
import { vAnimate } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-animate="{ translateX: 200, duration: 800 }" />
</template>
```

- All directives are prefixed with `v-` and accept the same option shapes as their composable counterpart (e.g. `v-animate` mirrors `useAnimate`'s `AnimationParams`)
- The binding value creates the instance on mount, re-creates it whenever the value changes, and reverts it on unmount — there is no manual cleanup to write
- The instance is created once the mount flush has finished, after every `onMounted` hook of that flush and still before the browser paints. Your own `onMounted` (and tools that compare server and client HTML there, like @nuxt/hints) still sees the element as rendered, not already animated
- Bind a `ref` or `computed` instead of a plain object to react to state changes:

```vue
<script setup lang="ts">
import { computed, ref } from "vue"
import { vAnimate } from "@juleshry/vue-animejs"

const duration = ref(800)
const options = computed(() => ({ translateX: 200, duration: duration.value }))
</script>

<template>
  <div v-animate="options" />
</template>
```

::: warning
Changing the binding value recreates the underlying Anime.js instance from scratch, same as changing a composable's reactive options. The value is compared by content, so an inline object that re-renders with the same values doesn't restart anything. Functions with the same source (e.g. an inline `stagger(60)`) count as unchanged, so changing only a stagger's argument needs a `:key` on the element to take effect.
:::

Reach for a directive when the animation has no imperative control needs (no `play` / `pause` / `restart` from script) and the options can be expressed inline. Reach for the composable instead when you need to control playback, read animation state, or share the instance across multiple elements.

## Components

Components wrap a composable that needs an element of its own, like the container whose children [`useLayout`](/composables/use-layout) tracks. The component renders that element for you, so there's no template ref to wire up:

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue"
import { AnimeLayout } from "@juleshry/vue-animejs"

const grid = useTemplateRef("grid")
const items = ref([1, 2, 3, 4])

async function shuffle() {
  grid.value?.record()
  items.value = [...items.value].sort(() => Math.random() - 0.5)
  await nextTick()
  grid.value?.animate()
}
</script>

<template>
  <AnimeLayout ref="grid" as="ul" :options="{ duration: 600 }">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </AnimeLayout>
  <button @click="shuffle">Shuffle</button>
</template>
```

- The `as` prop picks the root: a tag name (default `div`) or one of your own components. A component must render a single root element with the default slot directly inside it
- `options` takes the same shapes as the composable's options. An inline object that re-renders with the same values doesn't recreate anything; changing a value does, like a composable's reactive options
- The composable's controls are exposed on the component: reach them through a template ref, as above. The default slot gets no props, since everything inside it is animated: keep buttons and other triggers outside
- The instance is created once the component has mounted and reverted on unmount, exactly like the composable it wraps

### Composable, directive or component?

| | Use it when |
|---|---|
| **Composable** | You need playback control or the animation state from script, or one instance shared across elements |
| **Directive** | The animation lives on one element and can be written inline, with no control from script |
| **Component** | The animation needs an element of its own (a container whose children are animated) and you'd rather not wire up a template ref |

## Returned Values

Each composable returns a plain object with reactive refs and control functions. Destructure only what you need:

```ts
const { play, pause, restart } = useAnimate(el, { translateX: 200 })
```

The `animation` property (where exposed) is a `DeepReadonly<ShallowRef<...>>`. Do not mutate it directly — use the returned control methods instead.

## TypeScript

The library is written in strict TypeScript and ships with full type declarations. All public API types are re-exported from the main entry point:

```ts
import type { MaybeRefOptions, UseAnimateReturn } from "@juleshry/vue-animejs"
```

Anime.js types (`AnimationParams`, `TargetSelector`, etc.) come from the `animejs` package itself. Option parameters wrap them as `MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>`, so you can type your own wrappers the same way:

```ts
import { toValue, type MaybeRefOrGetter } from "vue"
import type { AnimationParams } from "animejs"
import { useAnimate, type MaybeRefOptions } from "@juleshry/vue-animejs"

export function useSlideIn(el: HTMLElement, options: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>> = {}) {
  return useAnimate(el, () => ({ translateX: [-100, 0], ...toValue(options) }))
}
```