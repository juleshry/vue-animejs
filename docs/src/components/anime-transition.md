# AnimeTransition

## Demo

<AnimeTransitionDemo />

Wraps Vue's `<Transition>` so the enter and leave animations are played by Anime.js. The default slot takes a single element or component, toggled with `v-if` / `v-show` or swapped with a `key`, as with `<Transition>`.

## Usage

### Enter and leave

`enter` animates the element in, `leave` animates it out before Vue removes it. Give `enter` its starting values (`opacity: [0, 1]`), and `leave` the values to end on.

::: warning
Once an animation completes, the element gets back the inline styles it had before, and its CSS applies again. If `enter` ends on a value the element's CSS doesn't give it, it jumps to the CSS value on the last frame: `opacity: [0, 1]` on an `opacity-50` element ends at 1, then drops to 0.5. Give only the starting value instead, `opacity: { from: 0 }`, and the element animates to its own style.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeTransition } from "@juleshry/vue-animejs"

const show = ref(true)
</script>

<template>
  <button @click="show = !show">Toggle</button>
  <AnimeTransition
    :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 500, ease: 'outExpo' }"
    :leave="{ opacity: 0, translateY: -20, duration: 250 }"
  >
    <div v-if="show" class="box" />
  </AnimeTransition>
</template>
```

Without `enter` or `leave`, that side happens instantly. If the element starts leaving while it's still entering, the enter animation stops where it is and the leave animation takes over from there.

### Swapping elements

Change the `key` to swap one element for another. `mode="out-in"` waits for the old one to leave before the new one enters.

```vue
<template>
  <AnimeTransition mode="out-in" :enter="{ opacity: [0, 1], duration: 300 }" :leave="{ opacity: 0, duration: 200 }">
    <p :key="message">{{ message }}</p>
  </AnimeTransition>
</template>
```

### Animating on page load

`appear` plays `enter` on the initial render too.

```vue
<template>
  <AnimeTransition appear :enter="{ opacity: [0, 1], translateY: [20, 0] }">
    <h1>Hello</h1>
  </AnimeTransition>
</template>
```

With SSR (Nuxt), this works on a server-rendered page as well, which Vue's own `<Transition appear>` doesn't do: the server renders `enter`'s starting values, so the element doesn't show its final state before hydration, and the animation starts once the page has hydrated. Only static starting values are rendered on the server, the same ones as [`v-animate`](/guide/guidelines#initial-state-on-the-server).

::: warning
On a server-rendered page load, the hydrated element animates in but `@before-appear` / `@after-appear` (or `@before-enter` / `@after-enter`) aren't called: Vue's `<Transition>` doesn't run hooks on hydrated elements. They are called on client-side mounts and for every later enter and leave.
:::

### Transition events

Other `<Transition>` listeners fall through to it, so `@after-enter`, `@after-leave` and the rest work as usual. An `onComplete` in `enter` or `leave` is called too.

```vue
<template>
  <AnimeTransition :enter="{ opacity: [0, 1] }" @after-enter="focusInput">
    <input v-if="editing" ref="input" />
  </AnimeTransition>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeTransitionProps {
  /** Anime.js animation parameters for the entering element, e.g. `{ opacity: [0, 1], translateY: [20, 0] }`. Without it, the element enters instantly. */
  enter?: AnimationParams
  /** Anime.js animation parameters for the leaving element, e.g. `{ opacity: 0 }`. Without it, the element leaves instantly. */
  leave?: AnimationParams
  /** Plays `enter` on the initial render too, including after hydration: the server renders `enter`'s starting values, so the element doesn't flash its final state first. */
  appear?: boolean
  /** `<Transition>`'s sequencing mode: `"out-in"` waits for the leave to finish before the enter starts, `"in-out"` the reverse. */
  mode?: BaseTransitionProps["mode"]
}

/**
 * Wraps Vue's `<Transition>` so the enter and leave animations are played by Anime.js. The default slot takes a single
 * element or component, toggled with `v-if` / `v-show` or swapped with a `key`, as with `<Transition>`.
 *
 * Other `<Transition>` listeners (`@after-enter`, `@after-leave`, ...) fall through to it.
 */
export declare const AnimeTransition: DefineSetupFnComponent<
  AnimeTransitionProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeTransitionProps & {},
  PublicProps
>
```

:::

## Lifecycle Behavior

- Each enter or leave creates an Anime.js animation on the element; the transition finishes when it completes. CSS transitions are turned off (`css: false`), so only Anime.js animates.
- An enter interrupted by a leave (or the reverse) is cancelled where it is, and the new animation starts from there.
- Once an enter or leave completes, the inline styles it wrote are removed and the element's own inline styles are put back, so its classes and `:style` apply again. A cancelled animation leaves its values in place, for the next one to start from.
- `enter` and `leave` are read when the transition starts, so changing them affects the next enter or leave, not the running one.
- On **unmount**, a running animation is cancelled.

::: tip
For a list of elements entering and leaving, use [`AnimeTransitionGroup`](/components/anime-transition-group). To animate elements moving to a new position (a reordered list), use [`AnimeLayout`](/components/anime-layout).
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-transition.ts)
