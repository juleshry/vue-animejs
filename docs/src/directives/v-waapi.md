# v-waapi

## Demo

<VWaapiDemo />

Applies an Anime.js [`waapi.animate()`](https://animejs.com/documentation/web-animations-api) directly from a template attribute. The animation is driven by the browser's native [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), created on mount, re-created whenever the binding value changes, and reverted automatically on unmount.

## Usage

### Basic animation

::: warning
`v-waapi` accepts native CSS property names and values (e.g. `translate: "220px"`, `opacity: 0`) — not Anime.js shorthand transforms like `translateX`.
:::

```vue
<script setup lang="ts">
import { vWaapi } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-waapi="{ translate: '250px', duration: 800, ease: 'ease-in-out' }" class="box" />
</template>
```

### Reactive options

Bind a `ref` or `computed` — the animation is cancelled and re-created whenever the value changes.

::: warning
Changing options recreates the animation from scratch with the new parameters.
:::

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { vWaapi } from "@juleshry/vue-animejs"

const distance = ref(100)

const options = computed(() => ({
  translate: `${distance.value}px`,
  duration: 600,
  ease: "ease-out",
}))

function increase() {
  distance.value += 50
}
</script>

<template>
  <div v-waapi="options" class="box" />
  <button @click="increase">Increase distance</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js WAAPI documentation](https://animejs.com/documentation/web-animations-api).

::: details Show Type Declarations

```ts
/**
 * Declarative WAAPI animation directive. Applies an Anime.js WAAPI animation to the element on
 * mount (once the mount flush has finished, so components' own `onMounted` hooks still see the
 * rendered DOM), re-creates it when the binding value changes, and reverts it on unmount.
 *
 * During SSR, renders the animation's "from" state as an inline style (see `getInitialStyle`) so the
 * element doesn't flash its final state before hydration.
 *
 * @example
 * <div v-waapi="{ translateX: 250, duration: 800 }" />
 * <div v-waapi="reactiveOptions" />
 */
export declare const vWaapi: Directive<HTMLElement, WAAPIAnimationParams>
```

:::

## Lifecycle Behavior

- On **mount**, the animation is created from the binding value, and the element's original inline style is captured. It runs once the mount flush has finished, so the `onMounted` hooks of the surrounding components (including ones whose root is this element) still see the DOM as rendered. That's still before the browser paints.
- On **update**, if the binding value changed, the previous animation is **cancelled** and the element's original style is restored, then a new animation is created from the new value.
- The binding value is compared by **content**, not by reference: an inline object (`v-waapi="{ … }"`) that re-renders with the same values doesn't restart anything. Functions count as unchanged when their source is the same, so an inline `stagger(60)` doesn't restart on every render either, but changing only its argument isn't picked up. Add a `:key` to the element to force a fresh start in that case.
- On **unmount**, the animation is cancelled and the element's original inline style is restored.
- During **SSR**, the animation's "from" values (`prop: [from, to]` or `prop: { from }`) are rendered as an inline style, so the element starts in its initial state instead of flashing its final one before hydration. That style is removed again before the animation is created on the client. See [SSR](/guide/guidelines#ssr) for which values are supported.

::: tip
Pass a `computed` when the options depend on other reactive state, so a new object is produced on every change and the directive picks it up.
:::

::: warning
`v-waapi` uses native CSS property names. Use `translate: "220px"` instead of `translateX: 220`, and `rotate: "360deg"` instead of `rotate: 360`.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-waapi.ts)
