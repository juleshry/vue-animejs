# AnimeTransitionGroup

## Demo

<AnimeTransitionGroupDemo />

Wraps Vue's `<TransitionGroup>` so the enter and leave animations of each child are played by Anime.js. Children need a `key`, as with `<TransitionGroup>`; elements entering or leaving together can be staggered with `stagger`.

## Usage

### Animating a list

Each child that enters plays `enter`, each child that leaves plays `leave` before Vue removes it. `tag` is the element rendered around the children.

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeTransitionGroup } from "@juleshry/vue-animejs"

const todos = ref(["Write docs", "Ship it"])
</script>

<template>
  <AnimeTransitionGroup
    tag="ul"
    :enter="{ opacity: [0, 1], translateX: [-20, 0], duration: 400 }"
    :leave="{ opacity: 0, translateX: 20, duration: 250 }"
  >
    <li v-for="todo in todos" :key="todo">{{ todo }}</li>
  </AnimeTransitionGroup>
</template>
```

### Staggering

`stagger` delays each element that enters (or leaves) at the same time as others by its order among them, in ms. Adding three items at once with `:stagger="80"` starts them 0, 80 and 160ms apart; the next batch starts from 0 again. The offset is added to `enter.delay` / `leave.delay`.

```vue
<template>
  <AnimeTransitionGroup
    tag="ul"
    appear
    :stagger="80"
    :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 500 }"
  >
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </AnimeTransitionGroup>
</template>
```

::: warning
Use `stagger`, not Anime.js's `stagger()` in `delay`: Vue calls the enter hook once per element, so each animation has a single target and `stagger()` gives every element the same delay. `stagger` is added to a number or function `delay`; a `delay` in any other form is used as it is.
:::

### Moves

When a child enters or leaves, the others slide to their new place instead of jumping. A leaving child is taken out of the layout as soon as its leave starts (frozen with `position: absolute` where it is), so the ones after it move right away rather than once it's gone; a `v-show` child is put back into the layout once it's hidden. `move` sets the timing of that slide; `:move="false"` turns it off.

```vue
<template>
  <AnimeTransitionGroup
    tag="ul"
    class="list"
    :enter="{ opacity: [0, 1], duration: 300 }"
    :leave="{ opacity: 0, duration: 300 }"
    :move="{ duration: 500, ease: 'outExpo' }"
  >
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </AnimeTransitionGroup>
</template>

<style scoped>
.list {
  position: relative;
}
</style>
```

::: tip
Give the element around the children `position: relative` (the `tag` element above). A leaving child is positioned against its closest positioned ancestor (or the page, without one), so this keeps it with the list if the content above the list changes size during the leave.
:::

::: warning
A leaving child gets inline `position`, `left`, `top`, `width`, `height`, `margin` and `box-sizing` for the duration of its leave. A `leave` that animates `width` or `height` therefore starts from the frozen size. Moves write an inline `translate` (the CSS property, separate from `transform`) while they run, and put the element's own value back when they end.
:::

### Animating on page load

`appear` plays `enter` on every initial child too, staggered like any other batch. With SSR (Nuxt), it also works on a server-rendered page, which Vue's own `<TransitionGroup appear>` doesn't do: the server renders `enter`'s starting values on each child, and the animations start once the page has hydrated. See [`AnimeTransition`](/components/anime-transition#animating-on-page-load) for the details, which are the same.

::: warning
On a server-rendered page load, the hydrated children animate in but `@before-appear` / `@after-appear` (or `@before-enter` / `@after-enter`) aren't called: Vue's `<TransitionGroup>` doesn't run hooks on hydrated elements.
:::

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeTransitionGroupProps {
  /** The element rendered around the children, e.g. `"ul"`. Without it, the children are rendered without a wrapper, as with `<TransitionGroup>`. */
  tag?: string
  /** Anime.js animation parameters for each entering element, e.g. `{ opacity: [0, 1], translateY: [20, 0] }`. Without it, elements enter instantly. */
  enter?: AnimationParams
  /** Anime.js animation parameters for each leaving element, e.g. `{ opacity: 0 }`. Without it, elements leave instantly. */
  leave?: AnimationParams
  /** Plays `enter` on the initial render too, including after hydration: the server renders `enter`'s starting values, so the elements don't flash their final state first. */
  appear?: boolean
  /** Delay (ms) between elements that enter, or leave, at the same time, added to their `delay`. Defaults to `0`. */
  stagger?: number
  /**
   * Timing of the animation that moves the other children to their new place when one enters or leaves (`duration`,
   * `ease`, ...), or `false` to let them jump. Defaults to `{ duration: 400 }`.
   */
  move?: AnimationParams | false
}

/**
 * Wraps Vue's `<TransitionGroup>` so the enter and leave animations of each child are played by Anime.js. Children
 * need a `key`, as with `<TransitionGroup>`; elements entering or leaving together can be staggered with `stagger`.
 *
 * The other children move to their new place instead of jumping: a leaving child is taken out of the layout (frozen
 * with `position: absolute` where it is) and the rest animate there with `move`. Other `<TransitionGroup>` listeners
 * (`@after-enter`, `@after-leave`, ...) fall through to it.
 */
export declare const AnimeTransitionGroup: DefineSetupFnComponent<
  AnimeTransitionGroupProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeTransitionGroupProps & {},
  PublicProps
>
```

:::

## Lifecycle Behavior

- Each child that enters or leaves gets its own Anime.js animation; its transition finishes when that animation completes. CSS transitions are turned off (`css: false`).
- Children that enter in the same update form one batch for `stagger`, and so do children that leave; enters and leaves are counted separately.
- A child that starts leaving while it's still entering (or the reverse) is cancelled where it is, and the new animation starts from there.
- Before each update, every child's position is recorded; after it, each child that changed position animates from where it was to its new place with `move`, through the CSS `translate` property: the layout itself isn't touched, and an `enter` or `leave` that animates `translateX` / `translateY` keeps running alongside. A move still running when the next one starts is replaced by one that starts from where the child is on screen; a child that starts leaving mid-move finishes it.
- On **unmount**, running animations are cancelled.

::: tip
For a single element toggled with `v-if` or swapped with a `key`, use [`AnimeTransition`](/components/anime-transition).
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-transition-group.ts)
