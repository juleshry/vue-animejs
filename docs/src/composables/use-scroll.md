# useScroll

## Demo

<UseScrollDemo />

Wraps Anime.js [`onScroll()`](https://animejs.com/documentation/events/onscroll) into a Vue composable. The `ScrollObserver` is created reactively — it re-creates whenever the container, target, or options change — and is reverted automatically on unmount.

## Usage

### Scroll-linked animation

Pass `autoplayComputed` straight into `useTimeline` (or `useAnimate`/`useTimer`) to drive an animation's progress directly from scroll position, instead of playing it once.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useScroll, useTimeline } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")

const { autoplayComputed } = useScroll(container, target, {
  enter: "bottom top",
  leave: "top bottom",
  sync: true,
})

const { add } = useTimeline(autoplayComputed)

add(box, { translateX: 200, backgroundColor: "#9593ff", duration: 1000 })
</script>

<template>
  <div ref="container" class="scroll-container">
    <div ref="target" class="scroll-target" />
    <div ref="box" class="box" />
  </div>
</template>
```

::: warning
Pass `sync: true` (or leave it unset for the default eased sync) so the timeline's progress scrubs with scroll position. Without `sync`, the `ScrollObserver` only starts the linked animation once, on `enter`, instead of tying its progress to scroll.
:::

### Reactive options

Pass a `ref` or `computed` as the third argument to change `enter`/`leave`/`sync` reactively. The underlying `ScrollObserver` is reverted and recreated whenever it changes, alongside the container/target.

```vue
<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue"
import { useScroll, useTimeline } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")
const sync = ref(true)

const options = computed(() => ({ enter: "bottom top", leave: "top bottom", sync: sync.value }))

const { autoplayComputed } = useScroll(container, target, options)

const { add } = useTimeline(autoplayComputed)

add(box, { translateX: 200, duration: 1000 })
</script>

<template>
  <div ref="container" class="scroll-container">
    <div ref="target" class="scroll-target" />
    <div ref="box" class="box" />
  </div>
  <label><input v-model="sync" type="checkbox" /> Sync to scroll</label>
</template>
```

### With `useAnimate`

Read `autoplay` and set it on a bigger reactive options object alongside whatever else you're animating, the same way you'd merge any other piece of reactive state.

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { useAnimate, useScroll } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")

const { autoplay } = useScroll(container, target, {
  enter: "bottom top",
  leave: "top bottom",
  sync: true,
})

const options = computed(() => ({
  translateX: 200,
  backgroundColor: "#9593ff",
  duration: 1000,
  autoplay: autoplay.value,
}))

useAnimate(box, options)
</script>

<template>
  <div ref="container" class="scroll-container">
    <div ref="target" class="scroll-target" />
    <div ref="box" class="box" />
  </div>
</template>
```

### With `useRawAnimate`

`useRawAnimate` creates its animation immediately and unconditionally from inside your own `onMounted` — it isn't reactive, so read `.value` off `useScroll`'s `autoplay` at that point instead of passing `autoplayComputed`. `useScroll` itself still goes at the normal top level; only the `useRawAnimate` call needs to move into `onMounted`.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useRawAnimate, useScroll } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")

const { autoplay } = useScroll(container, target, {
  enter: "bottom top",
  leave: "top bottom",
  sync: true,
})

onMounted(() => {
  useRawAnimate(box.value!, {
    translateX: 200,
    backgroundColor: "#9593ff",
    duration: 1000,
    autoplay: autoplay.value,
  })
})
</script>

<template>
  <div ref="container" class="scroll-container">
    <div ref="target" class="scroll-target" />
    <div ref="box" class="box" />
  </div>
</template>
```

## Type Declarations

For all available options, see the [Anime.js onScroll documentation](https://animejs.com/documentation/events/onscroll).

::: details Show Type Declarations

```ts
export interface UseScrollReturn {
  /** The underlying Anime.js ScrollObserver. `undefined` until both container and target are available. */
  observer: ComputedRef<ScrollObserver | undefined>
  /** The observer, or `false` while it doesn't exist yet — plug straight into an `autoplay` option. */
  autoplay: ComputedRef<ScrollObserver | false>
  /** `{ autoplay }`, ready to pass straight as-is into `useTimeline`/`useTimer`/`useAnimate`'s options argument. */
  autoplayComputed: ComputedRef<{ autoplay: ScrollObserver | false }>
  /** Re-reads the container and target bounds. */
  refresh: () => ScrollObserver | undefined
  /** Cancels the observer and detaches its scroll listeners. */
  revert: () => ScrollObserver | undefined
  /** Renders the on-screen debug markers for the observer's thresholds. */
  debug: () => void
  /** Removes the on-screen debug markers. */
  removeDebug: () => ScrollObserver | undefined
  /** Links a tickable (animation, timer, timeline) or WAAPI animation to be driven by this observer. */
  link: (linked: Tickable | WAAPIAnimation) => ScrollObserver | undefined
}

/**
 * Wraps Anime.js `onScroll()` into a Vue composable. Reactively re-creates the ScrollObserver
 * when the container, target, or options change, and reverts it automatically on unmount.
 *
 * @param container - The scrollable container. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param target - The element whose scroll position is observed within `container`. Same accepted shapes as `container`.
 * @param options - Anime.js `ScrollObserverParams`, minus `container`/`target`. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useScroll(
  container: AnimationTargets,
  target: AnimationTargets,
  options?: MaybeRef<Omit<ScrollObserverParams, "container" | "target">>
): UseScrollReturn
```

:::

## Reactivity & Lifecycle Behavior

- Unlike other composables, `observer`/`autoplay`/`autoplayComputed` are **computed, not eagerly created on mount** — nothing is created until one of them is read. This keeps the resolved `ScrollObserver` identical across every reader within the same reactive tick (for example a consuming `useTimeline`'s own mount-time watch and `tryOnMounted`), instead of exposing a transient `undefined` that flips to the real observer a tick later and makes the consumer build twice.
- The observer is created the moment `container` and `target` both resolve to a real element. Reading `observer`/`autoplay`/`autoplayComputed` before then returns `undefined` / `false` / `{ autoplay: false }`.
- If `container`, `target`, or `options` changes, the previous observer is **reverted** before the new one is created.
- On component **unmount**, the last created observer is reverted automatically.
- Safe to call during SSR — the observer is never created server-side (`window`/`document` aren't touched), regardless of whether `observer`/`autoplay` is read.

::: tip
`autoplayComputed` exists so you don't have to write `computed(() => ({ autoplay: autoplay.value }))` yourself. If you need to combine it with other options, wrap it in your own `computed` instead: `computed(() => ({ ...autoplayComputed.value, loop: true }))`.
:::

::: warning
`observer` is a readonly computed ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-scroll.ts)
