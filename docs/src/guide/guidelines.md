# Guidelines

## General

- All composables are prefixed with `use` and accept both plain values and Vue `Ref`s as arguments
- Composables integrate with Vue's component lifecycle — animations are cleaned up automatically on unmount
- The library is tree-shakeable: only the composables you import are included in your bundle

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

All composables accept a `Ref` or `computed` as their options argument. When the options change, the composable reacts automatically:

```ts
const options = computed(() => ({
  translateX: distance.value,
  duration: 600,
}))

useAnimate(el, options)
```

::: warning
Changing reactive options recreates the underlying Anime.js instance from scratch. The animation restarts from the element's current position with the new parameters.
:::

## Lifecycle & Cleanup

Composables register their own cleanup via `onUnmounted` — you do not need to manually cancel or destroy animations:

```ts
// The animation is cancelled automatically when the component unmounts
const { play } = useAnimate(el, { translateX: 200 })
```

This applies to all composables.

## SSR

Every composable and directive is SSR-safe: you can use them during server-side rendering (Nuxt, `@vue/server-renderer`, `vite-ssr`) without `<ClientOnly>`. Nothing touches `window` or `document` on the server, and Anime.js instances are only created in the browser. During SSR, a composable's returned instance ref (`animation`, `timer`, `timeline`, etc.) stays `undefined` and control methods (`play`, `pause`, …) are no-ops:

```ts
// Safe to call at the top level of setup(), even on the server
const { animation, play } = useAnimate(".box", { translateX: 200 })
```

Directives don't run on the server at all, apart from rendering their [initial state](#initial-state-on-the-server).

::: warning
`useRawAnimate` is the one exception — it creates the Anime.js instance immediately and unconditionally, by design. Only call it from inside your own `onMounted`.
:::

::: tip
[`useScroll`](/composables/use-scroll) is lazy rather than mount-gated — its `observer`/`autoplay`/`autoplayComputed` are computed and only create the underlying `ScrollObserver` the first time one of them is read, not automatically on mount. It's still SSR-safe (nothing is created server-side even if read), it just doesn't follow the "exists after mount" rule the other composables do.
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
Changing the binding value recreates the underlying Anime.js instance from scratch, same as changing a composable's reactive options.
:::

Reach for a directive when the animation has no imperative control needs (no `play` / `pause` / `restart` from script) and the options can be expressed inline. Reach for the composable instead when you need to control playback, read animation state, or share the instance across multiple elements.

## Returned Values

Each composable returns a plain object with reactive refs and control functions. Destructure only what you need:

```ts
const { play, pause, restart } = useAnimate(el, { translateX: 200 })
```

The `animation` property (where exposed) is a `DeepReadonly<ShallowRef<...>>`. Do not mutate it directly — use the returned control methods instead.

## TypeScript

The library is written in strict TypeScript and ships with full type declarations. All public API types are re-exported from the main entry point:

```ts
import type { UseAnimateReturn } from "@juleshry/vue-animejs"
```

Anime.js types (`AnimationParams`, `TargetSelector`, etc.) come from the `animejs` package itself and are passed through without wrapping.