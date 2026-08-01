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
 * Declarative animation directive. Applies an Anime.js animation to the element on mount,
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-animate="{ translateX: 250, duration: 800 }" />
 * <div v-animate="reactiveOptions" />
 */
export declare const vAnimate: Directive<HTMLElement, AnimationParams>
```

:::

## Lifecycle Behavior

- On **mount**, the animation is created immediately from the binding value.
- On **update**, if the binding value changed, the previous animation is **cancelled** and **reverted**, then a new one is created from the new value.
- On **unmount**, the animation is cancelled and reverted, cleaning up all Anime.js state on the element.

::: tip
Pass a `computed` when the options depend on other reactive state, so a new object is produced on every change and the directive picks it up.
:::

::: warning
Anime.js instances are tracked per-element internally. Don't apply `v-animate` to a component root that gets recycled by `v-for` with a non-stable `key` — use a stable `key` so Vue doesn't swap the underlying element unexpectedly.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-animate.ts)
