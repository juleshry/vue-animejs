# AnimeScroll

## Demo

<AnimeScrollDemo />

Wraps [`useScroll`](/composables/use-scroll) into a component: renders a root element and observes its scroll position within `container`.

## Usage

### Scroll-linked animation

Put a template ref on `AnimeScroll`: it exposes the `useScroll` controls, with `observer` and `autoplay` unwrapped. Pass `autoplay` to an animation through a `computed`, so the animation is driven by the observer once it exists. Without `container`, the page itself is the scroll container.

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { AnimeScroll, useAnimate } from "@juleshry/vue-animejs"

const scroll = useTemplateRef("scroll")
const box = useTemplateRef<HTMLElement>("box")

useAnimate(box, {
  translateX: 200,
  ease: "linear",
  autoplay: computed(() => scroll.value?.autoplay ?? false),
})
</script>

<template>
  <AnimeScroll ref="scroll" as="section" :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }">
    <div ref="box" class="box" />
  </AnimeScroll>
</template>
```

::: tip
`AnimeScroll` mounts before its parent, so the observer already exists when the parent's `useAnimate` builds its animation: it's built once, already linked.
:::

### Scrollable container

Pass a CSS selector or an element as `container`. A template ref works too: before the element mounts, the template passes `null`, and `AnimeScroll` waits for it instead of observing the page.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { AnimeScroll } from "@juleshry/vue-animejs"

const scroller = useTemplateRef<HTMLElement>("scroller")
</script>

<template>
  <div ref="scroller" class="scroller">
    <AnimeScroll :container="scroller" :options="{ onEnter: () => console.log('in view') }">
      <!-- ... -->
    </AnimeScroll>
  </div>
</template>
```

### Reactive options

Bind `options` to reactive values. An inline object literal is fine, callbacks included: the observer is only re-created when its content changes, not on every re-render of the parent.

::: warning
Changing `options` or `container` reverts the current observer and creates a new one. An animation linked through `autoplay` is re-created with it.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeScroll } from "@juleshry/vue-animejs"

const sync = ref(true)
</script>

<template>
  <AnimeScroll :options="{ enter: 'bottom top', sync }">
    <!-- ... -->
  </AnimeScroll>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeScrollProps {
  /**
   * The root element, whose scroll position is observed: a tag name, or a component that renders a single root element
   * with the default slot directly inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /**
   * The scrollable container: a CSS selector or an element. Defaults to the document body. `null` (e.g. a template ref
   * not mounted yet) waits for the element instead of falling back to the body.
   */
  container?: string | HTMLElement | null
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
 * Wraps `useScroll` into a component: renders a root element and observes its scroll position within `container`.
 *
 * The `useScroll` controls (`observer`, `autoplay`, `link`, `refresh`, `revert`, `debug`, `removeDebug`) are exposed on
 * the component instance, so an animation can be driven by the observer through a template ref (e.g.
 * `autoplay: computed(() => scroll.value?.autoplay ?? false)`). Refs are unwrapped like any exposed ref.
 */
export declare const AnimeScroll: {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeScrollExposed
} & typeof component
```

See [`useScroll`](/composables/use-scroll#type-declarations) for `UseScrollReturn`. The deprecated `autoplayComputed` isn't exposed.

:::

## Lifecycle Behavior

- The observer is created once the component has **mounted** and `container` has resolved, so nothing runs during SSR and the server HTML is hydrated untouched.
- If `options` changes content, `container` changes, or `as` changes the root element (a tag or a component), the current observer is **reverted** and a new one is created.
- On **unmount**, the observer is reverted automatically.
- All other attributes (`class`, `style`, listeners) fall through to the root element.

::: tip
`AnimeScroll` is a thin wrapper: use [`useScroll`](/composables/use-scroll) directly when the observed element is already in your own template.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-scroll.ts)
