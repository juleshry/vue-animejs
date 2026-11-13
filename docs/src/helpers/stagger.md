# stagger

## Demo

<StaggerDemo />

Anime.js's [`stagger`](https://animejs.com/documentation/utilities/stagger), with its values computed per animation instead of once per function.

## Usage

### With a target that changes

Anime.js's `stagger()` computes its spread on the first animation that uses it and reuses it afterwards. The composables rebuild their instance from the **same options** whenever the target changes (a getter or ref target, a text re-split, a timeline rebuild), so with Anime.js's `stagger()`, targets past the first animation's count start with no delay, and `from: "center"` / `"last"` keeps the old center. Import `stagger` from `@juleshry/vue-animejs` instead: it starts over for every animation, so the spread is right whatever the target count.

```vue
<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { stagger, useAnimate } from "@juleshry/vue-animejs"

  const list = useTemplateRef("list") // a child component that exposes `items: HTMLElement[]`

  useAnimate(() => list.value?.items, { opacity: [0, 1], delay: stagger(40) })
</script>
```

It takes the same arguments as Anime.js's (`number`, `string`, `[from, to]` range, and the same parameters, each of which may also be a ref, see below), so it works anywhere Anime.js's does: a property value, `delay`, `duration`, or a timeline position.

```ts
import { stagger } from "@juleshry/vue-animejs"

useAnimate(items, { translateX: stagger([0, 200]), delay: stagger(100, { from: "center" }) })
tl.add(items, { opacity: [0, 1] }, stagger(50))
```

::: warning
Both functions are named `stagger`. To use them in the same file, alias one of them: `import { stagger as animeStagger } from "animejs"`.
:::

### Reactive values

The value and the parameters can be refs or getters, and so can each parameter. They're read each time an animation is created, so a rebuild (a new target, another option changing) uses their current values. The composables don't watch them: changing one doesn't rebuild the animation by itself.

```ts
const step = ref(40)

// A new list of items rebuilds the animation, with the current `step`
useAnimate(() => list.value?.items, { opacity: [0, 1], delay: stagger(step) })
```

To re-create the animation when the stagger's value changes, build the options in a getter: the getter reads `step`, and each rebuild gets a new `stagger()`.

```vue
<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { stagger, useAnimate } from "@juleshry/vue-animejs"

  const items = useTemplateRef<HTMLElement[]>("items")
  const step = ref(40)
  const from = ref<"first" | "center" | "last">("first")

  useAnimate(items, () => ({ opacity: [0, 1], delay: stagger(step.value, { from: from.value }) }))
</script>

<template>
  <input v-model.number="step" type="range" min="0" max="200" />
  <select v-model="from">
    <option>first</option>
    <option>center</option>
    <option>last</option>
  </select>
  <ul>
    <li v-for="i in 8" :key="i" ref="items">{{ i }}</li>
  </ul>
</template>
```

### In a directive

Our `stagger()` is compared by its arguments, so changing one re-creates the directive's animation. Anime.js's `stagger()` is compared by its source, which is the same for every argument, so changing only its argument needs a `:key` on the element.

::: warning
A directive only re-creates its animation when its binding changes on a re-render; it doesn't watch refs. Pass the ref's value in the template (`stagger(step)`, which the template unwraps) so the component re-renders when it changes. A ref nested in an options object defined in script (`const opts = { delay: stagger(step) }`) is compared by reference, and changing it doesn't re-create the animation: build `opts` in a `computed` from `step.value` instead.
:::

```vue
<template>
  <ul v-animate="{ opacity: [0, 1], delay: stagger(step) }">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
/** What `stagger()` takes as its value: a number, a unit string or a `[from, to]` range. */
export type StaggerValue = number | string | [number, number] | [string, string]
/**
 * Anime.js's [`stagger`](https://animejs.com/documentation/utilities/stagger), with its values
 * computed per animation instead of once per function.
 *
 * Anime.js's `stagger()` computes its spread on the first animation that uses it and reuses it
 * afterwards. The composables rebuild their instance from the same options when the target changes
 * (a getter or ref target, a text re-split, a timeline rebuild), so with Anime.js's `stagger()`
 * targets past the first animation's count start with no delay, and `from: "center" | "last"` keeps
 * the old center. This one starts over for every animation (keyed on the animation's targets
 * array), so it's correct whatever the target count. A direct call outside an animation (no
 * `targets` argument) behaves like Anime.js's.
 *
 * The value and the parameters may be refs or getters, and so may each parameter: they are read
 * each time an animation is created, so a rebuild uses their current values. The composables don't
 * watch them: changing one doesn't re-create the animation by itself. (They are read while
 * Anime.js creates the animation, so if you create one inside your own `watchEffect` or
 * `computed`, that effect does depend on them.)
 *
 * Same name as Anime.js's and accepts everything it does, so it's a drop-in: import it from
 * `@juleshry/vue-animejs` (alias one of them when you need both in one file).
 *
 * @param val - The staggered value, or a `[from, to]` range.
 * @param params - Anime.js's stagger parameters (`from`, `grid`, `ease`, `start`, …).
 */
export declare function stagger(val: MaybeRefOrGetter<number>, params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>): StaggerFunction<number>
export declare function stagger(val: MaybeRefOrGetter<string>, params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>): StaggerFunction<string>
export declare function stagger(val: MaybeRefOrGetter<[number, number]>, params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>): StaggerFunction<number>
export declare function stagger(val: MaybeRefOrGetter<[string, string]>, params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>): StaggerFunction<string>
export declare function stagger(val: MaybeRefOrGetter<StaggerValue>, params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>): StaggerFunction<number | string>
```

:::

## Behavior

- Anime.js calls a function value with the animation's targets array, built once per animation (a `animate()` / `waapi.animate()` call, or a staggered timeline `add`). `stagger()` keeps one Anime.js stagger per targets array, so each animation gets its own spread, and it's dropped with the animation.
- `refresh()` reuses the animation's values, as with Anime.js's `stagger()`.
- Reusing one `stagger()` across several timeline `add` calls positions each group after the previous one, where Anime.js's reuses the first group's start.
- Called directly, outside an animation (no targets argument), it behaves like Anime.js's: one spread, computed on the first call.
- Refs and getters passed as the value, the parameters or a parameter are read once per animation, when Anime.js first calls the stagger for it. The composables don't watch them: changing one doesn't re-create the animation, the next rebuild picks it up. They're read while Anime.js creates the animation, so if you create one yourself inside a `watchEffect` or `computed`, that effect does depend on them.
- `stagger(60)` and `stagger(60, {})` count as the same binding in a directive.
- Creating it does nothing in Anime.js until an animation calls it, so it's safe to call during SSR.

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/helpers/stagger.ts)
