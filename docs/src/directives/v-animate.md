# v-animate

## Demo

<VAnimateDemo />

Applies an Anime.js [`animate()`](https://animejs.com/documentation/animation) directly from a template attribute. The animation is created on mount, re-created whenever the binding value changes, and reverted automatically on unmount.

## Usage

### Basic animation

```vue
<script setup lang="ts">
import { vAnimate } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-animate="{ translateX: 250, duration: 800, ease: 'inOutQuad' }" class="box" />
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
import { vAnimate } from "@juleshry/vue-animejs"

const distance = ref(100)

const options = computed(() => ({
  translateX: distance.value,
  duration: 600,
  ease: "outExpo",
}))

function increase() {
  distance.value += 50
}
</script>

<template>
  <div v-animate="options" class="box" />
  <button @click="increase">Increase distance</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js animation documentation](https://animejs.com/documentation/animation).

::: details Show Type Declarations

```ts
/**
 * Declarative animation directive. Applies an Anime.js animation to the element on mount (once the
 * mount flush has finished, so components' own `onMounted` hooks still see the rendered DOM),
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * During SSR, renders the animation's "from" state as an inline style (see `getInitialStyle`) so the
 * element doesn't flash its final state before hydration.
 *
 * @example
 * <div v-animate="{ translateX: 250, duration: 800 }" />
 * <div v-animate="reactiveOptions" />
 */
export declare const vAnimate: Directive<HTMLElement, AnimationParams>
```

:::

## Lifecycle Behavior

- On **mount**, the animation is created from the binding value. It runs once the mount flush has finished, so the `onMounted` hooks of the surrounding components (including ones whose root is this element) still see the DOM as rendered. That's still before the browser paints.
- On **update**, if the binding value changed, the previous animation is **cancelled** and **reverted**, then a new one is created from the new value.
- The binding value is compared by **content**, not by reference: an inline object (`v-animate="{ … }"`) that re-renders with the same values doesn't restart anything. Functions count as unchanged when their source is the same, so an inline `stagger(60)` doesn't restart on every render either, but changing only its argument isn't picked up. Add a `:key` to the element to force a fresh start in that case.
- On **unmount**, the animation is cancelled and reverted, cleaning up all Anime.js state on the element.
- During **SSR**, the animation's "from" values (`prop: [from, to]` or `prop: { from }`) are rendered as an inline style, so the element starts in its initial state instead of flashing its final one before hydration. That style is removed again before the animation is created on the client. See [SSR](/guide/guidelines#ssr) for which values are supported.

::: tip
Pass a `computed` when the options depend on other reactive state, so a new object is produced on every change and the directive picks it up.
:::

::: warning
Anime.js instances are tracked per-element internally. Don't apply `v-animate` to a component root that gets recycled by `v-for` with a non-stable `key` — use a stable `key` so Vue doesn't swap the underlying element unexpectedly.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-animate.ts)
