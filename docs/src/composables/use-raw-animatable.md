# useRawAnimatable

## Demo

<UseRawAnimatableDemo />

Calls Anime.js `createAnimatable()` directly, returning the raw `AnimatableObject` instance without any Vue lifecycle integration or reactivity wrappers.

## Usage

### Basic usage

::: warning
`useRawAnimatable` does not integrate with Vue's lifecycle. Call it inside `onMounted` when targeting a DOM element so the element exists when the animatable is created.
:::

```vue
<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimatable, UseRawAnimatableReturn } from "@juleshry/vue-animejs"

  const box = useTemplateRef<HTMLElement>("box")
  let animatable: UseRawAnimatableReturn | null = null

  onMounted(() => {
    animatable = useRawAnimatable(box.value!, {
      x: 500,
      y: 500,
      ease: "out(3)",
    })
  })

  function move() {
    animatable?.x(200)
  }
</script>

<template>
  <div ref="box" class="box" />
  <button @click="move">Move</button>
</template>
```

### Manual reverting

Because `useRawAnimatable` returns the raw `AnimatableObject`, you can store it and call Anime.js methods directly.

```vue
<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimatable, UseRawAnimatableReturn } from "@juleshry/vue-animejs"

  const box = useTemplateRef<HTMLElement>("box")
  let animatable: UseRawAnimatableReturn | null = null

  onMounted(() => {
    animatable = useRawAnimatable(box.value!, { x: 300, ease: "out(3)" })
  })
</script>

<template>
  <div ref="box" class="box" />
  <button @click="animatable?.x(200)">Move</button>
  <button @click="animatable?.revert()">Revert</button>
</template>
```

### CSS selector target

You can pass any valid Anime.js `TargetsParam` directly.

```vue
<script setup lang="ts">
  import { useRawAnimatable } from "@juleshry/vue-animejs"

  const animatable = useRawAnimatable(".box", { x: 300, ease: "out(3)" })
</script>

<template>
  <div class="box" />
  <button @click="animatable.x(0)">Reset</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js animatable documentation](https://animejs.com/documentation/animatable).

::: details Show Type Declarations

```ts
/** The Anime.js `AnimatableObject` instance returned by `useRawAnimatable`. */
export type UseRawAnimatableReturn = AnimatableObject

/**
 * Thin wrapper around Anime.js `createAnimatable()`. Resolves the target (unwrapping refs and Vue
 * component refs via `.$el`) and immediately creates the animatable.
 *
 * SSR-safety is the caller's responsibility: invoke this from inside your own `onMounted` (it runs
 * unconditionally and immediately, with no client-only guard), never at `setup()` top level.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a Vue component ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useRawAnimatable(
  targets: MaybeRef<TargetsParam> | Ref<ComponentPublicInstance>,
  options?: MaybeRef<AnimatableParams>
): AnimatableObject
```

:::

## Behavior

- `useRawAnimatable` is a **thin escape hatch** — it resolves `targets`, unrefs `options`, then delegates directly to Anime.js `createAnimatable()`.
- There is **no reactivity**: changing `targets` or `options` after the call does nothing.
- There is **no automatic cleanup**: the animatable is not reverted on component unmount. You must call `animatable.revert()` yourself in `onUnmounted` if needed.
- The return value is the raw Anime.js `AnimatableObject` instance — not a Vue ref.
- **SSR-safety is your responsibility.** Unlike `useAnimatable`, `useRawAnimatable` has no client-only guard — call it from inside `onMounted`, never at the top level of `setup()`, or it will run (and can throw) during server rendering.

::: tip
Prefer [`useAnimatable`](./use-animatable) for typical use cases. Use `useRawAnimatable` only when you need direct access to the `AnimatableObject` instance and want to manage the lifecycle yourself.
:::

::: warning
Passing a template ref as `targets` outside of `onMounted` (or a post-flush watcher) will warn and produce an animatable bound to `undefined`.
:::

## Source

[`use-raw-animatable.ts`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-raw-animatable.ts)