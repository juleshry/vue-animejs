# v-draggable

## Demo

<VDraggableDemo />

Applies an Anime.js [`createDraggable()`](https://animejs.com/documentation/draggable) directly from a template attribute. Makes the element draggable on mount, re-creates it when the binding value changes, and reverts it on unmount.

## Usage

### Basic draggable

```vue
<script setup lang="ts">
import { vDraggable } from "@juleshry/vue-animejs"
</script>

<template>
  <div v-draggable class="box" />
</template>
```

### Constrained to a container

Pass a container element via the `container` option to keep the element within bounds.

::: warning
`container` must be resolved inside a `computed` — a template ref's `.value` is `null` at setup time, so passing it directly in a plain object will result in an unconstrained draggable.
:::

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { vDraggable } from "@juleshry/vue-animejs"

const container = useTemplateRef("container")

const options = computed(() => ({
  container: container.value,
  containerPadding: 10,
}))
</script>

<template>
  <div ref="container" class="stage">
    <div v-draggable="options" class="box" />
  </div>
</template>
```

### Reactive options

Bind a `ref` or `computed` — the draggable is reverted and re-created whenever the value changes.

::: warning
Changing options reverts the current draggable instance and creates a new one from scratch, resetting its position within the container.
:::

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { vDraggable } from "@juleshry/vue-animejs"

const locked = ref(false)

const options = computed(() => ({
  x: !locked.value,
  y: !locked.value,
}))
</script>

<template>
  <div v-draggable="options" class="box" />
  <button @click="locked = !locked">Toggle lock</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js draggable documentation](https://animejs.com/documentation/draggable).

::: details Show Type Declarations

```ts
/**
 * Declarative draggable directive. Makes the element draggable on mount,
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-draggable />
 * <div v-draggable="{ snap: [0, 100] }" />
 */
export declare const vDraggable: Directive<HTMLElement, DraggableParams | undefined>
```

:::

## Lifecycle Behavior

- On **mount**, the draggable is created immediately from the binding value.
- On **update**, if the binding value changed, the previous draggable is **reverted**, then a new one is created from the new value.
- On **unmount**, the draggable is reverted, restoring the element's original styles.

::: tip
The directive works with no binding value at all — `v-draggable` alone makes the element freely draggable with default options.
:::

::: warning
Anime.js instances are tracked per-element internally. Don't apply `v-draggable` to a component root that gets recycled by `v-for` with a non-stable `key` — use a stable `key` so Vue doesn't swap the underlying element unexpectedly.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/directives/v-draggable.ts)
