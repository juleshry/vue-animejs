# AnimeLayout

## Demo

<AnimeLayoutDemo />

Wraps [`useLayout`](/composables/use-layout) into a component: renders a root element, tracks its children, and animates their layout changes.

## Usage

### Animating a layout change

Put a template ref on `AnimeLayout`: it exposes the `useLayout` controls, so the trigger can live anywhere, outside the tracked children. Call `record()` to snapshot the current positions, change the reactive state, then call `animate()` after the next tick so Anime.js interpolates from the old positions to the new ones.

::: warning
`update()` runs its callback **synchronously**, so it only works for changes made directly to the DOM. For a change to Vue reactive state, use `record()` + `await nextTick()` + `animate()`, as below.
:::

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue"
import { AnimeLayout } from "@juleshry/vue-animejs"

const grid = useTemplateRef("grid")
const items = ref([1, 2, 3, 4])

async function shuffle() {
  grid.value?.record()
  items.value = [...items.value].sort(() => Math.random() - 0.5)
  await nextTick()
  grid.value?.animate()
}
</script>

<template>
  <AnimeLayout ref="grid" as="ul" :options="{ duration: 600, ease: 'outExpo' }">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </AnimeLayout>
  <button @click="shuffle">Shuffle</button>
</template>
```

::: tip
On the exposed instance, `layout` is the `AutoLayout` itself, not a ref: Vue unwraps exposed refs, as with `defineExpose`.
:::

### Custom root component

`as` also takes a component, e.g. your own list or grid. Its root element becomes the layout root, so the items have to be its direct children.

::: warning
The component must render a **single root element** with the default slot **directly inside it**: Anime.js tracks the root's children, so a wrapper between the root and the slot hides the items from the layout. A component with several root nodes (a fragment) doesn't work.
:::

```vue
<!-- CardGrid.vue -->
<template>
  <div class="card-grid"><slot /></div>
</template>
```

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeLayout } from "@juleshry/vue-animejs"
import CardGrid from "./CardGrid.vue"

const cards = ref([
  { id: 1, title: "First" },
  { id: 2, title: "Second" },
])
</script>

<template>
  <AnimeLayout :as="CardGrid">
    <article v-for="card in cards" :key="card.id">{{ card.title }}</article>
  </AnimeLayout>
</template>
```

### Reactive options

Bind `options` to reactive values. An inline object literal is fine: the layout is only re-created when its content changes, not on every re-render of the parent.

::: warning
Changing `options` destroys and re-creates the `AutoLayout` instance.
:::

```vue
<script setup lang="ts">
import { ref } from "vue"
import { AnimeLayout } from "@juleshry/vue-animejs"

const duration = ref(400)
</script>

<template>
  <input v-model.number="duration" type="range" min="100" max="1500" />
  <AnimeLayout :options="{ duration, ease: 'outExpo' }">
    <!-- ... -->
  </AnimeLayout>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeLayoutProps {
  /**
   * The root element: a tag name, or a component that renders a single root element with the default slot directly
   * inside it (its children are the tracked ones). Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js auto-layout parameters. An inline object literal only re-creates the layout when its content changes. */
  options?: AutoLayoutParams
}

/** What a template ref on `AnimeLayout` exposes: the `useLayout` controls, with `layout` unwrapped like any exposed ref. */
export type AnimeLayoutExposed = ShallowUnwrapRef<UseLayoutReturn>

declare const component: DefineSetupFnComponent<
  AnimeLayoutProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeLayoutProps & {},
  PublicProps
>

/**
 * Wraps `useLayout` into a component: renders a root element, tracks its children, and animates their layout changes.
 *
 * The `useLayout` controls (`record`, `animate`, `update`, `revert`, `layout`) are exposed on the component instance, so
 * they can be called through a template ref from outside the tracked children. `layout` is unwrapped like any exposed ref.
 */
export declare const AnimeLayout: {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeLayoutExposed
} & typeof component
```

See [`useLayout`](/composables/use-layout#type-declarations) for `UseLayoutReturn`.

:::

## Lifecycle Behavior

- The layout is created on the root element once the component has **mounted**, so nothing runs during SSR and the server HTML is hydrated untouched.
- If `options` changes content, or `as` changes the root element (a tag or a component), the current layout is **reverted** and a new one is created.
- On **unmount**, the layout is reverted automatically.
- All other attributes (`class`, `style`, listeners) fall through to the root element.

::: tip
`AnimeLayout` is a thin wrapper: use [`useLayout`](/composables/use-layout) directly when the tracked container is already in your own template.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-layout.ts)
