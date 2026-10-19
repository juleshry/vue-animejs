# useLayout

## Demo

<UseLayoutDemo />

Wraps Anime.js [`createLayout()`](https://animejs.com/documentation/layout) into a Vue composable. Reactively re-creates the layout observer when the root element or params change, and reverts it automatically on unmount.

## Usage

### Animating a layout change

Use `record()` to snapshot current positions, mutate the DOM (via reactive state), then call `animate()` after the next tick so Anime.js interpolates from the old positions to the new ones.

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue"
import { useLayout } from "@juleshry/vue-animejs"

const container = useTemplateRef("container")
const items = ref([1, 2, 3, 4])

const { record, animate } = useLayout(container)

async function shuffle() {
  record()
  items.value = [...items.value].sort(() => Math.random() - 0.5)
  await nextTick()
  animate({ duration: 600, ease: "outExpo" })
}
</script>

<template>
  <div ref="container" class="grid">
    <div v-for="item in items" :key="item">{{ item }}</div>
  </div>
  <button @click="shuffle">Shuffle</button>
</template>
```

### Using `update()` for non-reactive changes

When the layout change is purely DOM-driven (no Vue reactive state involved), `update()` records, runs the callback synchronously, then animates — all in one call.

::: warning
`update()` runs its callback **synchronously**. If your callback mutates Vue reactive state, the DOM won't have updated yet when `animate()` is called. In that case, use the `record()` + `await nextTick()` + `animate()` pattern instead.
:::

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useLayout } from "@juleshry/vue-animejs"

const container = useTemplateRef("container")
const { layout, update } = useLayout(container)

function moveFirst() {
  update(instance => {
    const el = instance.root as HTMLElement
    el.appendChild(el.firstElementChild!)
  }, { duration: 500, ease: "outExpo" })
}
</script>

<template>
  <div ref="container">
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </div>
  <button @click="moveFirst">Move first to end</button>
</template>
```

### Reactive params

Put a `ref` straight into the params object to change layout options reactively. The whole params object can also be a `ref`, a `computed` or a getter.

::: warning
Changing `params` destroys and re-creates the `AutoLayout` instance.
:::

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { useLayout } from "@juleshry/vue-animejs"

const container = useTemplateRef("container")
const duration = ref(400)

const { record, animate } = useLayout(container, { ease: "outExpo", duration })
</script>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseLayoutReturn {
  /** The underlying Anime.js `AutoLayout` instance. `undefined` until the root element is available. */
  layout: Readonly<ShallowRef<AutoLayout | undefined>>
  /** Snapshots the current positions of all tracked children so the next layout change can be animated. */
  record: () => void
  /** Animates all children from their recorded positions to their new positions. */
  animate: (params?: LayoutAnimationParams) => Timeline | undefined
  /** Records, applies the callback (which triggers a layout change), then animates the transition. */
  update: (callback: (layout: AutoLayout) => void, params?: LayoutAnimationParams) => void
  /** Cancels the layout watcher and restores all elements to their original state. */
  revert: () => void
}

/**
 * Wraps Anime.js `createLayout()` into a Vue composable. Reactively re-creates the layout observer when the root element or params change, and reverts it automatically on unmount.
 *
 * @param root - The container element whose children will be tracked. Accepts a template ref, a CSS selector, or a reactive ref to either.
 * @param params - Anime.js auto-layout parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties.
 */
export declare function useLayout(
  root: MaybeRef<DOMTargetSelector> | MaybeComputedElementRef,
  params?: MaybeRefOrGetter<MaybeRefOptions<AutoLayoutParams>>
): UseLayoutReturn
```

:::

## Reactivity Behavior

- The layout is created once the component has **mounted**, whatever form `root` takes (template ref, selector, element), so a selector can point into the component's own template, and server-rendered HTML is never touched before hydration.
- A template ref that is still empty at mount (e.g. behind a `v-if`) creates the layout as soon as it resolves.
- If either `root` or `params` changes, the current layout is **reverted** and a new one is created. For `params`, that means a new object in a ref / computed / getter, a ref inside it changing, or a property of a reactive object mutated in place.
- On component **unmount**, the layout watcher is stopped and the layout is reverted automatically.

::: tip
When animating Vue-driven layout changes (v-for reorders, conditional rendering), always use `record()` → mutate state → `await nextTick()` → `animate()`. This ensures Anime.js captures positions before **and** after Vue has flushed its DOM update.
:::

::: warning
`layout` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-layout.ts)
