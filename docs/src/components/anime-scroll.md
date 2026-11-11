# AnimeScroll

## Demo

<AnimeScrollDemo />

Wraps [`useScroll`](/composables/use-scroll) into a component: renders a root element that is the scroll container, and observes how an element inside it scrolls through it. The observed element is the first target of the animation the observer drives.

## Usage

### Scroll-linked animation

Put a template ref on `AnimeScroll`: it exposes the `useScroll` controls, with `observer` and `autoplay` unwrapped. Pass `autoplay` to an animation through a `computed`, so the animation is driven by the observer once it exists. `AnimeScroll` has no target of its own: Anime.js observes the first element of the animation it drives, here the box, as it scrolls through the component.

::: warning
The root has to scroll: give it a fixed height and `overflow: auto` (or `scroll`). Otherwise nothing scrolls inside it, and the animation never moves.
:::

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { AnimeScroll, useAnimate } from "@juleshry/vue-animejs"

const scroller = useTemplateRef("scroller")
const box = useTemplateRef<HTMLElement>("box")

useAnimate(box, {
  translateX: 200,
  ease: "linear",
  autoplay: computed(() => scroller.value?.autoplay ?? false),
})
</script>

<template>
  <AnimeScroll ref="scroller" class="scroller" :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }">
    <div class="spacer" />
    <div ref="box" class="box" />
    <div class="spacer" />
  </AnimeScroll>
</template>

<style scoped>
.scroller {
  height: 200px;
  overflow-y: auto;
}

.spacer {
  height: 220px;
}
</style>
```

::: tip
`AnimeScroll` mounts before its parent, so the observer already exists when the parent's `useAnimate` builds its animation: it's built once, already linked.
:::

### Reactive options

Bind `options` to reactive values. An inline object literal is fine, callbacks included: the observer is only re-created when its content changes, not on every re-render of the parent.

::: warning
Changing `options` reverts the current observer and creates a new one. An animation linked through `autoplay` is re-created with it.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeScroll } from "@juleshry/vue-animejs"

const sync = ref(true)
</script>

<template>
  <AnimeScroll class="scroller" :options="{ enter: 'bottom top', sync }">
    <!-- ... -->
  </AnimeScroll>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeScrollProps {
  /**
   * The root element, which is the scroll container: a tag name, or a component that renders a single root element with
   * the default slot directly inside it. Defaults to `"div"`. Give it a fixed height and `overflow: auto` (or `scroll`)
   * so it scrolls.
   */
  as?: string | Component
  /** Anime.js scroll observer parameters, without `container` / `target`. An inline object literal only re-creates the observer when its content changes. */
  options?: Omit<ScrollObserverParams, "container" | "target">
}

/** What a template ref on `AnimeScroll` exposes: the `useScroll` controls, with `observer` and `autoplay` unwrapped like any exposed ref. */
export type AnimeScrollExposed = ShallowUnwrapRef<Omit<UseScrollReturn, "autoplayComputed">>

declare const component: DefineSetupFnComponent<
  AnimeScrollProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeScrollProps & {},
  PublicProps
>

/**
 * Wraps `useScroll` into a component: renders a root element that is the scroll container, and observes how an element
 * inside it scrolls through it. The observed element is the first target of the animation the observer drives.
 *
 * The `useScroll` controls (`observer`, `autoplay`, `link`, `refresh`, `revert`, `debug`, `removeDebug`) are exposed on
 * the component instance, so an animation can be driven by the observer through a template ref (e.g.
 * `autoplay: computed(() => scroller.value?.autoplay ?? false)`). Refs are unwrapped like any exposed ref.
 */
export declare const AnimeScroll: {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeScrollExposed
} & typeof component
```

See [`useScroll`](/composables/use-scroll#type-declarations) for `UseScrollReturn`. The deprecated `autoplayComputed` isn't exposed.

:::

## Lifecycle Behavior

- The observer is created once the component has **mounted**, on its root element, so nothing runs during SSR and the server HTML is hydrated untouched.
- The observed element is set when an animation links to the observer (through `autoplay`): its first DOM target. With no linked animation, Anime.js observes the document body.
- If `options` changes content, or `as` changes the root element (a tag or a component), the current observer is **reverted** and a new one is created.
- On **unmount**, the observer is reverted automatically.
- All other attributes (`class`, `style`, listeners) fall through to the root element.

::: tip
`AnimeScroll` is a thin wrapper: use [`useScroll`](/composables/use-scroll) directly to observe the page scroll, or a target other than the animated element.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-scroll.ts)
