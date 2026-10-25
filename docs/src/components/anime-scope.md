# AnimeScope

## Demo

<AnimeScopeDemo />

Wraps [`useScope`](/composables/use-scope) into a component: renders a root element and creates an Anime.js scope rooted on it, so selectors in the scope's methods only match inside it, and its defaults and media queries apply to them.

## Usage

### Scoped selectors

A selector used in a scope method only matches inside the component. A reusable component can then animate `.dot` without touching the `.dot`s of its other instances on the page.

Register methods from your own `onMounted` through a template ref: the scope already exists by then, since a child mounts before its parent. Call a named method with `scope.methods.<name>()`.

::: warning
Register methods once, in `onMounted`, not in a click handler: every registered method is kept and replayed whenever the scope is re-created, so registering on each click piles them up. Use `registerMethod()` and call the method from the handler instead.
:::

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { animate, stagger } from "animejs"
import { AnimeScope } from "@juleshry/vue-animejs"

const dots = useTemplateRef("dots")

onMounted(() => {
  dots.value?.registerMethod("pulse", () => {
    animate(".dot", { scale: [1, 1.5, 1], delay: stagger(80) })
  })
})
</script>

<template>
  <AnimeScope ref="dots">
    <span v-for="i in 5" :key="i" class="dot" />
  </AnimeScope>
  <button @click="dots?.scope?.methods.pulse()">Pulse</button>
</template>
```

### Defaults and media queries

`options.defaults` applies to every animation created in the scope's methods. With `options.mediaQueries`, the scope re-runs its methods whenever a query starts or stops matching, and `scope.matches` tells them which ones match.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { animate } from "animejs"
import { AnimeScope } from "@juleshry/vue-animejs"

const hero = useTemplateRef("hero")

onMounted(() => {
  hero.value?.add(scope => {
    const distance = scope?.matches.narrow ? 40 : 120
    animate(".title", { translateX: [-distance, 0], opacity: [0, 1] })
  })
})
</script>

<template>
  <AnimeScope
    ref="hero"
    as="header"
    :options="{
      defaults: { duration: 800, ease: 'outExpo' },
      mediaQueries: { narrow: '(max-width: 640px)' },
    }"
  >
    <h1 class="title">Hello</h1>
  </AnimeScope>
</template>
```

::: warning
The scope only applies to what runs inside its methods. A child component's own `useAnimate` or `v-animate` isn't part of the scope and doesn't get its defaults.
:::

### Custom root component

`as` also takes a component. Its root element becomes the scope's root.

::: warning
The component must render a **single root element** with the default slot inside it. A component with several root nodes (a fragment) doesn't work.
:::

```vue
<template>
  <AnimeScope ref="scope" :as="CardGrid">
    <article class="card">…</article>
  </AnimeScope>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface AnimeScopeProps {
  /**
   * The root element: a tag name, or a component that renders a single root element with the default slot directly
   * inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js scope parameters, without `root`: the root element is the scope's root. An inline object literal only re-creates the scope when its content changes. */
  options?: Omit<ScopeParams, "root">
}

/** What a template ref on `AnimeScope` exposes: the `useScope` controls, with `scope` unwrapped like any exposed ref. */
export type AnimeScopeExposed = ShallowUnwrapRef<UseScopeReturn>

declare const component: DefineSetupFnComponent<
  AnimeScopeProps,
  {},
  SlotsType<{
    default?: () => VNode[]
  }>,
  AnimeScopeProps & {},
  PublicProps
>

/**
 * Wraps `useScope` into a component: renders a root element and creates an Anime.js scope rooted on it, so selectors in
 * the scope's methods only match inside it, and its defaults and media queries apply to them.
 *
 * The `useScope` controls (`add`, `addOnce`, `registerMethod`, `keepTime`, `refresh`, `revert`, `scope`) are exposed on
 * the component instance, to be called through a template ref. `scope` is unwrapped like any exposed ref.
 */
export declare const AnimeScope: {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeScopeExposed
} & typeof component
```

See [`useScope`](/composables/use-scope#type-declarations) for `UseScopeReturn`.

:::

## Lifecycle Behavior

- The scope is created on the root element once the component has **mounted**, so nothing runs during SSR and the server HTML is hydrated untouched.
- If `options` changes content, or `as` changes the root element (a tag or a component), the current scope is **reverted** and a new one is created on the current root. Every method registered so far is replayed on it.
- On **unmount**, the scope is reverted automatically, undoing every animation its methods created.
- All other attributes (`class`, `style`, listeners) fall through to the root element.

::: tip
`AnimeScope` is a thin wrapper: use [`useScope`](/composables/use-scope) with `{ root }` set to a template ref when the root element is already in your own template.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/components/anime-scope.ts)
