# useScroll

## Demo

<UseScrollDemo />

Wraps Anime.js [`onScroll()`](https://animejs.com/documentation/events/onscroll) into a Vue composable. The `ScrollObserver` is created reactively — it re-creates whenever the container, target, or options change — and is reverted automatically on unmount.

## Usage

### Scroll-linked animation

Pass `autoplay` as the `autoplay` option of `useTimeline` (or `useAnimate`/`useTimer`) to drive an animation's progress directly from scroll position, instead of playing it once.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useScroll, useTimeline } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")

const { autoplay } = useScroll(container, target, {
  enter: "bottom top",
  leave: "top bottom",
  sync: true,
})

const { add } = useTimeline({ autoplay })

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

Put a `ref` straight into the options object to change `enter`/`leave`/`sync` reactively. The whole options object can also be a `ref`, a `computed` or a getter. The underlying `ScrollObserver` is reverted and recreated whenever the options change, alongside the container/target.

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { useScroll, useTimeline } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")
const sync = ref(true)

const { autoplay } = useScroll(container, target, { enter: "bottom top", leave: "top bottom", sync })

const { add } = useTimeline({ autoplay })

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

`autoplay` is a `computed`, so it goes straight into the options object alongside whatever else you're animating.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useAnimate, useScroll } from "@juleshry/vue-animejs"

const container = useTemplateRef<HTMLDivElement>("container")
const target = useTemplateRef<HTMLDivElement>("target")
const box = useTemplateRef<HTMLDivElement>("box")

const { autoplay } = useScroll(container, target, {
  enter: "bottom top",
  leave: "top bottom",
  sync: true,
})

useAnimate(box, {
  translateX: 200,
  backgroundColor: "#9593ff",
  duration: 1000,
  autoplay,
})
</script>

<template>
  <div ref="container" class="scroll-container">
    <div ref="target" class="scroll-target" />
    <div ref="box" class="box" />
  </div>
</template>
```

### With `useRawAnimate`

`useRawAnimate` creates its animation immediately and unconditionally from inside your own `onMounted` — it isn't reactive, so `autoplay` is read once, at that point. Since `useScroll` registered its mount hook first, the observer already exists by then. `useScroll` itself still goes at the normal top level; only the `useRawAnimate` call needs to move into `onMounted`.

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
    autoplay,
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
  /** The underlying Anime.js ScrollObserver. `undefined` until mounted with both container and target available. */
  observer: ComputedRef<ScrollObserver | undefined>
  /** The observer, or `false` while it doesn't exist yet — plug straight into an `autoplay` option: `useTimeline({ autoplay })`. */
  autoplay: ComputedRef<ScrollObserver | false>
  /**
   * `{ autoplay }`, ready to pass straight as-is into `useTimeline`/`useTimer`/`useAnimate`'s options argument.
   *
   * @deprecated Options accept refs as direct properties: pass `{ autoplay }` instead. Will be removed in the next major.
   */
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
 * Wraps Anime.js `onScroll()` into a Vue composable. Creates the ScrollObserver on mount, reactively re-creates it
 * when the container, target, or options change, and reverts it automatically on unmount.
 *
 * Call it before the composable that consumes `autoplay` (e.g. `useTimeline`): its mount hook
 * then runs first, so the consumer is built once, with the observer already in place.
 *
 * @param container - The scrollable container. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param target - The element whose scroll position is observed within `container`. Same accepted shapes as `container`.
 * @param options - Anime.js `ScrollObserverParams`, minus `container`/`target`. Accepts a plain object, a ref / computed / getter, and refs as direct properties. Defaults to `{}`.
 */
export declare function useScroll(
  container: AnimationTargets,
  target: AnimationTargets,
  options?: MaybeRefOrGetter<MaybeRefOptions<Omit<ScrollObserverParams, "container" | "target">>>
): UseScrollReturn
```

:::

## Reactivity & Lifecycle Behavior

- The observer is created once the component has **mounted**, like every other composable with a DOM target, so a selector can point into the component's own template and server-rendered HTML is never touched before hydration. Until then, `observer`/`autoplay` are `undefined` / `false`.
- A template ref that is still empty at mount (e.g. behind a `v-if`) creates the observer as soon as both `container` and `target` resolve.
- Call `useScroll` **before** the composable that consumes `autoplay` (e.g. `useTimeline`). Mount hooks run in registration order, so the observer exists by the time the consumer builds, and it's built once, with the observer already in place.
- If `container`, `target`, or `options` changes, the previous observer is **reverted** before the new one is created.
- On component **unmount**, the watcher is stopped and the observer is reverted automatically.
- Safe to call during SSR — the observer is never created server-side (`window`/`document` aren't touched).

::: warning
`autoplayComputed` is deprecated: options accept refs as direct properties, so `useTimeline({ autoplay, loop: true })` replaces both `useTimeline(autoplayComputed)` and `computed(() => ({ ...autoplayComputed.value, loop: true }))`. It will be removed in the next major.
:::

::: warning
`observer` is a readonly computed ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-scroll.ts)
