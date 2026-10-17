# useScope

## Demo

<UseScopeDemo />

Wraps Anime.js [`createScope()`](https://animejs.com/documentation/scope) into a Vue composable. Animations added to the scope are grouped together and can be reverted or refreshed all at once; the scope itself is cleaned up automatically on unmount.

## Usage

### Basic usage

Call `add()` with a callback to run animations inside the scope. Any `useRawAnimate()`, `createTimer()`, or other Anime.js tickables created inside that callback are tracked by the scope. Calling `revert()` undoes all of them at once and restores the original DOM state.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useScope, useRawAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLDivElement>("box")

const { add, revert } = useScope({})

add(() => {
  useRawAnimate(box, { translateX: 200, duration: 600, loop: true, alternate: true })
})
</script>

<template>
  <div ref="box" class="box" />
  <button @click="revert">Revert all</button>
</template>
```

### Scoped defaults

Pass `defaults` to share animation parameters across everything created inside the scope. Individual `useRawAnimate()` calls can still override them.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useScope, useRawAnimate } from "@juleshry/vue-animejs"

const a = useTemplateRef<HTMLDivElement>("a")
const b = useTemplateRef<HTMLDivElement>("b")
const c = useTemplateRef<HTMLDivElement>("c")

const { add, revert, refresh } = useScope({
  defaults: { ease: "outElastic(1, 0.5)", duration: 900 },
})

add(() => {
  useRawAnimate(a, { translateX: 120, loop: true, alternate: true })
  useRawAnimate(b, { translateX: 120, delay: 150, loop: true, alternate: true })
  useRawAnimate(c, { translateX: 120, delay: 300, loop: true, alternate: true })
})
</script>

<template>
  <div ref="a" class="box" />
  <div ref="b" class="box" />
  <div ref="c" class="box" />
  <button @click="revert">Revert all</button>
  <button @click="refresh">Refresh</button>
</template>
```

`refresh()` re-runs all `add()` callbacks, recreating every tracked animation from scratch. Use it after a `revert()` to restart, or whenever you want to apply updated parameters.

### Media query-aware scope

Use `mediaQueries` to register media query listeners. The scope's `matches` object updates automatically and `refresh()` is called on every change, letting you branch animation behaviour based on the user's environment — for example, to respect `prefers-reduced-motion`.

```vue
<script setup lang="ts">
import { useTemplateRef, ref } from "vue"
import { useScope, useRawAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLDivElement>("box")
const isNarrow = ref(false)

const { add } = useScope({
  mediaQueries: {
    reducedMotion: "(prefers-reduced-motion: reduce)",
    narrow: "(max-width: 768px)",
  },
})

add((scope) => {
  isNarrow.value = scope.matches.narrow
  const duration = scope.matches.reducedMotion ? 0 : 600
  const distance = scope.matches.narrow ? 80 : 200
  useRawAnimate(box, { translateX: distance, duration, loop: true, alternate: true })
})
</script>

<template>
  <div ref="box" class="box" />
  <p>narrow: {{ isNarrow }}</p>
</template>
```

### Named methods

Use `registerMethod()` to attach reusable callbacks to the scope. The method is stored under `scope.value.methods[name]` and can be called at any time.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useScope, useRawAnimate } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLDivElement>("box")

const { scope, registerMethod } = useScope({})

registerMethod("bounce", () => {
  useRawAnimate(box, { translateY: [-20, 0], ease: "outBounce", duration: 600 })
})

function trigger() {
  scope.value.methods.bounce()
}
</script>

<template>
  <div ref="box" class="box" />
  <button @click="trigger">Bounce</button>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseScopeReturn {
  /** The underlying Anime.js `Scope` instance. */
  scope: Readonly<ShallowRef<Scope | undefined>>
  /** Registers an anonymous method on the scope. Queued automatically if called before mount. */
  add: (method: ScopeMethod) => void
  /** Registers a named method on the scope so it can be called via `scope.methods[name]()`. Queued automatically if called before mount. */
  registerMethod: (methodName: string, method: ScopeMethod) => void
  /** Registers a method that runs exactly once on the scope. Queued automatically if called before mount. */
  addOnce: (method: ScopeMethod) => void
  /** Keeps the time of another tickable (animation, timer) in sync with this scope. */
  keepTime: (method: (scope: Scope) => Tickable) => void
  /** Cancels the scope and reverts all animations and tickables it owns. */
  revert: () => void
  /** Re-reads default values and media-query breakpoints for the scope. */
  refresh: () => void
}
/**
 * Wraps Anime.js `createScope()` into a Vue composable. Reactively re-creates the scope when params change, replays all registered methods, and reverts it automatically on unmount.
 *
 * Methods added before mount are queued and replayed once the component is mounted. When `params` change, every
 * method registered so far is replayed on the new scope.
 *
 * @param params - Anime.js scope parameters. Accepts a plain object or a reactive ref / computed.
 */
export declare function useScope(params: MaybeRef<ScopeParams>): UseScopeReturn
```

:::

## Reactivity & Lifecycle

- The scope is created once the component has **mounted** — `scope` is `undefined` until then.
- If `params` is a `ref` or `computed` and its value changes (including a property mutated in place), the current scope is **reverted** and a new one is created with the updated parameters. Every method registered so far through `add()`, `registerMethod()` and `addOnce()` is replayed on the new scope, in registration order.
- Calls to `add()`, `registerMethod()`, and `addOnce()` made before the component mounts are **queued** and executed in `onMounted` — so calling `add()` at the top level of `<script setup>` is safe and idiomatic.
- When `mediaQueries` are provided, the scope automatically calls `refresh()` whenever a media query match changes.
- On component **unmount**, `scope.revert()` is called automatically, removing all tracked animations from the DOM.

::: tip
`revert()` restores the DOM to its state before any animations in the scope ran — not just stops them. Use it as a clean reset rather than a pause. Follow it with `refresh()` to restart all animations from scratch.
:::

::: warning
`scope` is a readonly shallow ref. Access the underlying Anime.js instance via `scope.value` for low-level operations like `scope.value.methods`, but prefer the composable's helper functions for normal use.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-scope.ts)
